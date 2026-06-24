from __future__ import annotations

from pathlib import Path

from app.database import ROOT, clear_demo_data, connect, init_db
from app.services.ingestion_service import ingest_path

SAMPLE_DIR = ROOT / "sample_data" / "documents"

DOCUMENTS = {
    "WO-10421_P-101_mechanical_seal.txt": """
# Maintenance Work Order WO-10421
Date: 2025-08-14
Asset: P-101 Condensate Transfer Pump in Unit A
Technician recorded high vibration and seal failure on P-101. ALM-VIB-HI was active for 4 hours.
Action: isolated pump, replaced mechanical seal, aligned coupling, lubricated bearing kit, verified seal flush.
Root cause note: possible shaft misalignment after prior outage and low suction pressure causing cavitation.
Spare parts: mechanical seal, bearing kit, gasket set.
""",
    "WO-10877_P-101_vibration_repeat.txt": """
# Maintenance Work Order WO-10877
Date: 2026-02-19
Asset: P-101 Condensate Transfer Pump, Unit A
Repeated vibration and seal failure observed. Operator reported intermittent cavitation noise and suction strainer fouling.
Action: cleaned suction strainer, replaced mechanical seal, pressure tested flush line, verified alignment.
Reliability engineer requested RCA for repeated seal failure.
""",
    "SOP-MECH-014_pump_isolation.txt": """
# SOP-MECH-014 Pump Isolation and Seal Replacement
Revision: 7
Applies to: P-101, P-102 and centrifugal process pumps
Before opening pump casing, technician must lock out stored energy, drain process fluid, verify zero pressure, and confirm seal flush isolation.
Safety hazards: line break, stored energy, hot work when coupling guard modification is required.
Regulatory references: OSHA-1910.147 and ISO-14224.
""",
    "INSP-5521_heat_exchanger_corrosion.txt": """
# Inspection Report INSP-5521
Date: 2026-03-12
Asset: HX-301 Cooling Water Heat Exchanger in Area CW-2
Finding: localized corrosion and early tube leak indication on tube sheet. Severity: High.
Recommended action: clean deposits, inspect coating, pressure tested bundle before return to service.
Next due: 2026-09-12.
""",
    "SOP-VES-203_pressure_vessel_entry.txt": """
# SOP-VES-203 Vessel Opening and Confined Space Entry
Revision: 4
Applies to: V-203 pressure vessel, Area A-3
Before opening vessel V-203, safety officer must verify isolation blinds, gas test, confined space permit, rescue plan, and zero pressure.
Safety hazards: confined space, stored energy, hydrogen sulfide.
Regulatory references: OSHA-1910.146 and ASME-VIII.
""",
    "INC-771_compressor_trip.txt": """
# Incident Report INC-771
Date: 2026-01-27
Asset: C-201 Instrument Air Compressor in Train 2
Incident: TRIP-OIL-LOW caused compressor shutdown. Inspection found oil filter element collapsed and bearing wear.
Action: replaced filter element, inspected bearing, calibrated pressure switch.
Potential root cause: overdue preventive maintenance interval.
""",
    "REG-PSM-Checklist.txt": """
# Regulatory Checklist Plant A
OSHA-1910.147: Lockout/tagout procedure must cover stored energy isolation for pumps and electrical panels. Applies to P-101.
OSHA-1910.146: Confined space entry permit and rescue plan must be documented for pressure vessels. Applies to V-203.
API-510: Pressure vessel external inspection evidence must be available at required interval. Applies to V-203.
NFPA-70E: Arc flash labeling and energized work procedure must be available for electrical panels. Applies to EP-401.
ISO-14224: Failure data taxonomy should be recorded for rotating equipment. Applies to P-101 and C-201.
""",
    "Engineering_Metadata_Assets.csv": """tag,name,asset_type,location,criticality,status
P-101,Condensate Transfer Pump,Pump,Unit A,High,At Risk
C-201,Instrument Air Compressor,Compressor,Train 2,High,Monitored
B-501,Package Boiler,Boiler,Boiler House,Medium,Monitored
HX-301,Cooling Water Heat Exchanger,Heat Exchanger,Area CW-2,High,Inspection Due
V-203,Knockout Drum,Pressure Vessel,Area A-3,Critical,Permit Required
EP-401,MCC Electrical Panel,Electrical Panel,Bay E-4,High,Evidence Missing
""",
}


def write_sample_files() -> None:
    SAMPLE_DIR.mkdir(parents=True, exist_ok=True)
    for filename, text in DOCUMENTS.items():
        (SAMPLE_DIR / filename).write_text(text.strip() + "\n", encoding="utf-8")


