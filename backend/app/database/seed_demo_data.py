from __future__ import annotations

import csv
import shutil
from pathlib import Path
from typing import Any

from app.database import ROOT, connect, init_db, query
from app.services.ingestion_service import ingest_path

DEMO_DATA_DIR = ROOT / "demo-data"
STORAGE_DIR = ROOT / "backend" / "storage" / "documents"


def _document_exists(filename: str) -> bool:
    return bool(query("SELECT id FROM documents WHERE filename = ? LIMIT 1", (filename,)))


def _copy_and_ingest(path: Path) -> dict[str, Any]:
    STORAGE_DIR.mkdir(parents=True, exist_ok=True)
    target = STORAGE_DIR / path.name
    shutil.copy2(path, target)
    if _document_exists(target.name):
        rows = query("SELECT id, filename, doc_type FROM documents WHERE filename = ? LIMIT 1", (target.name,))
        return {"document_id": rows[0]["id"], "filename": target.name, "doc_type": rows[0]["doc_type"], "status": "already_indexed"}
    result = ingest_path(target, owner_role="demo_seed")
    result["status"] = "indexed"
    return result


def _seed_assets() -> int:
    asset_file = DEMO_DATA_DIR / "asset_register.csv"
    rows = list(csv.DictReader(asset_file.open("r", encoding="utf-8")))
    with connect() as conn:
        for row in rows:
            conn.execute(
                """
                INSERT OR IGNORE INTO assets(tag, name, asset_type, location, criticality, risk_score, status)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (row["asset_tag"], row["asset_name"], row["asset_type"], row["location"], row["criticality"], int(row["risk_score"]), row["operating_status"]),
            )
        conn.commit()
    return len(rows)


def _seed_maintenance_records() -> dict[str, int]:
    work_orders = list(csv.DictReader((DEMO_DATA_DIR / "maintenance_work_orders.csv").open("r", encoding="utf-8")))
    inserted = {"work_orders": 0, "failures": 0}
    with connect() as conn:
        for row in work_orders:
            conn.execute(
                """
                INSERT OR IGNORE INTO work_orders(work_order, asset_tag, action, performed_on, role, status, document_id)
                VALUES (?, ?, ?, ?, ?, ?, NULL)
                """,
                (row["work_order"], row["asset_tag"], row["maintenance_action"], row["date"], row["role"], row["status"]),
            )
            inserted["work_orders"] += 1
            for failure_mode in [item.strip() for item in row["failure_mode"].split(";") if item.strip()]:
                exists = conn.execute(
                    "SELECT id FROM failures WHERE asset_tag = ? AND failure_mode = ? AND occurred_on = ? AND work_order = ?",
                    (row["asset_tag"], failure_mode.title(), row["date"], row["work_order"]),
                ).fetchone()
                if not exists:
                    conn.execute(
                        """
                        INSERT INTO failures(asset_tag, failure_mode, root_cause, occurred_on, severity, work_order, document_id)
                        VALUES (?, ?, ?, ?, ?, ?, NULL)
                        """,
                        (row["asset_tag"], failure_mode.title(), row["notes"], row["date"], "High" if row["asset_tag"] in {"P101", "HX401", "EP501"} else "Medium", row["work_order"]),
                    )
                    inserted["failures"] += 1
        conn.commit()
    return inserted


def _seed_inspections_and_compliance() -> dict[str, int]:
    compliance_rows = list(csv.DictReader((DEMO_DATA_DIR / "OISD_Checklist.csv").open("r", encoding="utf-8")))
    with connect() as conn:
        inspection_seed = [
            ("INSP-P101-DEMO", "P101", "Repeated vibration anomaly, low seal flush flow, and elevated suction strainer differential pressure", "2026-02-20", "High", "2026-08-20"),
            ("INSP-HX401-DEMO", "HX401", "Corrosion under insulation and tube sheet pitting; pressure test evidence required", "2026-04-02", "High", "2026-07-02"),
            ("INSP-V203-DEMO", "V203", "Pressure vessel inspection certificate missing; pressure test overdue", "2026-05-18", "High", "2026-06-30"),
            ("INSP-EP501-DEMO", "EP501", "Arc flash label outdated and energized work procedure missing", "2026-06-18", "Critical", "2026-07-18"),
        ]
        for row in inspection_seed:
            conn.execute(
                "INSERT OR IGNORE INTO inspections(inspection_id, asset_tag, finding, inspected_on, severity, next_due, document_id) VALUES (?, ?, ?, ?, ?, ?, NULL)",
                row,
            )
        for row in compliance_rows:
            conn.execute(
                "INSERT OR IGNORE INTO regulations(clause, requirement, applies_to, evidence_status) VALUES (?, ?, ?, ?)",
                (row["clause"], row["requirement"], row["applies_to"], row["evidence_status"].lower()),
            )
        conn.commit()
    return {"inspections": len(inspection_seed), "compliance_gaps": sum(1 for row in compliance_rows if row["evidence_status"].lower() != "covered")}


def _seed_graph_relationships() -> int:
    relationships = [
        ("Asset", "P101", "ASSET_FAILED_WITH", "FailureMode", "Seal Failure", "Demo RCA evidence"),
        ("Asset", "P101", "ASSET_FAILED_WITH", "FailureMode", "Cavitation", "Inspection report P101"),
        ("Procedure", "SOP-22", "PROCEDURE_REFERENCES_ASSET", "Asset", "P101", "Pump isolation SOP"),
        ("Regulation", "OISD-244-ELECT", "REGULATION_APPLIES_TO", "Asset", "EP501", "OISD checklist"),
        ("QualityIssue", "QA12", "QUALITY_ISSUE_AFFECTS_ASSET", "Asset", "HX401", "Quality non-conformance"),
        ("Incident", "INC-C201-2026-01", "INCIDENT_RELATED_TO", "Asset", "C201", "Compressor trip report"),
        ("SafetyRule", "LOTO-PLANT-A-001", "SAFETY_RULE_APPLIES_TO", "Asset", "P101", "LOTO procedure"),
    ]
    with connect() as conn:
        for source_type, source_name, rel, target_type, target_name, evidence in relationships:
            exists = conn.execute(
                "SELECT id FROM entity_relationships WHERE source_type = ? AND source_name = ? AND relationship = ? AND target_type = ? AND target_name = ?",
                (source_type, source_name, rel, target_type, target_name),
            ).fetchone()
            if not exists:
                conn.execute(
                    """
                    INSERT INTO entity_relationships(source_type, source_name, relationship, target_type, target_name, evidence, confidence)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    (source_type, source_name, rel, target_type, target_name, evidence, 0.88),
                )
        conn.execute("INSERT INTO audit_logs(actor, action, target, detail) VALUES (?, ?, ?, ?)", ("demo_seed", "seed", "demo-data", "Loaded full Industrial Brain AI demo dataset"))
        conn.commit()
    return len(relationships)


