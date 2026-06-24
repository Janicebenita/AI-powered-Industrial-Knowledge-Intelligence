from __future__ import annotations

import math
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "demo-video"
OUT_FILE = OUT_DIR / "Industrial_Brain_AI_Operations_Walkthrough.mp4"

W, H = 1920, 1080
FPS = 12

BG = (5, 8, 22)
PANEL = (24, 32, 52)
PANEL_2 = (29, 43, 62)
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
    for item in candidates:
        path = Path(item)
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


F_TITLE = font(72, True)
F_H1 = font(48, True)
F_H2 = font(30, True)
F_BODY = font(25)
F_SMALL = font(20)
F_TINY = font(16)


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def ease(t: float) -> float:
    return 1 - pow(1 - t, 3)


def blend(c1: tuple[int, int, int], c2: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    return tuple(int(lerp(a, b, t)) for a, b in zip(c1, c2))


def wrap(draw: ImageDraw.ImageDraw, text: str, font_obj: ImageFont.FreeTypeFont, width: int) -> list[str]:
    lines: list[str] = []
    for paragraph in text.split("\n"):
        words = paragraph.split()
        line = ""
        for word in words:
            test = f"{line} {word}".strip()
            if draw.textlength(test, font=font_obj) <= width:
                line = test
            else:
                if line:
                    lines.append(line)
                line = word
        if line:
            lines.append(line)
    return lines


def rounded(draw: ImageDraw.ImageDraw, xy: tuple[int, int, int, int], radius: int, fill, outline=None, width: int = 1):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def glow_circle(img: Image.Image, cx: int, cy: int, radius: int, color: tuple[int, int, int], alpha: int):
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    for i in range(radius, 0, -8):
        a = int(alpha * (i / radius) ** 2)
        d.ellipse((cx - i, cy - i, cx + i, cy + i), fill=(*color, a))
    img.alpha_composite(overlay)


def background(t: float) -> Image.Image:
    img = Image.new("RGBA", (W, H), (*BG, 255))
    pix = np.array(img).astype(np.float32)
    yy, xx = np.mgrid[0:H, 0:W]
    g1 = np.exp(-(((xx - 300) ** 2 + (yy - 160) ** 2) / (2 * 430**2)))
    g2 = np.exp(-(((xx - 1650) ** 2 + (yy - 180) ** 2) / (2 * 470**2)))
    pix[..., 0] += g1 * 28 + g2 * 8
    pix[..., 1] += g1 * 52 + g2 * 40
    pix[..., 2] += g1 * 110 + g2 * 95
    pix = np.clip(pix, 0, 255).astype(np.uint8)
    img = Image.fromarray(pix, "RGBA")
    d = ImageDraw.Draw(img, "RGBA")
    offset = int((t * 40) % 48)
    for x in range(-48 + offset, W, 48):
        d.line((x, 0, x, H), fill=(148, 163, 184, 18), width=1)
    for y in range(-48 + offset, H, 48):
        d.line((0, y, W, y), fill=(148, 163, 184, 18), width=1)
    for i in range(36):
        x = int((i * 271 + t * 38) % W)
        y = int((i * 149 + math.sin(t + i) * 28) % H)
        d.ellipse((x - 2, y - 2, x + 2, y + 2), fill=(103, 232, 249, 80))
    return img


def text(draw: ImageDraw.ImageDraw, xy: tuple[int, int], value: str, font_obj, fill=TEXT, width: int | None = None, spacing: int = 8):
    x, y = xy
    if width:
        for line in wrap(draw, value, font_obj, width):
            draw.text((x, y), line, font=font_obj, fill=fill)
            y += font_obj.size + spacing
    else:
        draw.text((x, y), value, font=font_obj, fill=fill)


def app_shell(draw: ImageDraw.ImageDraw):
    rounded(draw, (56, 62, 360, 1018), 28, (4, 9, 25, 225), (255, 255, 255, 28), 1)
    rounded(draw, (86, 92, 142, 148), 15, (*BLUE, 255))
    text(draw, (102, 107), "IB", F_H2)
    text(draw, (158, 96), "Industrial Brain AI", F_BODY, TEXT)
    text(draw, (158, 128), "Operations Intelligence", F_SMALL, MUTED)
    items = ["Dashboard", "Documents", "Entities", "Knowledge Graph", "AI Copilot", "Asset 360", "Maintenance", "RCA", "Compliance", "Reports", "Admin"]
    for i, item in enumerate(items):
        y = 205 + i * 63
        active = item in {"AI Copilot", "Dashboard", "Documents"}
        fill = (59, 130, 246, 220) if active and i % 4 == 0 else (255, 255, 255, 10)
        rounded(draw, (82, y, 334, y + 45), 14, fill, None)
        draw.ellipse((102, y + 13, 122, y + 33), fill=(148, 163, 184, 120))
        text(draw, (140, y + 10), item, F_SMALL, TEXT if fill[3] > 100 else MUTED)
    rounded(draw, (390, 62, 1838, 142), 0, (6, 12, 31, 210), (255, 255, 255, 18), 1)
    rounded(draw, (430, 84, 1025, 124), 15, (255, 255, 255, 12), (255, 255, 255, 25), 1)
    text(draw, (466, 92), "Search assets, SOPs, work orders, regulations, citations...", F_SMALL, MUTED)
    rounded(draw, (1322, 84, 1445, 124), 15, (34, 197, 94, 35), (34, 197, 94, 80), 1)
    text(draw, (1352, 94), "AI online", F_TINY, (187, 247, 208))
    rounded(draw, (1465, 84, 1588, 124), 15, (6, 182, 212, 35), (6, 182, 212, 80), 1)
    text(draw, (1498, 94), "Plant A", F_TINY, (165, 243, 252))


def metric(draw, x, y, title, value, detail, color=CYAN):
    rounded(draw, (x, y, x + 255, y + 142), 22, (255, 255, 255, 18), (255, 255, 255, 35), 1)
    draw.rectangle((x, y, x + 255, y + 5), fill=(*color, 230))
    text(draw, (x + 22, y + 25), title, F_SMALL, MUTED)
    text(draw, (x + 22, y + 58), value, F_H1, TEXT)
    text(draw, (x + 22, y + 108), detail, F_TINY, (203, 213, 225))


def mini_chart(draw, x, y, w, h, color=CYAN):
    pts = []
    for i in range(16):
        px = x + int(i * w / 15)
        py = y + h - int((math.sin(i * 0.8) * 0.32 + 0.52 + (i / 28)) * h)
        pts.append((px, py))
    draw.line(pts, fill=(*color, 255), width=5)
    for pt in pts[::3]:
        draw.ellipse((pt[0] - 5, pt[1] - 5, pt[0] + 5, pt[1] + 5), fill=(*color, 255))


def draw_graph(draw, x, y, t):
    nodes = [
        ("P101", x + 220, y + 170, BLUE),
        ("WO", x + 80, y + 75, CYAN),
        ("Seal Failure", x + 420, y + 80, RED),
        ("SOP", x + 95, y + 275, GREEN),
        ("Inspection", x + 420, y + 280, AMBER),
        ("RCA", x + 255, y + 360, PURPLE),
    ]
    for _, x1, y1, _ in nodes[1:]:
        draw.line((x + 220, y + 170, x1, y1), fill=(6, 182, 212, 130), width=3)
    for label, nx, ny, color in nodes:
        r = 50 + int(math.sin(t * 4 + nx) * 2)
        draw.ellipse((nx - r, ny - r, nx + r, ny + r), fill=(*color, 55), outline=(*color, 230), width=3)
        tw = draw.textlength(label, font=F_TINY)
        text(draw, (int(nx - tw / 2), ny - 10), label, F_TINY, TEXT)


def scene_title(draw, eyebrow, title, body):
    text(draw, (430, 188), eyebrow.upper(), F_SMALL, CYAN)
    text(draw, (430, 222), title, F_H1, TEXT, width=900)
    text(draw, (430, 342), body, F_BODY, MUTED, width=900)


SCENES = [
    {
        "eyebrow": "Industrial Brain AI",
        "title": "Unified Asset & Operations Intelligence Platform",
        "body": "Convert fragmented industrial documents, equipment history, SOPs, inspections, incidents, and compliance records into an auditable AI operations brain.",
        "bullets": ["AI-native knowledge layer", "Source-cited answers only", "Built for plant, maintenance, quality, safety, and audit teams"],
        "kind": "hero",
    },
    {
        "eyebrow": "01 Executive Command Dashboard",
        "title": "Mission-critical plant intelligence cockpit",
        "body": "Leadership sees document coverage, critical risks, compliance readiness, repeated failure patterns, citation coverage, and time saved in one operational view.",
        "bullets": ["1,284 documents indexed", "426 assets connected", "91% citation coverage", "14 repeated failure patterns detected"],
        "kind": "dashboard",
    },
    {
        "eyebrow": "02 Document Ingestion Center",
        "title": "Upload manuals, SOPs, work orders, PDFs, CSVs, scans, and checklists",
        "body": "Every file flows through OCR/text extraction, classification, chunking, entity extraction, embeddings, vector storage, and knowledge graph updates.",
        "bullets": ["PDF, DOCX, XLSX, CSV, PNG, JPG, TIFF", "Metadata preserved: filename, page, section, timestamp", "Same pipeline for manual upload and demo seed"],
        "kind": "pipeline",
    },
    {
        "eyebrow": "03 Entity Intelligence",
        "title": "Structured industrial entity extraction",
        "body": "The platform extracts equipment tags, failure modes, maintenance actions, process parameters, alarm codes, spare parts, regulatory clauses, hazards, and quality issues.",
        "bullets": ["P-101: Seal Failure, Cavitation, Vibration", "V-203: Pressure Test Evidence Missing", "EP-501: Arc Flash / LOTO control gap"],
        "kind": "table",
    },
    {
        "eyebrow": "04 Knowledge Graph Explorer",
        "title": "Asset-centered operational graph",
        "body": "Assets, documents, failures, inspections, procedures, regulations, spare parts, engineers, and incidents are linked into explainable relationships.",
        "bullets": ["ASSET_FAILED_WITH", "INSPECTION_FOUND", "REGULATION_APPLIES_TO", "SPARE_PART_USED_IN"],
        "kind": "graph",
    },
    {
        "eyebrow": "05 AI Knowledge Copilot",
        "title": "Ask operational questions with citations",
        "body": "The copilot retrieves evidence from indexed documents and refuses unsupported operational or compliance answers when evidence is weak.",
        "bullets": ["Why has Pump P101 failed repeatedly?", "Which SOP applies before opening Vessel V203?", "What should a field technician check first?"],
        "kind": "copilot",
    },
    {
        "eyebrow": "06 Asset 360",
        "title": "Digital twin-style asset profile",
        "body": "Every asset page shows status, risk score, reliability score, linked documents, maintenance history, failures, inspections, compliance obligations, and AI recommendations.",
        "bullets": ["Pump P101: Risk score 88", "Compressor C201: Trip incident RCA ready", "HX401: corrosion under insulation evidence gap"],
        "kind": "asset",
    },
    {
        "eyebrow": "07 Maintenance Intelligence",
        "title": "Repeated failure detection and preventive action",
        "body": "Reliability teams can identify repeated seal failure, cavitation, bearing overheating, oil contamination, and vibration anomalies before downtime escalates.",
        "bullets": ["MTBF / MTTR trends", "Failure history by asset", "Preventive maintenance recommendations"],
        "kind": "maintenance",
    },
    {
        "eyebrow": "08 RCA Assistant",
        "title": "Professional root cause report generation",
        "body": "Create RCA drafts with timeline, likely causes, evidence, historical similar events, corrective actions, preventive actions, risk level, and exportable PDF.",
        "bullets": ["Incident: Pump P101 repeated seal failure", "Evidence: WO-10877, WO-10421, SOP-MECH-01", "Export PDF for audit package"],
        "kind": "rca",
    },
    {
        "eyebrow": "09 Compliance Intelligence",
        "title": "Audit readiness with gap detection",
        "body": "Map Factory Act, OISD, PESO, environmental, quality, and internal SOP requirements to evidence documents, then flag missing or overdue proof.",
        "bullets": ["V203 pressure test certificate missing", "EP501 energized work evidence incomplete", "HX401 QA12 closure partial"],
        "kind": "compliance",
    },
    {
        "eyebrow": "10 Lessons Learned Engine",
        "title": "Turn incidents and near misses into prevention",
        "body": "Recurring incidents, audit findings, near misses, and quality non-conformances become proactive warnings and operational lessons.",
        "bullets": ["Near-miss pattern alerts", "Quality non-conformance trends", "Preventive recommendations"],
        "kind": "lessons",
    },
    {
        "eyebrow": "11 Reports & Admin",
        "title": "Enterprise-ready controls and evidence packages",
        "body": "Generate RCA reports, executive summaries, compliance packages, maintenance reports, audit logs, permissions, AI provider settings, and system health views.",
        "bullets": ["Role-based access control", "Document-level permissions", "Audit logging", "One-click demo dataset loading"],
        "kind": "admin",
    },
    {
        "eyebrow": "Demo Flow",
        "title": "From uploaded documents to cited operational decisions",
        "body": "Upload plant records, extract entities, build the graph, ask why Pump P101 failed, open Asset 360, identify compliance gaps, and export the RCA report.",
        "bullets": ["Traceable", "Auditable", "Field-friendly", "Executive-ready"],
        "kind": "closing",
    },
]


def render_scene(scene: dict, frame: int, total: int) -> Image.Image:
    t = frame / max(total - 1, 1)
    img = background(t)
    draw = ImageDraw.Draw(img, "RGBA")
    app_shell(draw)
    scene_title(draw, scene["eyebrow"], scene["title"], scene["body"])

    panel_x, panel_y = 1120, 205
    rounded(draw, (panel_x, panel_y, 1780, 855), 28, (255, 255, 255, 16), (255, 255, 255, 35), 1)
    glow_circle(img, 1630, 260, 180, CYAN, 30)

    kind = scene["kind"]
    if kind == "hero":
        draw_graph(draw, panel_x + 60, panel_y + 95, t)
        metric(draw, panel_x + 60, panel_y + 500, "Downtime Risk", "-31%", "projected reduction", GREEN)
        metric(draw, panel_x + 350, panel_y + 500, "Decision Time", "6.5h", "saved/week", CYAN)
    elif kind == "dashboard":
        metric(draw, panel_x + 40, panel_y + 55, "Documents", "1,284", "+18 this week", CYAN)
        metric(draw, panel_x + 330, panel_y + 55, "Assets", "426", "94% coverage", BLUE)
        metric(draw, panel_x + 40, panel_y + 230, "Compliance", "82%", "audit ready", GREEN)
        metric(draw, panel_x + 330, panel_y + 230, "Critical Risks", "14", "needs action", RED)
        rounded(draw, (panel_x + 60, panel_y + 430, panel_x + 600, panel_y + 610), 22, (5, 8, 22, 100), (255, 255, 255, 24), 1)
        mini_chart(draw, panel_x + 90, panel_y + 470, 480, 100, CYAN)
    elif kind == "pipeline":
        steps = ["Upload", "OCR", "Extract", "Chunk", "Entities", "Embed", "Graph"]
        for i, step in enumerate(steps):
            x = panel_x + 70 + (i % 4) * 145
            y = panel_y + 90 + (i // 4) * 185
            active = i <= int(t * len(steps))
            draw.ellipse((x, y, x + 78, y + 78), fill=(*(GREEN if active else BLUE), 70), outline=(*(GREEN if active else CYAN), 220), width=3)
            text(draw, (x - 8, y + 96), step, F_TINY, TEXT)
            if i < len(steps) - 1 and i % 4 != 3:
                draw.line((x + 78, y + 39, x + 140, y + 39), fill=(6, 182, 212, 160), width=4)
        text(draw, (panel_x + 75, panel_y + 480), "Uploaded: CQP, SOP_22, OISD checklist, FlowServe P101 manual", F_SMALL, MUTED, width=520)
    elif kind == "table":
        headers = ["Entity", "Type", "Confidence", "Source"]
        xs = [panel_x + 55, panel_x + 245, panel_x + 410, panel_x + 535]
        for x, h in zip(xs, headers):
            text(draw, (x, panel_y + 70), h, F_TINY, CYAN)
        rows = [
            ("P-101", "Asset", "94%", "Inspection"),
            ("Seal Failure", "FailureMode", "91%", "Work Order"),
            ("OISD-118", "Regulation", "88%", "Checklist"),
            ("Arc Flash", "Hazard", "86%", "LOTO"),
            ("QA12", "QualityIssue", "82%", "Report"),
        ]
        for i, row in enumerate(rows):
            y = panel_y + 118 + i * 82
            rounded(draw, (panel_x + 40, y - 18, panel_x + 615, y + 48), 16, (255, 255, 255, 14), (255, 255, 255, 24), 1)
            for x, value in zip(xs, row):
                text(draw, (x, y), value, F_TINY, TEXT if value.endswith("%") is False else GREEN)
    elif kind == "graph":
        draw_graph(draw, panel_x + 55, panel_y + 80, t)
    elif kind == "copilot":
        rounded(draw, (panel_x + 60, panel_y + 70, panel_x + 600, panel_y + 190), 20, (6, 182, 212, 22), (6, 182, 212, 70), 1)
        text(draw, (panel_x + 90, panel_y + 92), "Why has Pump P101 failed repeatedly?", F_SMALL, TEXT, width=470)
        rounded(draw, (panel_x + 60, panel_y + 235, panel_x + 600, panel_y + 455), 20, (59, 130, 246, 22), (6, 182, 212, 70), 1)
        text(draw, (panel_x + 90, panel_y + 260), "Answer: repeated seal failure and vibration correlate with cavitation, suction restriction, low seal flush, and possible alignment issues.", F_SMALL, TEXT, width=470)
        rounded(draw, (panel_x + 60, panel_y + 500, panel_x + 315, panel_y + 600), 18, (34, 197, 94, 35), (34, 197, 94, 90), 1)
        text(draw, (panel_x + 90, panel_y + 525), "86% confidence", F_SMALL, (187, 247, 208))
        rounded(draw, (panel_x + 345, panel_y + 500, panel_x + 600, panel_y + 600), 18, (6, 182, 212, 35), (6, 182, 212, 90), 1)
        text(draw, (panel_x + 375, panel_y + 525), "3 citations", F_SMALL, (165, 243, 252))
    elif kind == "asset":
        metric(draw, panel_x + 45, panel_y + 55, "P101 Risk", "88", "critical watch", RED)
        metric(draw, panel_x + 335, panel_y + 55, "Reliability", "71%", "declining", AMBER)
        text(draw, (panel_x + 70, panel_y + 260), "Failure Timeline", F_H2, TEXT)
        for i, event in enumerate(["Vibration alarm", "Seal replaced", "Cavitation noted", "RCA requested"]):
            y = panel_y + 320 + i * 70
            draw.line((panel_x + 95, y, panel_x + 95, y + 45), fill=(*CYAN, 180), width=3)
            draw.ellipse((panel_x + 85, y - 5, panel_x + 105, y + 15), fill=(*BLUE, 255))
            text(draw, (panel_x + 130, y - 10), event, F_SMALL, TEXT)
    elif kind == "maintenance":
        labels = ["Seal Failure", "Vibration", "Cavitation", "Bearing Heat"]
        for i, label in enumerate(labels):
            y = panel_y + 90 + i * 100
            rounded(draw, (panel_x + 70, y, panel_x + 585, y + 60), 16, (255, 255, 255, 15), (255, 255, 255, 30), 1)
            text(draw, (panel_x + 95, y + 15), label, F_SMALL, TEXT)
            draw.rectangle((panel_x + 300, y + 22, panel_x + 300 + [220, 165, 140, 90][i], y + 38), fill=(*(RED if i == 0 else AMBER), 255))
    elif kind == "rca":
        text(draw, (panel_x + 70, panel_y + 70), "Professional RCA Report Preview", F_H2, TEXT)
        sections = ["Incident Summary", "Timeline", "Likely Root Causes", "Corrective Actions", "Preventive Actions", "Evidence Citations"]
        for i, section in enumerate(sections):
            y = panel_y + 130 + i * 75
            rounded(draw, (panel_x + 70, y, panel_x + 590, y + 48), 14, (255, 255, 255, 14), (255, 255, 255, 25), 1)
            text(draw, (panel_x + 95, y + 12), section, F_SMALL, TEXT)
        rounded(draw, (panel_x + 410, panel_y + 555, panel_x + 590, panel_y + 610), 16, (*BLUE, 255), None)
        text(draw, (panel_x + 450, panel_y + 570), "Export PDF", F_TINY, TEXT)
    elif kind == "compliance":
        draw.arc((panel_x + 200, panel_y + 80, panel_x + 500, panel_y + 380), 180, 360, fill=(*GREEN, 255), width=22)
        draw.arc((panel_x + 200, panel_y + 80, panel_x + 500, panel_y + 380), 330, 360, fill=(*RED, 255), width=22)
        text(draw, (panel_x + 285, panel_y + 215), "82%", F_H1, TEXT)
        for i, gap in enumerate(["V203 pressure test overdue", "EP501 arc flash evidence missing", "HX401 QA12 closure partial"]):
            y = panel_y + 430 + i * 60
            text(draw, (panel_x + 80, y), gap, F_SMALL, AMBER if i < 2 else CYAN)
    elif kind == "lessons":
        mini_chart(draw, panel_x + 90, panel_y + 110, 500, 180, PURPLE)
        for i, warning in enumerate(["Recurring permit-to-work evidence gaps", "Near misses around vessel opening", "Repeat mechanical seal replacements"]):
            y = panel_y + 380 + i * 70
            rounded(draw, (panel_x + 70, y, panel_x + 600, y + 50), 15, (245, 158, 11, 28), (245, 158, 11, 70), 1)
            text(draw, (panel_x + 95, y + 13), warning, F_SMALL, TEXT)
    elif kind == "admin":
        cols = ["Reports", "Admin", "Security"]
        for i, col in enumerate(cols):
            x = panel_x + 60 + i * 190
            rounded(draw, (x, panel_y + 95, x + 160, panel_y + 430), 22, (255, 255, 255, 16), (255, 255, 255, 35), 1)
            text(draw, (x + 25, panel_y + 125), col, F_SMALL, CYAN)
            for j in range(4):
                draw.rectangle((x + 25, panel_y + 180 + j * 48, x + 130, panel_y + 195 + j * 48), fill=(148, 163, 184, 90))
        rounded(draw, (panel_x + 220, panel_y + 525, panel_x + 500, panel_y + 585), 18, (*BLUE, 255), None)
        text(draw, (panel_x + 270, panel_y + 542), "Load Demo Dataset", F_SMALL, TEXT)
    else:
        draw_graph(draw, panel_x + 50, panel_y + 70, t)
        text(draw, (panel_x + 95, panel_y + 520), "Upload → Extract → Graph → Ask → RCA → Audit", F_H2, TEXT)

    bullet_y = 500
    for i, bullet in enumerate(scene["bullets"]):
        y = bullet_y + i * 56
        draw.ellipse((432, y + 7, 448, y + 23), fill=(*CYAN, 255))
        text(draw, (466, y), bullet, F_BODY, TEXT, width=560)

    # Scene progress bar
    draw.rectangle((430, 930, 1780, 936), fill=(255, 255, 255, 30))
    draw.rectangle((430, 930, 430 + int(1350 * t), 936), fill=(*CYAN, 255))
    return img


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    writer = cv2.VideoWriter(str(OUT_FILE), fourcc, FPS, (W, H))
    if not writer.isOpened():
        raise RuntimeError("Could not open MP4 writer")

    frames_per_scene = FPS * 3
    for index, scene in enumerate(SCENES, start=1):
        print(f"Rendering scene {index}/{len(SCENES)}: {scene['eyebrow']}")
        img = render_scene(scene, frames_per_scene // 2, frames_per_scene)
        arr = cv2.cvtColor(np.array(img.convert("RGB")), cv2.COLOR_RGB2BGR)
        for _ in range(frames_per_scene):
            writer.write(arr)
    writer.release()

    # Also create a compact poster image for quick preview.
    poster = render_scene(SCENES[0], frames_per_scene // 2, frames_per_scene).resize((960, 540), Image.Resampling.LANCZOS)
    poster_path = OUT_DIR / "Industrial_Brain_AI_Walkthrough_Poster.png"
    poster.save(poster_path)

    print(f"Created {OUT_FILE}")
    print(f"Created {poster_path}")


if __name__ == "__main__":
    main()
