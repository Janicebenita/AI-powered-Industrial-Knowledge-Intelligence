from __future__ import annotations

from collections import Counter
from typing import Any

from app.database import query


def asset_360(asset_tag: str) -> dict[str, Any]:
    assets = query("SELECT * FROM assets WHERE tag = ?", (asset_tag,))
    asset = assets[0] if assets else {"tag": asset_tag, "name": asset_tag, "asset_type": "Unknown", "location": "Unknown", "criticality": "Unknown", "risk_score": 40, "status": "Unverified"}
    failures = query("SELECT * FROM failures WHERE asset_tag = ? ORDER BY occurred_on DESC", (asset_tag,))
    work_orders = query("SELECT * FROM work_orders WHERE asset_tag = ? ORDER BY performed_on DESC", (asset_tag,))
    inspections = query("SELECT * FROM inspections WHERE asset_tag = ? ORDER BY inspected_on DESC", (asset_tag,))
    documents = query(
        """
        SELECT DISTINCT d.id, d.filename, d.doc_type, d.created_at
        FROM documents d
        JOIN entities e ON e.document_id = d.id
        WHERE e.name = ?
        ORDER BY d.created_at DESC
        """,
        (asset_tag,),
    )
    failure_counts = Counter(row["failure_mode"] for row in failures)
    return {
        "asset": asset,
        "failures": failures,
        "work_orders": work_orders,
        "inspections": inspections,
        "documents": documents,
        "failure_modes": [{"name": name, "count": count} for name, count in failure_counts.most_common()],
        "risk_drivers": _risk_drivers(failures, inspections),
    }


def _risk_drivers(failures: list[dict[str, Any]], inspections: list[dict[str, Any]]) -> list[str]:
    drivers = []
    counts = Counter(row["failure_mode"] for row in failures)
    drivers.extend(f"Repeated {name}" for name, count in counts.items() if count >= 2)
    drivers.extend(f"Open inspection: {row['finding']}" for row in inspections if row["severity"].lower() in {"high", "critical"})
    return drivers or ["No critical repeated patterns in available evidence"]


def maintenance_dashboard() -> dict[str, Any]:
    assets = query("SELECT * FROM assets ORDER BY risk_score DESC")
    failures = query("SELECT * FROM failures")
    failure_counts = Counter(row["failure_mode"] for row in failures)
    incomplete = []
    for asset in assets:
        counts = query("SELECT COUNT(*) AS count FROM work_orders WHERE asset_tag = ?", (asset["tag"],))[0]["count"]
        if counts == 0:
            incomplete.append(asset["tag"])
    return {
        "assets": assets,
        "failure_patterns": [{"failure_mode": name, "count": count} for name, count in failure_counts.most_common()],
        "incomplete_maintenance_history": incomplete,
        "high_risk_assets": [asset for asset in assets if asset["risk_score"] >= 70],
    }


def rca_for_asset(asset_tag: str) -> dict[str, Any]:
    asset = asset_360(asset_tag)
    repeated = [item["name"] for item in asset["failure_modes"] if item["count"] >= 2]
    causes = []
    text = " ".join(row.get("root_cause") or "" for row in asset["failures"]).lower()
    if "misalignment" in text or "alignment" in text:
        causes.append("shaft misalignment after seal replacement")
    if "cavitation" in text or "suction" in text:
        causes.append("low suction pressure or blocked strainer causing cavitation")
    if "lubrication" in text or "bearing" in text:
        causes.append("lubrication contamination or bearing degradation")
    if not causes:
        causes.append("insufficient evidence to isolate one cause; trend review required")
    actions = [
        "Verify alignment, coupling condition, and baseplate soft foot.",
        "Check suction pressure, strainer DP, and operating point against pump curve.",
        "Inspect seal flush plan and confirm correct spare part specification.",
        "Create follow-up work order and attach vibration trend evidence.",
    ]
    return {
        "asset": asset["asset"],
        "repeated_failure_modes": repeated,
        "likely_root_causes": causes,
        "recommended_actions": actions,
        "summary": f"RCA draft: {asset_tag} has {len(asset['failures'])} recorded failures. The dominant pattern is {', '.join(repeated) if repeated else 'not yet statistically repeated'}, supported by cited work orders and inspection records.",
        "evidence_documents": asset["documents"],
    }
