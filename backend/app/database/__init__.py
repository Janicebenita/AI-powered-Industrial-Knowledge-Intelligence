from __future__ import annotations

import json
import sqlite3
from pathlib import Path
from typing import Any, Iterable

ROOT = Path(__file__).resolve().parents[3]
DATA_DIR = ROOT / "backend" / "app" / "data"
UPLOAD_DIR = ROOT / "backend" / "app" / "uploads"
DB_PATH = DATA_DIR / "industrial_brain.db"


def connect() -> sqlite3.Connection:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def execute(sql: str, params: Iterable[Any] = ()) -> None:
    with connect() as conn:
        conn.execute(sql, tuple(params))
        conn.commit()


def query(sql: str, params: Iterable[Any] = ()) -> list[dict[str, Any]]:
    with connect() as conn:
        rows = conn.execute(sql, tuple(params)).fetchall()
    return [dict(row) for row in rows]


def scalar(sql: str, params: Iterable[Any] = ()) -> Any:
    with connect() as conn:
        row = conn.execute(sql, tuple(params)).fetchone()
    if row is None:
        return None
    return row[0]


def dumps(value: Any) -> str:
    return json.dumps(value, ensure_ascii=True, sort_keys=True)


def loads(value: str | None, fallback: Any = None) -> Any:
    if not value:
        return fallback
    return json.loads(value)


def init_db() -> None:
    with connect() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL,
                doc_type TEXT NOT NULL,
                source_path TEXT NOT NULL,
                text TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                owner_role TEXT NOT NULL DEFAULT 'operations',
                permission_level TEXT NOT NULL DEFAULT 'plant'
            );

            CREATE TABLE IF NOT EXISTS chunks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                document_id INTEGER NOT NULL,
                chunk_index INTEGER NOT NULL,
                page_number INTEGER NOT NULL,
                section TEXT NOT NULL,
                text TEXT NOT NULL,
                embedding TEXT NOT NULL,
                FOREIGN KEY(document_id) REFERENCES documents(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS entities (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                document_id INTEGER NOT NULL,
                chunk_id INTEGER,
                entity_type TEXT NOT NULL,
                name TEXT NOT NULL,
                value TEXT,
                metadata TEXT NOT NULL DEFAULT '{}',
                confidence REAL NOT NULL DEFAULT 0.82,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(document_id) REFERENCES documents(id) ON DELETE CASCADE,
                FOREIGN KEY(chunk_id) REFERENCES chunks(id) ON DELETE SET NULL
            );

            CREATE TABLE IF NOT EXISTS entity_relationships (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source_entity_id INTEGER,
                source_type TEXT NOT NULL,
                source_name TEXT NOT NULL,
                relationship TEXT NOT NULL,
                target_entity_id INTEGER,
                target_type TEXT NOT NULL,
                target_name TEXT NOT NULL,
                document_id INTEGER,
                evidence TEXT NOT NULL,
                confidence REAL NOT NULL DEFAULT 0.8,
                FOREIGN KEY(document_id) REFERENCES documents(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS assets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tag TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL,
                asset_type TEXT NOT NULL,
                location TEXT NOT NULL,
                criticality TEXT NOT NULL,
                risk_score INTEGER NOT NULL DEFAULT 50,
                status TEXT NOT NULL DEFAULT 'Monitored'
            );

            CREATE TABLE IF NOT EXISTS failures (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                asset_tag TEXT NOT NULL,
                failure_mode TEXT NOT NULL,
                root_cause TEXT,
                occurred_on TEXT NOT NULL,
                severity TEXT NOT NULL,
                work_order TEXT,
                document_id INTEGER,
                FOREIGN KEY(document_id) REFERENCES documents(id) ON DELETE SET NULL
            );

            CREATE TABLE IF NOT EXISTS work_orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                work_order TEXT NOT NULL UNIQUE,
                asset_tag TEXT NOT NULL,
                action TEXT NOT NULL,
                performed_on TEXT NOT NULL,
                role TEXT NOT NULL,
                status TEXT NOT NULL,
                document_id INTEGER
            );

            CREATE TABLE IF NOT EXISTS inspections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                inspection_id TEXT NOT NULL UNIQUE,
                asset_tag TEXT NOT NULL,
                finding TEXT NOT NULL,
                inspected_on TEXT NOT NULL,
                severity TEXT NOT NULL,
                next_due TEXT NOT NULL,
                document_id INTEGER
            );

            CREATE TABLE IF NOT EXISTS regulations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                clause TEXT NOT NULL UNIQUE,
                requirement TEXT NOT NULL,
                applies_to TEXT NOT NULL,
                evidence_status TEXT NOT NULL DEFAULT 'unmapped'
            );

            CREATE TABLE IF NOT EXISTS procedures (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                procedure_id TEXT NOT NULL UNIQUE,
                title TEXT NOT NULL,
                applies_to TEXT NOT NULL,
                revision TEXT NOT NULL,
                document_id INTEGER
            );

            CREATE TABLE IF NOT EXISTS chat_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                user_role TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS citations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                answer_id TEXT NOT NULL,
                document_id INTEGER NOT NULL,
                chunk_id INTEGER NOT NULL,
                quote TEXT NOT NULL,
                page_number INTEGER NOT NULL,
                confidence REAL NOT NULL
            );

            CREATE TABLE IF NOT EXISTS audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                actor TEXT NOT NULL,
                action TEXT NOT NULL,
                target TEXT NOT NULL,
                detail TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            """
        )
        conn.commit()


def clear_demo_data() -> None:
    with connect() as conn:
        for table in [
            "citations",
            "chat_sessions",
            "entity_relationships",
            "entities",
            "chunks",
            "failures",
            "work_orders",
            "inspections",
            "regulations",
            "procedures",
            "assets",
            "documents",
            "audit_logs",
        ]:
            conn.execute(f"DELETE FROM {table}")
        conn.commit()
