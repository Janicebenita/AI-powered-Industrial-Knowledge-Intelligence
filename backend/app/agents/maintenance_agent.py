from __future__ import annotations

from app.agents.base import AgentResult, IndustrialAgent
from app.services.maintenance_service import maintenance_dashboard


class MaintenanceIntelligenceAgent(IndustrialAgent):
    name = "Maintenance Intelligence Agent"

    def run(self, context):
        dashboard = maintenance_dashboard()
        patterns = [item["failure_mode"] for item in dashboard["failure_patterns"] if item["count"] >= 2]
        return AgentResult(self.name, "Repeated failure analysis completed.", patterns or ["No repeated failure pattern above threshold"], 0.82, context.get("citations", []))