def seed_demo(force: bool = False) -> None:
    init_db()
    with connect() as conn:
        existing = conn.execute("SELECT COUNT(*) FROM documents").fetchone()[0]
    if existing and not force:
        return
    clear_demo_data()
    write_sample_files()
    for path in sorted(SAMPLE_DIR.iterdir()):
        ingest_path(path)

    with connect() as conn:
        conn.executemany(
            "INSERT INTO assets(tag, name, asset_type, location, criticality, risk_score, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
                ("P-101", "Condensate Transfer Pump", "Pump", "Unit A", "High", 88, "At Risk"),
                ("C-201", "Instrument Air Compressor", "Compressor", "Train 2", "High", 71, "Monitored"),
                ("B-501", "Package Boiler", "Boiler", "Boiler House", "Medium", 46, "Monitored"),
                ("HX-301", "Cooling Water Heat Exchanger", "Heat Exchanger", "Area CW-2", "High", 76, "Inspection Due"),
                ("V-203", "Knockout Drum", "Pressure Vessel", "Area A-3", "Critical", 69, "Permit Required"),
                ("EP-401", "MCC Electrical Panel", "Electrical Panel", "Bay E-4", "High", 73, "Evidence Missing"),
            ],
        )
        docs = {row["filename"]: row["id"] for row in conn.execute("SELECT id, filename FROM documents").fetchall()}
        conn.executemany(
            "INSERT INTO failures(asset_tag, failure_mode, root_cause, occurred_on, severity, work_order, document_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
                ("P-101", "Seal Failure", "Shaft misalignment and low suction pressure causing cavitation", "2025-08-14", "High", "WO-10421", docs["WO-10421_P-101_mechanical_seal.txt"]),
                ("P-101", "Vibration", "Suction strainer fouling and cavitation", "2026-02-19", "High", "WO-10877", docs["WO-10877_P-101_vibration_repeat.txt"]),
                ("P-101", "Seal Failure", "Repeated vibration damaging mechanical seal", "2026-02-19", "High", "WO-10877", docs["WO-10877_P-101_vibration_repeat.txt"]),
                ("C-201", "Bearing Wear", "Overdue preventive maintenance interval", "2026-01-27", "Medium", None, docs["INC-771_compressor_trip.txt"]),
                ("HX-301", "Corrosion", "Cooling water deposits on tube sheet", "2026-03-12", "High", None, docs["INSP-5521_heat_exchanger_corrosion.txt"]),
            ],
        )
        conn.executemany(
            "INSERT INTO work_orders(work_order, asset_tag, action, performed_on, role, status, document_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
                ("WO-10421", "P-101", "Replaced mechanical seal, aligned coupling, lubricated bearing kit", "2025-08-14", "Technician", "Closed", docs["WO-10421_P-101_mechanical_seal.txt"]),
                ("WO-10877", "P-101", "Cleaned suction strainer, replaced mechanical seal, verified alignment", "2026-02-19", "Reliability Engineer", "RCA Requested", docs["WO-10877_P-101_vibration_repeat.txt"]),
            ],
        )
        conn.executemany(
            "INSERT INTO inspections(inspection_id, asset_tag, finding, inspected_on, severity, next_due, document_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
                ("INSP-5521", "HX-301", "Localized corrosion and early tube leak indication", "2026-03-12", "High", "2026-09-12", docs["INSP-5521_heat_exchanger_corrosion.txt"]),
                ("INSP-P101-22", "P-101", "Vibration trend review required after repeated seal failure", "2026-02-20", "Medium", "2026-08-20", docs["WO-10877_P-101_vibration_repeat.txt"]),
            ],
        )
        conn.executemany(
            "INSERT INTO regulations(clause, requirement, applies_to, evidence_status) VALUES (?, ?, ?, ?)",
            [
                ("OSHA-1910.147", "Lockout/tagout procedure must cover stored energy isolation.", "P-101", "covered"),
                ("OSHA-1910.146", "Confined space permit and rescue plan required.", "V-203", "covered"),
                ("API-510", "Pressure vessel external inspection evidence must be available.", "V-203", "missing"),
                ("NFPA-70E", "Arc flash labeling and energized work procedure required.", "EP-401", "missing"),
                ("ISO-14224", "Failure data taxonomy should be recorded for rotating equipment.", "P-101", "partial"),
            ],
        )
        conn.executemany(
            "INSERT INTO procedures(procedure_id, title, applies_to, revision, document_id) VALUES (?, ?, ?, ?, ?)",
            [
                ("SOP-MECH-014", "Pump Isolation and Seal Replacement", "P-101", "7", docs["SOP-MECH-014_pump_isolation.txt"]),
                ("SOP-VES-203", "Vessel Opening and Confined Space Entry", "V-203", "4", docs["SOP-VES-203_pressure_vessel_entry.txt"]),
            ],
        )
        conn.execute("INSERT INTO audit_logs(actor, action, target, detail) VALUES (?, ?, ?, ?)", ("system", "seed", "demo", "Seeded realistic industrial demo dataset"))
        conn.commit()
