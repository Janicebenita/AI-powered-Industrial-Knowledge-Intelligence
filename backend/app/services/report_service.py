from __future__ import annotations

from pathlib import Path

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

from app.database import ROOT
from app.services.maintenance_service import rca_for_asset

REPORT_DIR = ROOT / "backend" / "app" / "reports"


def generate_rca_pdf(asset_tag: str) -> Path:
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    report = rca_for_asset(asset_tag)
    path = REPORT_DIR / f"RCA_{asset_tag}.pdf"
    pdf = canvas.Canvas(str(path), pagesize=letter)
    width, height = letter
    y = height - 50
    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawString(50, y, f"Industrial Brain AI RCA Report - {asset_tag}")
    y -= 30
    pdf.setFont("Helvetica", 10)
    for line in [
        "Incident Summary:",
        report["summary"],
        "",
        "Likely Root Causes:",
        *[f"- {item}" for item in report["likely_root_causes"]],
        "",
        "Corrective and Preventive Actions:",
        *[f"- {item}" for item in report["recommended_actions"]],
        "",
        "Evidence:",
        *[f"- {doc['filename']}" for doc in report["evidence_documents"]],
    ]:
        if y < 60:
            pdf.showPage()
            y = height - 50
            pdf.setFont("Helvetica", 10)
        pdf.drawString(50, y, line[:105])
        y -= 16
    pdf.save()
    return path
