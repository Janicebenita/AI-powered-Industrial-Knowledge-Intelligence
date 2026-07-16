import argparse
import io
import random
import zipfile
from pathlib import Path

import torch
import torch.nn as nn
from PIL import Image, ImageOps
from torch.utils.data import DataLoader, Dataset
from torchvision import models, transforms


IMAGE_EXTS = (".jpg", ".jpeg", ".png", ".bmp")


def list_zip_images(zip_path, include_text=None):
    with zipfile.ZipFile(zip_path) as zf:
        names = [
            name
            for name in zf.namelist()
            if name.lower().endswith(IMAGE_EXTS)
            and (include_text is None or include_text.lower() in name.lower())
        ]
    return sorted(names)


def list_dir_images(root):
    root = Path(root)
    return sorted([p for p in root.rglob("*") if p.suffix.lower() in IMAGE_EXTS])


class LslDataset(Dataset):
    def __init__(self, samples, image_size=224, train=True):
        self.samples = samples
        if train:
            self.transform = transforms.Compose(
                [
                    transforms.Resize((image_size, image_size)),
                    transforms.RandomApply([transforms.ColorJitter(brightness=0.12, contrast=0.18)], p=0.6),
                    transforms.RandomRotation(4),
                    transforms.ToTensor(),
                    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
                ]
            )
        else:
            self.transform = transforms.Compose(
                [
                    transforms.Resize((image_size, image_size)),
                    transforms.ToTensor(),
                    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
                ]
            )

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        source, item, label = self.samples[idx]
        if source == "zip":
            zip_path, member = item
            with zipfile.ZipFile(zip_path) as zf:
                data = zf.read(member)
            image = Image.open(io.BytesIO(data))
        else:
            image = Image.open(item)

        image = ImageOps.exif_transpose(image).convert("L")
        image = ImageOps.autocontrast(image).convert("RGB")
        return self.transform(image), int(label)


def make_model(num_classes=2):
    model = models.resnet18(weights=models.ResNet18_Weights.IMAGENET1K_V1)
    model.fc = nn.Linear(model.fc.in_features, num_classes)
    return model


def make_samples(args):
    samples = []

    if args.l_zip:
        l_members = list_zip_images(args.l_zip, args.l_zip_include)
        samples.extend(("zip", (args.l_zip, member), 1) for member in l_members)
    if args.l_dir:
        samples.extend(("dir", path, 1) for path in list_dir_images(args.l_dir))

    if args.sl_zip:
        sl_members = list_zip_images(args.sl_zip, args.sl_zip_include)
        samples.extend(("zip", (args.sl_zip, member), 0) for member in sl_members)
    if args.sl_dir:
        samples.extend(("dir", path, 0) for path in list_dir_images(args.sl_dir))

    labels = [sample[2] for sample in samples]
    if not labels or 0 not in labels or 1 not in labels:
        raise SystemExit(
            "Training requires both classes. Provide lesion-positive data with --l-zip/--l-dir "
            "and lesion-negative/healthy data with --sl-zip/--sl-dir."
        )
    return samples


def split_samples(samples, val_fraction=0.15, seed=42):
    rng = random.Random(seed)
    by_label = {0: [], 1: []}
    for sample in samples:
        by_label[sample[2]].append(sample)

    train, val = [], []
    for label_samples in by_label.values():
        rng.shuffle(label_samples)
        val_count = max(1, int(len(label_samples) * val_fraction))
        val.extend(label_samples[:val_count])
        train.extend(label_samples[val_count:])

    rng.shuffle(train)
    rng.shuffle(val)
    return train, val


def evaluate(model, loader, device):
    model.eval()
    correct, total, loss_total = 0, 0, 0.0
    criterion = nn.CrossEntropyLoss()
    with torch.no_grad():
        for images, labels in loader:
            images, labels = images.to(device), labels.to(device)
            logits = model(images)
            loss = criterion(logits, labels)
            loss_total += float(loss.item()) * labels.size(0)
            correct += int((logits.argmax(1) == labels).sum().item())
            total += labels.size(0)
    return loss_total / max(1, total), correct / max(1, total)


