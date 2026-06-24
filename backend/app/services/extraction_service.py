from __future__ import annotations

import re
from collections import defaultdict
from typing import Any

ASSET_RE = re.compile(r"\b(?:P|C|B|HX|V|EP)-?\d{3}\b")
WORK_ORDER_RE = re.compile(r"\bWO-\d{4,6}\b")
INSPECTION_RE = re.compile(r"\bINSP-\d{4,6}\b")
SOP_RE = re.compile(r"\bSOP-[A-Z]{2,5}-\d{2,4}\b")
CLAUSE_RE = re.compile(r"\b(?:OSHA|API|ISO|NFPA|EPA|ASME)[- ]?[A-Z0-9.:]+\b")
DATE_RE = re.compile(r"\b20\d{2}-\d{2}-\d{2}\b")
ALARM_RE = re.compile(r"\b(?:ALM|TRIP|FAULT)-[A-Z0-9-]+\b")

FAILURE_TERMS = [
    "seal failure",
    "bearing wear",
    "vibration",
    "cavitation",
    "corrosion",
    "tube leak",
    "overpressure",
    "overheating",
    "insulation breakdown",
    "non-conformance",
]
ACTION_TERMS = [
    "replaced",
    "lubricated",
    "aligned",
    "torqued",
    "isolated",
    "cleaned",
    "calibrated",
    "inspected",
    "pressure tested",
    "verified",
]
HAZARD_TERMS = ["hot work", "confined space", "line break", "stored energy", "hydrogen sulfide", "arc flash"]
SPARE_RE = re.compile(r"\b(?:mechanical seal|bearing kit|gasket set|impeller|filter element|relief valve|RTD|contactor)\b", re.I)
LOCATION_RE = re.compile(r"\b(?:Unit|Area|Train|Bay)\s+[A-Z0-9-]+\b")
ROLE_RE = re.compile(r"\b(?:technician|operator|reliability engineer|safety officer|quality manager|auditor|supervisor)\b", re.I)


def _add(found: dict[str, list[dict[str, Any]]], entity_type: str, name: str, **metadata: Any) -> None:
    clean = name.strip(" .,;:")
    if not clean:
        return
    found[entity_type].append({"type": entity_type, "name": clean, "metadata": metadata, "confidence": metadata.pop("confidence", 0.84)})


def extract_entities(text: str) -> list[dict[str, Any]]:
    found: dict[str, list[dict[str, Any]]] = defaultdict(list)
    lower = text.lower()

    for asset in sorted(set(ASSET_RE.findall(text))):
        prefix = re.match(r"^(P|C|B|HX|V|EP)", asset).group(1)  # type: ignore[union-attr]
        asset_type = {"P": "Pump", "C": "Compressor", "B": "Boiler", "HX": "HeatExchanger", "V": "PressureVessel", "EP": "ElectricalPanel"}.get(prefix, "Asset")
        normalized = re.sub(r"^(P|C|B|HX|V|EP)-?(\d{3})$", r"\1-\2", asset)
        _add(found, "Asset", normalized, asset_type=asset_type)
    for value in sorted(set(WORK_ORDER_RE.findall(text))):
        _add(found, "WorkOrder", value)
    for value in sorted(set(INSPECTION_RE.findall(text))):
        _add(found, "InspectionFinding", value)
    for value in sorted(set(SOP_RE.findall(text))):
        _add(found, "Procedure", value)
    for value in sorted(set(CLAUSE_RE.findall(text))):
        _add(found, "Regulation", value)
    for value in sorted(set(DATE_RE.findall(text))):
        _add(found, "Date", value)
    for value in sorted(set(ALARM_RE.findall(text))):
        _add(found, "AlarmCode", value)
    for match in SPARE_RE.findall(text):
        _add(found, "SparePart", match.title())
    for match in LOCATION_RE.findall(text):
        _add(found, "Location", match)
    for match in ROLE_RE.findall(text):
        _add(found, "PersonnelRole", match.title())

    for term in FAILURE_TERMS:
        if term in lower:
            _add(found, "FailureMode", term.title())
    for term in ACTION_TERMS:
        if term in lower:
            _add(found, "MaintenanceAction", term.title())
    for term in HAZARD_TERMS:
        if term in lower:
            _add(found, "SafetyHazard", term.title())
    if "quality deviation" in lower or "non-conformance" in lower or "out of tolerance" in lower:
        _add(found, "QualityIssue", "Quality Non-Conformance")

    seen: set[tuple[str, str]] = set()
    unique: list[dict[str, Any]] = []
    for values in found.values():
        for entity in values:
            key = (entity["type"], entity["name"].lower())
            if key not in seen:
                seen.add(key)
                unique.append(entity)
    return unique


def infer_relationships(text: str, entities: list[dict[str, Any]]) -> list[dict[str, Any]]:
    names_by_type: dict[str, list[str]] = defaultdict(list)
    for entity in entities:
        names_by_type[entity["type"]].append(entity["name"])

    relationships: list[dict[str, Any]] = []
    assets = names_by_type.get("Asset", [])
    for asset in assets:
        for failure in names_by_type.get("FailureMode", []):
            relationships.append({"source_type": "Asset", "source_name": asset, "relationship": "ASSET_FAILED_WITH", "target_type": "FailureMode", "target_name": failure})
        for action in names_by_type.get("MaintenanceAction", []):
            relationships.append({"source_type": "MaintenanceAction", "source_name": action, "relationship": "WORKORDER_PERFORMED_ON", "target_type": "Asset", "target_name": asset})
        for finding in names_by_type.get("InspectionFinding", []):
            relationships.append({"source_type": "InspectionFinding", "source_name": finding, "relationship": "INSPECTION_FOUND", "target_type": "Asset", "target_name": asset})
        for procedure in names_by_type.get("Procedure", []):
            relationships.append({"source_type": "Procedure", "source_name": procedure, "relationship": "PROCEDURE_REFERENCES_ASSET", "target_type": "Asset", "target_name": asset})
        for spare in names_by_type.get("SparePart", []):
            relationships.append({"source_type": "SparePart", "source_name": spare, "relationship": "SPARE_PART_USED_IN", "target_type": "Asset", "target_name": asset})
    for regulation in names_by_type.get("Regulation", []):
        for procedure in names_by_type.get("Procedure", []):
            relationships.append({"source_type": "Regulation", "source_name": regulation, "relationship": "REGULATION_APPLIES_TO", "target_type": "Procedure", "target_name": procedure})
    if "root cause" in text.lower() or "caused by" in text.lower():
        for failure in names_by_type.get("FailureMode", []):
            relationships.append({"source_type": "FailureMode", "source_name": failure, "relationship": "FAILURE_CAUSED_BY", "target_type": "InspectionFinding", "target_name": "Evidence in source"})
    return relationships
