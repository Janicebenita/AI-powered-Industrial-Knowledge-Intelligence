from __future__ import annotations

from app.agents.base import AgentResult, IndustrialAgent
from app.services.maintenance_service import maintenance_dashboard


class LessonsLearnedAgent(IndustrialAgent):
    name = "Lessons Learned Agent"

    def run(self, context):
        patterns = maintenance_dashboard()["failure_patterns"]
        findings = [f"{row['failure_mode']} appeared {row['count']} time(s)" for row in patterns]
        return AgentResult(self.name, "Lessons learned generated from incidents, failures, and findings.", findings, 0.79, context.get("citations", []))
