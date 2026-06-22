from __future__ import annotations

from app.agents.base import AgentResult, IndustrialAgent
from app.services.compliance_service import compliance_gaps


class ComplianceAgent(IndustrialAgent):
    name = "Compliance Agent"

    def run(self, context):
        gaps = compliance_gaps()["gaps"]
        return AgentResult(self.name, f"Detected {len(gaps)} compliance gaps.", [gap["clause"] for gap in gaps], 0.8, context.get("citations", []))
