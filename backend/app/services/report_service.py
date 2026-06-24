from __future__ import annotations

from pathlib import Path

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

from app.database import ROOT
from app.services.compliance_service import audit_evidence_package, compliance_gaps
from app.services.maintenance_service import rca_for_asset
from app.services.maintenance_service import maintenance_dashboard

REPORT_DIR = ROOT / "backend" / "app" / "reports"


def _write_report(path: Path, title: str, sections: list[tuple[str, list[str]]]) -> Path:
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    pdf = canvas.Canvas(str(path), pagesize=letter)
    width, height = letter
    y = height - 50
    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawString(50, y, title[:90])
    y -= 30

    for heading, lines in sections:
        if y < 90:
            pdf.showPage()
            y = height - 50
        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawString(50, y, heading[:95])
        y -= 18
        pdf.setFont("Helvetica", 10)
        for line in lines:
            if y < 60:
                pdf.showPage()
                y = height - 50
                pdf.setFont("Helvetica", 10)
            pdf.drawString(62, y, line[:105])
            y -= 15
        y -= 8

    pdf.save()
    return path


def generate_rca_pdf(asset_tag: str) -> Path:
    report = rca_for_asset(asset_tag)
    path = REPORT_DIR / f"RCA_{asset_tag}.pdf"
    return _write_report(
        path,
        f"Industrial Brain AI RCA Report - {asset_tag}",
        [
            ("Incident Summary", [report["summary"]]),
            ("Likely Root Causes", [f"- {item}" for item in report["likely_root_causes"]]),
            ("Corrective and Preventive Actions", [f"- {item}" for item in report["recommended_actions"]]),
            ("Evidence", [f"- {doc['filename']}" for doc in report["evidence_documents"]] or ["- No linked evidence documents found"]),
        ],
    )


def generate_compliance_pdf() -> Path:
    package = audit_evidence_package()
    path = REPORT_DIR / "Q2_Compliance_Evidence_Package.pdf"
    exception_lines = [
        f"- {item['clause']}: {item['requirement']} ({item['gap']})"
        for item in package["exceptions"]
    ]
    evidence_lines = [
        f"- {item['clause']}: {item['requirement']}"
        for item in package["included_evidence"]
    ]
    return _write_report(
        path,
        "Industrial Brain AI - Q2 Compliance Evidence Package",
        [
            ("Audit Summary", [package["summary"]]),
            ("Included Evidence", evidence_lines or ["- No fully covered clauses found"]),
            ("Exceptions / Gaps", exception_lines or ["- No open compliance exceptions"]),
            ("Auditor Notes", [f"- {note}" for note in package["auditor_notes"]]),
        ],
    )


def generate_executive_summary_pdf() -> Path:
    maintenance = maintenance_dashboard()
    gaps = compliance_gaps()
    path = REPORT_DIR / "Executive_Risk_Summary.pdf"
    high_risk = [
        f"- {asset['tag']} {asset['name']}: risk score {asset['risk_score']} ({asset['status']})"
        for asset in maintenance["high_risk_assets"]
    ]
    patterns = [
        f"- {item['failure_mode']}: {item['count']} records"
        for item in maintenance["failure_patterns"][:8]
    ]
    return _write_report(
        path,
        "Industrial Brain AI - Executive Risk Summary",
        [
            ("Operational Snapshot", [
                f"High-risk assets: {len(maintenance['high_risk_assets'])}",
                f"Compliance gaps: {len(gaps['gaps'])}",
                f"Incomplete maintenance histories: {len(maintenance['incomplete_maintenance_history'])}",
            ]),
            ("High-Risk Assets", high_risk or ["- No high-risk assets in current data"]),
            ("Repeated Failure Patterns", patterns or ["- No repeated failure patterns found"]),
            ("Recommended Executive Actions", [
                "- Prioritize P101 reliability review and RCA closure.",
                "- Assign owners for open compliance evidence gaps.",
                "- Require source-cited documentation for operational decisions.",
            ]),
        ],
    )


def generate_maintenance_pdf() -> Path:
    maintenance = maintenance_dashboard()
    path = REPORT_DIR / "Preventive_Maintenance_Backlog.pdf"
    high_risk = [
        f"- {asset['tag']} {asset['name']}: {asset['asset_type']} at {asset['location']}, risk {asset['risk_score']}"
        for asset in maintenance["high_risk_assets"]
    ]
    incomplete = [f"- {tag}" for tag in maintenance["incomplete_maintenance_history"]]
    patterns = [f"- {item['failure_mode']}: {item['count']} events" for item in maintenance["failure_patterns"]]
    return _write_report(
        path,
        "Industrial Brain AI - Preventive Maintenance Backlog",
        [
            ("High-Risk Assets", high_risk or ["- No high-risk assets in current data"]),
            ("Repeated Failure Modes", patterns or ["- No failure modes detected"]),
            ("Incomplete Maintenance Histories", incomplete or ["- All indexed assets have maintenance history"]),
            ("Recommended Preventive Actions", [
                "- Verify alignment, strainer DP, and seal flush for P101.",
                "- Close overdue inspection evidence for pressure and electrical systems.",
                "- Attach work order evidence before audit review.",
            ]),
        ],
    )


def generate_report_pdf(report_type: str, asset_tag: str = "P-101") -> Path:
    normalized = report_type.lower().strip()
    if normalized in {"rca", "rca-report"}:
        return generate_rca_pdf(asset_tag)
    if normalized in {"compliance", "audit", "audit-package", "evidence-package"}:
        return generate_compliance_pdf()
    if normalized in {"executive", "executive-summary", "risk-summary"}:
        return generate_executive_summary_pdf()
    if normalized in {"maintenance", "maintenance-report", "preventive-maintenance"}:
        return generate_maintenance_pdf()
    raise ValueError(f"Unsupported report type: {report_type}")
