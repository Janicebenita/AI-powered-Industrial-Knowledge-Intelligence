from __future__ import annotations

from fastapi import APIRouter, Depends

from app.agents.orchestrator import run_agents
from app.core.security import require_permission

router = APIRouter(prefix="/agents", tags=["agents"], dependencies=[Depends(require_permission("read"))])


@router.get("/run")
def run_multi_agent_system(asset_tag: str = "P-101") -> dict:
    return {"asset_tag": asset_tag, "agents": run_agents({"asset_tag": asset_tag})}
