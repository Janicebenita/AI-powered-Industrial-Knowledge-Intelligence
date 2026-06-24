from __future__ import annotations

from typing import Any

from app.database import query


def compliance_gaps() -> dict[str, Any]:
    regulations = query("SELECT * FROM regulations ORDER BY clause")
    procedures = query("SELECT * FROM procedures ORDER BY procedure_id")
    inspections = query("SELECT * FROM inspections ORDER BY next_due")
    gaps = []
    covered = []
    for reg in regulations:
        evidence = []
        for proc in procedures:
            if reg["applies_to"].lower() in proc["applies_to"].lower() or proc["applies_to"].lower() in reg["applies_to"].lower():
                evidence.append({"type": "Procedure", "id": proc["procedure_id"], "title": proc["title"]})
        for inspection in inspections:
            if reg["applies_to"].lower() in inspection["asset_tag"].lower() or reg["applies_to"].lower() in inspection["finding"].lower():
                evidence.append({"type": "Inspection", "id": inspection["inspection_id"], "finding": inspection["finding"]})
        item = {"clause": reg["clause"], "requirement": reg["requirement"], "applies_to": reg["applies_to"], "evidence": evidence}
        if reg["evidence_status"] == "covered" and evidence:
            covered.append(item)
        else:
            item["gap"] = "Missing mapped procedure or inspection evidence" if not evidence else "Evidence exists but clause status is partial"
            gaps.append(item)
    return {
        "covered": covered,
        "gaps": gaps,
        "audit_summary": f"{len(covered)} requirements covered; {len(gaps)} gaps require auditor review.",
        "missing_documents": [gap["clause"] for gap in gaps if not gap["evidence"]],
    }


def audit_evidence_package() -> dict[str, Any]:
    gaps = compliance_gaps()
    return {
        "package_title": "Plant A Rotating Equipment and Pressure Safety Evidence Package",
        "summary": gaps["audit_summary"],
        "included_evidence": gaps["covered"],
        "exceptions": gaps["gaps"],
        "auditor_notes": [
            "Every compliance claim must retain source document citation.",
            "Uncovered clauses should be assigned to procedure owners before audit submission.",
        ],
    }
