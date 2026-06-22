from __future__ import annotations

import csv
import shutil
from pathlib import Path
from typing import Any

import pandas as pd
from fastapi import UploadFile

from app.database import UPLOAD_DIR, connect, dumps, loads
from app.services.embedding_service import embed_text
from app.services.extraction_service import extract_entities, infer_relationships


def chunk_text(text: str, max_chars: int = 900) -> list[dict[str, Any]]:
    sections: list[dict[str, Any]] = []
    current = ""
    section = "General"
    page = 1
    for raw in text.splitlines():
        line = raw.strip()
        if not line:
            continue
        if line.startswith("#"):
            section = line.lstrip("# ").strip() or section
        if len(current) + len(line) > max_chars and current:
            sections.append({"text": current.strip(), "section": section, "page_number": page})
            current = ""
            page += 1
        current += line + "\n"
    if current.strip():
        sections.append({"text": current.strip(), "section": section, "page_number": page})
    return sections or [{"text": text[:max_chars], "section": "General", "page_number": 1}]


def read_document(path: Path) -> str:
    suffix = path.suffix.lower()
    if suffix in {".txt", ".md", ".log"}:
        return path.read_text(encoding="utf-8", errors="ignore")
    if suffix == ".csv":
        rows = []
        with path.open("r", encoding="utf-8", errors="ignore", newline="") as handle:
            for row in csv.DictReader(handle):
                rows.append("; ".join(f"{key}: {value}" for key, value in row.items()))
        return "\n".join(rows)
    if suffix in {".xlsx", ".xls"}:
        frames = pd.read_excel(path, sheet_name=None)
        lines = []
        for sheet, frame in frames.items():
            lines.append(f"# Sheet {sheet}")
            lines.append(frame.fillna("").to_csv(index=False))
        return "\n".join(lines)
    if suffix == ".pdf":
        try:
            from pypdf import PdfReader

            reader = PdfReader(str(path))
            return "\n".join(page.extract_text() or "" for page in reader.pages)
        except Exception as exc:
            return f"OCR_REQUIRED: Could not extract PDF text locally. Error: {exc}"
    return path.read_text(encoding="utf-8", errors="ignore")


def infer_doc_type(filename: str, text: str) -> str:
    lower = f"{filename} {text[:500]}".lower()
    if "sop" in lower or "procedure" in lower:
        return "SOP"
    if "inspection" in lower or "insp-" in lower:
        return "InspectionReport"
    if "work order" in lower or "wo-" in lower:
        return "MaintenanceWorkOrder"
    if "checklist" in lower or "regulation" in lower or "osha" in lower or "api" in lower:
        return "RegulatoryChecklist"
    if "incident" in lower:
        return "IncidentReport"
    if "metadata" in lower or "drawing" in lower or "p&id" in lower:
        return "EngineeringMetadata"
    return "IndustrialDocument"


def ingest_path(path: Path, owner_role: str = "operations") -> dict[str, Any]:
    text = read_document(path)
    doc_type = infer_doc_type(path.name, text)
    chunks = chunk_text(text)
    all_entities: list[dict[str, Any]] = []

    with connect() as conn:
        cursor = conn.execute(
            "INSERT INTO documents(filename, doc_type, source_path, text, owner_role) VALUES (?, ?, ?, ?, ?)",
            (path.name, doc_type, str(path), text, owner_role),
        )
        document_id = cursor.lastrowid
        for index, chunk in enumerate(chunks):
            embedding = dumps(embed_text(chunk["text"]))
            chunk_cursor = conn.execute(
                "INSERT INTO chunks(document_id, chunk_index, page_number, section, text, embedding) VALUES (?, ?, ?, ?, ?, ?)",
                (document_id, index, chunk["page_number"], chunk["section"], chunk["text"], embedding),
            )
            chunk_id = chunk_cursor.lastrowid
            entities = extract_entities(chunk["text"])
            all_entities.extend(entities)
            inserted: dict[tuple[str, str], int] = {}
            for entity in entities:
                entity_cursor = conn.execute(
                    "INSERT INTO entities(document_id, chunk_id, entity_type, name, metadata, confidence) VALUES (?, ?, ?, ?, ?, ?)",
                    (document_id, chunk_id, entity["type"], entity["name"], dumps(entity.get("metadata", {})), entity.get("confidence", 0.84)),
                )
                inserted[(entity["type"], entity["name"])] = entity_cursor.lastrowid
            for rel in infer_relationships(chunk["text"], entities):
                conn.execute(
                    """
                    INSERT INTO entity_relationships(
                        source_entity_id, source_type, source_name, relationship, target_entity_id,
                        target_type, target_name, document_id, evidence, confidence
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        inserted.get((rel["source_type"], rel["source_name"])),
                        rel["source_type"],
                        rel["source_name"],
                        rel["relationship"],
                        inserted.get((rel["target_type"], rel["target_name"])),
                        rel["target_type"],
                        rel["target_name"],
                        document_id,
                        chunk["text"][:420],
                        0.82,
                    ),
                )
        conn.execute("INSERT INTO audit_logs(actor, action, target, detail) VALUES (?, ?, ?, ?)", (owner_role, "ingest", path.name, f"Processed {len(chunks)} chunks"))
        conn.commit()

    return {"document_id": document_id, "filename": path.name, "doc_type": doc_type, "chunks": len(chunks), "entities": all_entities}


async def ingest_upload(file: UploadFile, owner_role: str = "operations") -> dict[str, Any]:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    target = UPLOAD_DIR / file.filename
    with target.open("wb") as handle:
        shutil.copyfileobj(file.file, handle)
    return ingest_path(target, owner_role=owner_role)