def seed_demo_dataset() -> dict[str, Any]:
    init_db()
    if not DEMO_DATA_DIR.exists():
        raise FileNotFoundError(f"Demo data folder not found: {DEMO_DATA_DIR}")

    ingested = []
    for path in sorted(DEMO_DATA_DIR.iterdir()):
        if path.is_file():
            ingested.append(_copy_and_ingest(path))

    asset_count = _seed_assets()
    maintenance = _seed_maintenance_records()
    compliance = _seed_inspections_and_compliance()
    demo_relationships = _seed_graph_relationships()

    totals = {
        "documents": query("SELECT COUNT(*) AS count FROM documents")[0]["count"],
        "assets": query("SELECT COUNT(*) AS count FROM assets")[0]["count"],
        "entities": query("SELECT COUNT(*) AS count FROM entities")[0]["count"],
        "chunks": query("SELECT COUNT(*) AS count FROM chunks")[0]["count"],
        "relationships": query("SELECT COUNT(*) AS count FROM entity_relationships")[0]["count"],
    }
    return {
        "status": "demo_seed_complete",
        "source_folder": str(DEMO_DATA_DIR),
        "storage_folder": str(STORAGE_DIR),
        "files_processed": len(ingested),
        "ingested_documents": ingested,
        "created": {
            "demo_assets": asset_count,
            "demo_relationships": demo_relationships,
            **maintenance,
            **compliance,
        },
        "totals": totals,
    }


if __name__ == "__main__":
    import json

    print(json.dumps(seed_demo_dataset(), indent=2))