def train(args):
    samples = make_samples(args)
    if args.max_per_class:
        rng = random.Random(args.seed)
        limited = []
        for label in [0, 1]:
            label_samples = [sample for sample in samples if sample[2] == label]
            rng.shuffle(label_samples)
            limited.extend(label_samples[: args.max_per_class])
        samples = limited

    train_samples, val_samples = split_samples(samples, args.val_fraction, args.seed)
    train_ds = LslDataset(train_samples, args.image_size, train=True)
    val_ds = LslDataset(val_samples, args.image_size, train=False)
    train_loader = DataLoader(train_ds, batch_size=args.batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_ds, batch_size=args.batch_size, shuffle=False, num_workers=0)

    device = torch.device("cuda" if torch.cuda.is_available() and not args.cpu else "cpu")
    model = make_model(num_classes=2).to(device)

    counts = torch.tensor(
        [sum(1 for sample in train_samples if sample[2] == 0), sum(1 for sample in train_samples if sample[2] == 1)],
        dtype=torch.float32,
    )
    weights = (counts.sum() / torch.clamp(counts, min=1)).to(device)
    criterion = nn.CrossEntropyLoss(weight=weights)
    optimizer = torch.optim.AdamW(model.parameters(), lr=args.lr, weight_decay=1e-4)

    best_acc = -1.0
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)

    print(f"Device: {device}")
    print(f"Train: {len(train_samples)}  Val: {len(val_samples)}")
    print(f"Classes: ['SL', 'L']")

    for epoch in range(1, args.epochs + 1):
        model.train()
        running, total = 0.0, 0
        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()
            logits = model(images)
            loss = criterion(logits, labels)
            loss.backward()
            optimizer.step()
            running += float(loss.item()) * labels.size(0)
            total += labels.size(0)

        val_loss, val_acc = evaluate(model, val_loader, device)
        train_loss = running / max(1, total)
        print(f"epoch={epoch:03d} train_loss={train_loss:.4f} val_loss={val_loss:.4f} val_acc={val_acc:.4f}")

        if val_acc >= best_acc:
            best_acc = val_acc
            torch.save(
                {
                    "classes": ["SL", "L"],
                    "image_size": args.image_size,
                    "model_state": model.cpu().state_dict(),
                    "val_acc": best_acc,
                    "train_count": len(train_samples),
                    "val_count": len(val_samples),
                },
                output,
            )
            model.to(device)

    print(f"Saved best checkpoint to {output} with val_acc={best_acc:.4f}")


def parse_args():
    parser = argparse.ArgumentParser(description="Train ResNet18 L/SL classifier for EndoXAI Grad-CAM.")
    parser.add_argument("--l-zip", default=None, help="ZIP containing lesion-positive panoramic images.")
    parser.add_argument("--l-zip-include", default="Periapical Lesions", help="Substring used to select positive images inside ZIP.")
    parser.add_argument("--l-dir", default=None, help="Directory containing lesion-positive images.")
    parser.add_argument("--sl-zip", default=None, help="ZIP containing lesion-negative/healthy images.")
    parser.add_argument("--sl-zip-include", default=None, help="Substring used to select negative images inside ZIP.")
    parser.add_argument("--sl-dir", default=None, help="Directory containing lesion-negative/healthy images.")
    parser.add_argument("--output", default="resnet_lsl_model.pt")
    parser.add_argument("--image-size", type=int, default=224)
    parser.add_argument("--epochs", type=int, default=12)
    parser.add_argument("--batch-size", type=int, default=16)
    parser.add_argument("--lr", type=float, default=3e-4)
    parser.add_argument("--val-fraction", type=float, default=0.15)
    parser.add_argument("--max-per-class", type=int, default=0, help="Optional cap per class for quick tests.")
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--cpu", action="store_true")
    return parser.parse_args()


if __name__ == "__main__":
    train(parse_args())
