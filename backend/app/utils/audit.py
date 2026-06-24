from __future__ import annotations

from app.database import execute


def audit(actor: str, action: str, target: str, detail: str) -> None:
    execute("INSERT INTO audit_logs(actor, action, target, detail) VALUES (?, ?, ?, ?)", (actor, action, target, detail))
