from __future__ import annotations

from app.agents.base import AgentResult, IndustrialAgent
from app.services.compliance_service import compliance_gaps
from app.services.maintenance_service import maintenance_dashboard


class ExecutiveInsightsAgent(IndustrialAgent):
    name = "Executive Insights Agent"

    def run(self, context):
        maintenance = maintenance_dashboard()
        compliance = compliance_gaps()
        findings = [
            f"{len(maintenance['high_risk_assets'])} high-risk assets need leadership visibility",
            compliance["audit_summary"],
            "Estimated 35-45% search time reduction from cited knowledge retrieval",
        ]
        return AgentResult(self.name, "Executive KPI brief is ready.", findings, 0.81, context.get("citations", []))
