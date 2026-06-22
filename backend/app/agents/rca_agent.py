from __future__ import annotations

from app.agents.base import AgentResult, IndustrialAgent
from app.services.maintenance_service import rca_for_asset


class RCAAgent(IndustrialAgent):
    name = "RCA Agent"

    def run(self, context):
        asset_tag = context.get("asset_tag", "P-101")
        rca = rca_for_asset(asset_tag)
        return AgentResult(self.name, rca["summary"], rca["likely_root_causes"] + rca["recommended_actions"], 0.83, context.get("citations", []))
