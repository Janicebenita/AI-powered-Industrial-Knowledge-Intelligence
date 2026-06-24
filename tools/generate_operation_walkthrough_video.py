from __future__ import annotations

import math
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "demo-video"
OUT_FILE = OUT_DIR / "Industrial_Brain_AI_Full_Operation_Walkthrough.mp4"
POSTER_FILE = OUT_DIR / "Industrial_Brain_AI_Full_Operation_Poster.png"

W, H = 1280, 720
FPS = 12

BG = (5, 8, 22)
NAV = (7, 12, 29)
CARD = (29, 40, 62)
CARD_2 = (34, 50, 72)
BLUE = (59, 130, 246)
CYAN = (6, 182, 212)
PURPLE = (139, 92, 246)
GREEN = (34, 197, 94)
AMBER = (245, 158, 11)
RED = (239, 68, 68)
TEXT = (255, 255, 255)
MUTED = (148, 163, 184)


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    candidates = [
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
    ]
    for candidate in candidates:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


F_TITLE = font(38, True)
F_H1 = font(28, True)
F_H2 = font(20, True)
F_BODY = font(17)
F_SMALL = font(14)
F_TINY = font(12)


def ease(t: float) -> float:
    return 1 - (1 - t) ** 3


def rounded(draw: ImageDraw.ImageDraw, box, radius: int, fill, outline=None, width: int = 1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def text(draw: ImageDraw.ImageDraw, xy, value: str, fnt, fill=TEXT, max_width: int | None = None):
    x, y = xy
    if not max_width:
        draw.text((x, y), value, font=fnt, fill=fill)
        return
    words = value.split()
    line = ""
    for word in words:
        test = f"{line} {word}".strip()
        if draw.textlength(test, font=fnt) <= max_width:
            line = test
        else:
            draw.text((x, y), line, font=fnt, fill=fill)
            y += fnt.size + 6
            line = word
    if line:
        draw.text((x, y), line, font=fnt, fill=fill)


def gradient_bg() -> Image.Image:
    img = Image.new("RGBA", (W, H), (*BG, 255))
    arr = np.array(img).astype(np.float32)
    yy, xx = np.mgrid[0:H, 0:W]
    g1 = np.exp(-(((xx - 120) ** 2 + (yy - 70) ** 2) / (2 * 240**2)))
    g2 = np.exp(-(((xx - 1160) ** 2 + (yy - 100) ** 2) / (2 * 300**2)))
    arr[..., 0] += g1 * 20 + g2 * 6
    arr[..., 1] += g1 * 42 + g2 * 32
    arr[..., 2] += g1 * 90 + g2 * 75
    arr = np.clip(arr, 0, 255).astype(np.uint8)
    img = Image.fromarray(arr, "RGBA")
    d = ImageDraw.Draw(img, "RGBA")
    for x in range(0, W, 36):
        d.line((x, 0, x, H), fill=(148, 163, 184, 16))
    for y in range(0, H, 36):
        d.line((0, y, W, y), fill=(148, 163, 184, 16))
    return img


NAV_ITEMS = [
    "Dashboard",
    "AI Copilot",
    "Documents",
    "Knowledge Graph",
    "Entities",
    "Asset 360",
    "Maintenance",
    "RCA Assistant",
    "Compliance",
    "Lessons",
    "Reports",
    "Admin",
]

SHELL_CACHE: dict[str, Image.Image] = {}


def shell(active: str) -> Image.Image:
    if active in SHELL_CACHE:
        return SHELL_CACHE[active].copy()

    img = gradient_bg()
    d = ImageDraw.Draw(img, "RGBA")
    rounded(d, (12, 12, 252, 708), 20, (*NAV, 235), (255, 255, 255, 28))
    rounded(d, (28, 28, 70, 70), 12, (*BLUE, 255))
    text(d, (39, 40), "IB", F_SMALL, TEXT)
    text(d, (82, 30), "Industrial Brain AI", F_SMALL, TEXT)
    text(d, (82, 51), "Operations Intelligence", F_TINY, MUTED)
    for i, item in enumerate(NAV_ITEMS):
        y = 105 + i * 46
        is_active = item == active
        rounded(d, (25, y, 238, y + 36), 11, (*BLUE, 245) if is_active else (255, 255, 255, 8))
        d.ellipse((42, y + 12, 52, y + 22), fill=(255, 255, 255, 220) if is_active else (*MUTED, 180))
        text(d, (65, y + 9), item, F_SMALL, TEXT if is_active else MUTED)

    rounded(d, (272, 12, 1268, 72), 0, (8, 14, 32, 230), (255, 255, 255, 22))
    rounded(d, (300, 26, 720, 58), 10, (255, 255, 255, 12), (255, 255, 255, 24))
    text(d, (326, 34), "Search assets, SOPs, work orders, regulations, citations...", F_TINY, MUTED)
    rounded(d, (902, 26, 1000, 58), 10, (34, 197, 94, 35), (34, 197, 94, 90))
    text(d, (925, 35), "AI online", F_TINY, (187, 247, 208))
    rounded(d, (1016, 26, 1112, 58), 10, (6, 182, 212, 35), (6, 182, 212, 90))
    text(d, (1042, 35), "Plant A", F_TINY, (165, 243, 252))
    rounded(d, (1130, 26, 1248, 58), 10, (255, 255, 255, 12), (255, 255, 255, 25))
    text(d, (1156, 35), "Plant Manager", F_TINY, TEXT)
    SHELL_CACHE[active] = img
    return img.copy()


def cursor(draw: ImageDraw.ImageDraw, x: int, y: int, click: bool = False):
    pts = [(x, y), (x, y + 28), (x + 8, y + 21), (x + 15, y + 36), (x + 22, y + 32), (x + 15, y + 18), (x + 28, y + 18)]
    draw.polygon(pts, fill=(255, 255, 255, 245), outline=(5, 8, 22, 255))
    if click:
        draw.ellipse((x - 20, y - 20, x + 44, y + 44), outline=(*CYAN, 190), width=4)


def progress(draw, box, pct: float, color=CYAN):
    x1, y1, x2, y2 = box
    rounded(draw, box, 9, (255, 255, 255, 15))
    rounded(draw, (x1, y1, int(x1 + (x2 - x1) * pct), y2), 9, (*color, 230))


def title(draw, eyebrow: str, heading: str, body: str):
    text(draw, (292, 100), eyebrow.upper(), F_TINY, CYAN)
    text(draw, (292, 124), heading, F_TITLE, TEXT)
    text(draw, (292, 176), body, F_BODY, MUTED, 760)


def metric(draw, x, y, label, value, detail, color=CYAN):
    rounded(draw, (x, y, x + 210, y + 100), 16, (255, 255, 255, 18), (255, 255, 255, 34))
    draw.rectangle((x, y, x + 210, y + 4), fill=(*color, 230))
    text(draw, (x + 16, y + 16), label, F_TINY, MUTED)
    text(draw, (x + 16, y + 38), value, F_H1, TEXT)
    text(draw, (x + 16, y + 74), detail, F_TINY, (203, 213, 225))


def dashboard(frame_t: float) -> Image.Image:
    img = shell("Dashboard")
    d = ImageDraw.Draw(img, "RGBA")
    title(d, "Step 1", "Open Executive Command Dashboard", "The walkthrough starts in the plant cockpit with live KPIs, risk signals, compliance readiness, and AI citation coverage.")
    xs = [292, 520, 748, 976]
    data = [("Documents", "1,284", "+18 this week", CYAN), ("Assets", "426", "94% coverage", BLUE), ("Compliance", "82%", "audit ready", GREEN), ("Critical Risks", "14", "requires action", RED)]
    for i, item in enumerate(data):
        metric(d, xs[i], 250, *item)
    rounded(d, (292, 390, 820, 650), 18, (255, 255, 255, 16), (255, 255, 255, 30))
    text(d, (320, 412), "Downtime risk trend", F_H2)
    pts = []
    for i in range(18):
        x = 330 + i * 25
        y = 590 - int((math.sin(i * 0.72) * 0.25 + 0.55 + i / 45) * 150)
        pts.append((x, y))
    d.line(pts, fill=(*CYAN, 255), width=4)
    rounded(d, (845, 390, 1215, 650), 18, (255, 255, 255, 16), (255, 255, 255, 30))
    text(d, (875, 412), "Knowledge coverage heatmap", F_H2)
    for r in range(5):
        for c in range(6):
            val = (r * 6 + c) / 30
            color = CYAN if val > 0.45 else AMBER
            rounded(d, (875 + c * 50, 465 + r * 32, 913 + c * 50, 490 + r * 32), 5, (*color, int(70 + val * 160)))
    cursor(d, int(90 + frame_t * 160), int(120 + frame_t * 90), click=frame_t > 0.72)
    return img


def documents(frame_t: float) -> Image.Image:
    img = shell("Documents")
    d = ImageDraw.Draw(img, "RGBA")
    title(d, "Step 2", "Upload plant documents", "Click Documents, select files, and watch the ingestion pipeline process PDF manuals, SOPs, work orders, inspection reports, and compliance checklists.")
    rounded(d, (304, 238, 675, 540), 22, (255, 255, 255, 18), (6, 182, 212, 80))
    text(d, (386, 315), "Drop industrial documents here", F_H2)
    text(d, (375, 350), "PDF, DOCX, XLSX, CSV, PNG, JPG, TIFF", F_SMALL, MUTED)
    rounded(d, (425, 410, 555, 455), 14, (*BLUE, 255))
    text(d, (455, 423), "Select files", F_SMALL)
    pipeline = ["Uploaded", "OCR", "Text Extraction", "Chunking", "Entities", "Embeddings", "Vector DB", "Graph"]
    for i, step in enumerate(pipeline):
        y = 238 + i * 50
        done = frame_t > i / len(pipeline)
        rounded(d, (725, y, 1190, y + 38), 12, (255, 255, 255, 16), (255, 255, 255, 30))
        d.ellipse((742, y + 9, 762, y + 29), fill=(*(GREEN if done else BLUE), 190))
        text(d, (778, y + 10), step, F_SMALL, TEXT)
    progress(d, (304, 590, 1190, 610), min(1, frame_t * 1.3), GREEN)
    text(d, (304, 625), "Uploaded: CQP.pdf, FlowServe_P101_Manual.txt, SOP_22_Pump_Isolation.txt, OISD_Checklist.csv", F_SMALL, MUTED)
    cursor(d, 500, 430, click=0.2 < frame_t < 0.38)
    return img


def entities(frame_t: float) -> Image.Image:
    img = shell("Entities")
    d = ImageDraw.Draw(img, "RGBA")
    title(d, "Step 3", "Review extracted entities", "Open Entity Intelligence to inspect equipment tags, failure modes, safety hazards, procedures, clauses, spare parts, and source confidence.")
    headers = ["Entity", "Type", "Confidence", "Source", "Status"]
    xs = [310, 520, 700, 870, 1060]
    for x, h in zip(xs, headers):
        text(d, (x, 250), h, F_TINY, CYAN)
    rows = [
        ("P-101", "Asset", "94%", "inspection_report_P101.txt", "Approved"),
        ("Seal Failure", "FailureMode", "91%", "WO-10421", "Approved"),
        ("CQP", "Procedure", "88%", "CQP.pdf", "Review"),
        ("OISD-118", "Regulation", "86%", "OISD_Checklist.csv", "Gap"),
        ("Arc Flash", "SafetyHazard", "83%", "LOTO_Procedure.txt", "Approved"),
    ]
    for i, row in enumerate(rows):
        y = 292 + i * 58
        rounded(d, (292, y, 1210, y + 44), 12, (255, 255, 255, 14), (255, 255, 255, 25))
        for x, value in zip(xs, row):
            color = GREEN if value == "Approved" else AMBER if value in {"Review", "Gap"} else TEXT
            text(d, (x, y + 13), value, F_TINY, color)
    cursor(d, int(1010 + frame_t * 80), 310, click=frame_t > 0.65)
    return img


def graph(frame_t: float) -> Image.Image:
    img = shell("Knowledge Graph")
    d = ImageDraw.Draw(img, "RGBA")
    title(d, "Step 4", "Explore the knowledge graph", "Search Pump P101 and expand relationships across work orders, failure modes, inspections, SOPs, spare parts, and compliance gaps.")
    rounded(d, (300, 236, 600, 276), 12, (255, 255, 255, 15), (255, 255, 255, 30))
    q = "P101"[: int(frame_t * 8)]
    text(d, (324, 246), f"Search: {q}", F_SMALL)
    center = (745, 445)
    nodes = [
        ("P101", center[0], center[1], BLUE),
        ("WO-10421", 545, 325, CYAN),
        ("Seal Failure", 960, 320, RED),
        ("SOP-22", 525, 550, GREEN),
        ("Cavitation", 975, 555, AMBER),
        ("Mechanical Seal", 760, 600, PURPLE),
    ]
    for label, x, y, color in nodes[1:]:
        d.line((center[0], center[1], x, y), fill=(6, 182, 212, 130), width=3)
    for label, x, y, color in nodes:
        d.ellipse((x - 55, y - 35, x + 55, y + 35), fill=(*color, 70), outline=(*color, 230), width=3)
        text(d, (x - 42, y - 9), label, F_TINY)
    cursor(d, 730, 430, click=frame_t > 0.7)
    return img


def copilot(frame_t: float) -> Image.Image:
    img = shell("AI Copilot")
    d = ImageDraw.Draw(img, "RGBA")
    title(d, "Step 5", "Ask the AI Knowledge Copilot", "Type an operational question. The copilot searches uploaded documents, retrieves evidence, and returns cited answers with confidence and suggested actions.")
    question = "Why has Pump P101 failed repeatedly?"
    typed = question[: int(len(question) * min(1, frame_t * 1.45))]
    rounded(d, (300, 250, 1140, 312), 18, (255, 255, 255, 18), (255, 255, 255, 35))
    text(d, (326, 270), typed + ("|" if frame_t < 0.75 else ""), F_BODY)
    rounded(d, (1155, 250, 1220, 312), 18, (*BLUE, 255))
    text(d, (1174, 271), "Ask", F_SMALL)
    if frame_t > 0.55:
        rounded(d, (300, 350, 850, 610), 18, (6, 182, 212, 24), (6, 182, 212, 80))
        text(d, (326, 374), "Evidence-backed answer", F_SMALL, (187, 247, 208))
        text(d, (326, 410), "Pump P101 shows repeated seal failure and vibration patterns. Cited contributors include cavitation, suction restriction, low seal flush, and possible shaft misalignment after prior maintenance.", F_BODY, TEXT, 480)
        rounded(d, (880, 350, 1220, 610), 18, (255, 255, 255, 16), (255, 255, 255, 30))
        text(d, (905, 378), "Citations", F_H2)
        for i, c in enumerate(["inspection_report_P101.txt", "FlowServe_P101_Manual.txt", "WO-10421_mechanical_seal.pdf"]):
            y = 425 + i * 50
            rounded(d, (905, y, 1195, y + 38), 10, (255, 255, 255, 12), (6, 182, 212, 45))
            text(d, (920, y + 11), c, F_TINY, TEXT)
    cursor(d, 1180, 276, click=0.48 < frame_t < 0.62)
    return img


def asset(frame_t: float) -> Image.Image:
    img = shell("Asset 360")
    d = ImageDraw.Draw(img, "RGBA")
    title(d, "Step 6", "Open Asset 360 for Pump P101", "Review asset profile, operating status, risk score, maintenance history, failure timeline, linked SOPs, inspections, spare parts, and AI recommendations.")
    metric(d, 300, 250, "Risk Score", "88", "critical watch", RED)
    metric(d, 535, 250, "Reliability", "71%", "declining", AMBER)
    metric(d, 770, 250, "Compliance", "Partial", "evidence gap", CYAN)
    rounded(d, (300, 390, 1180, 650), 18, (255, 255, 255, 16), (255, 255, 255, 30))
    text(d, (330, 415), "Failure timeline", F_H2)
    events = ["2025-08 vibration alarm", "2026-02 repeated seal failure", "2026-02 RCA requested", "2026-06 preventive action assigned"]
    for i, event in enumerate(events):
        y = 465 + i * 38
        d.ellipse((340, y, 354, y + 14), fill=(*CYAN, 255))
        text(d, (370, y - 3), event, F_SMALL)
    cursor(d, 472, 280, click=frame_t > 0.75)
    return img


def rca(frame_t: float) -> Image.Image:
    img = shell("RCA Assistant")
    d = ImageDraw.Draw(img, "RGBA")
    title(d, "Step 7", "Generate and export RCA report", "Fill the RCA Assistant, review likely root causes, corrective actions, preventive actions, and export the cited PDF report.")
    fields = ["Asset: Pump P101", "Incident: repeated seal failure", "Failure: high vibration and cavitation", "Evidence: WO-10877, SOP-22, Manual"]
    for i, field in enumerate(fields):
        rounded(d, (305, 250 + i * 58, 705, 295 + i * 58), 12, (255, 255, 255, 15), (255, 255, 255, 28))
        text(d, (326, 264 + i * 58), field, F_SMALL)
    rounded(d, (305, 500, 705, 550), 14, (*BLUE, 255))
    text(d, (452, 516), "Export PDF", F_SMALL)
    rounded(d, (740, 250, 1195, 610), 18, (255, 255, 255, 16), (255, 255, 255, 30))
    text(d, (770, 280), "Professional RCA Report Preview", F_H2)
    text(d, (770, 330), "Likely root causes: low suction pressure, suction strainer fouling, seal flush instability, and possible shaft misalignment.", F_BODY, TEXT, 380)
    text(d, (770, 475), "Evidence citations: WO-10421, inspection_report_P101.txt, FlowServe_P101_Manual.txt", F_SMALL, CYAN, 350)
    cursor(d, 475, 515, click=frame_t > 0.65)
    return img


def compliance(frame_t: float) -> Image.Image:
    img = shell("Compliance")
    d = ImageDraw.Draw(img, "RGBA")
    title(d, "Step 8", "Review compliance gaps", "Open the compliance cockpit to map regulations to existing evidence, identify missing documents, overdue inspections, and generate audit readiness summaries.")
    metric(d, 300, 250, "Compliance", "82%", "audit readiness", GREEN)
    metric(d, 535, 250, "Detected Gaps", "7", "needs evidence", AMBER)
    metric(d, 770, 250, "Overdue", "3", "inspections", RED)
    gaps = ["V203 pressure test certificate missing", "EP501 arc flash evidence incomplete", "HX401 QA12 closure partial", "P101 permit-to-work evidence partial"]
    for i, gap in enumerate(gaps):
        y = 420 + i * 48
        rounded(d, (300, y, 1160, y + 36), 10, (255, 255, 255, 14), (255, 255, 255, 25))
        text(d, (325, y + 10), gap, F_SMALL, AMBER if i < 2 else CYAN)
    cursor(d, 1015, 440, click=frame_t > 0.72)
    return img


def admin(frame_t: float) -> Image.Image:
    img = shell("Admin")
    d = ImageDraw.Draw(img, "RGBA")
    title(d, "Step 9", "Load demo dataset and manage system controls", "Admin Console supports users, roles, document permissions, audit logs, AI provider settings, system health, and one-click demo data loading.")
    cards = ["Users & Roles", "Permissions", "Audit Logs", "AI Providers", "System Health", "Document Rules"]
    for i, card in enumerate(cards):
        x = 300 + (i % 3) * 290
        y = 250 + (i // 3) * 110
        rounded(d, (x, y, x + 250, y + 80), 14, (255, 255, 255, 15), (255, 255, 255, 28))
        text(d, (x + 22, y + 26), card, F_H2)
    rounded(d, (300, 520, 590, 575), 16, (*BLUE, 255))
    text(d, (365, 538), "Load Demo Dataset", F_SMALL)
    if frame_t > 0.6:
        rounded(d, (620, 520, 1120, 575), 16, (34, 197, 94, 35), (34, 197, 94, 90))
        text(d, (650, 538), "Seed complete: 12 documents, assets, entities, chunks, graph relationships", F_SMALL, (187, 247, 208), 430)
    cursor(d, 430, 535, click=0.45 < frame_t < 0.62)
    return img


def final_scene(frame_t: float) -> Image.Image:
    img = shell("Dashboard")
    d = ImageDraw.Draw(img, "RGBA")
    title(d, "Complete software operation", "End-to-end Industrial Brain AI workflow", "Upload documents, extract entities, build the graph, ask cited questions, inspect Asset 360, generate RCA PDF, detect compliance gaps, and prepare reports.")
    flow = ["Upload", "Extract", "Graph", "Ask", "Asset 360", "RCA PDF", "Compliance", "Reports"]
    for i, item in enumerate(flow):
        x = 305 + (i % 4) * 220
        y = 300 + (i // 4) * 130
        rounded(d, (x, y, x + 170, y + 70), 18, (6, 182, 212, 28), (6, 182, 212, 100))
        text(d, (x + 38, y + 25), item, F_SMALL)
        if i % 4 != 3:
            d.line((x + 170, y + 35, x + 215, y + 35), fill=(*CYAN, 160), width=3)
    rounded(d, (305, 585, 1180, 635), 16, (34, 197, 94, 32), (34, 197, 94, 90))
    text(d, (335, 602), "Ready for national hackathon demonstration: traceable, auditable, enterprise-grade industrial intelligence.", F_SMALL, (187, 247, 208))
    cursor(d, int(300 + frame_t * 800), int(610 - math.sin(frame_t * math.pi) * 70), click=frame_t > 0.8)
    return img


STEPS = [
    ("Dashboard overview", dashboard, 4),
    ("Document upload", documents, 6),
    ("Entity review", entities, 4),
    ("Knowledge graph search", graph, 5),
    ("Copilot question", copilot, 8),
    ("Asset 360", asset, 4),
    ("RCA export", rca, 5),
    ("Compliance gaps", compliance, 4),
    ("Admin seed", admin, 4),
    ("Full workflow", final_scene, 4),
]


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    writer = cv2.VideoWriter(str(OUT_FILE), cv2.VideoWriter_fourcc(*"mp4v"), FPS, (W, H))
    if not writer.isOpened():
        raise RuntimeError("Could not create video writer")

    poster_written = False
    for idx, (name, renderer, seconds) in enumerate(STEPS, start=1):
        print(f"Recording operation {idx}/{len(STEPS)}: {name}")
        frame_count = seconds * FPS
        for frame in range(frame_count):
            t = frame / max(frame_count - 1, 1)
            img = renderer(ease(t))
            if not poster_written and frame == frame_count // 2:
                img.save(POSTER_FILE)
                poster_written = True
            arr = cv2.cvtColor(np.array(img.convert("RGB")), cv2.COLOR_RGB2BGR)
            writer.write(arr)
    writer.release()
    print(f"Created {OUT_FILE}")
    print(f"Created {POSTER_FILE}")


if __name__ == "__main__":
    main()
