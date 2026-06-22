from __future__ import annotations

from app.agents.compliance_agent import ComplianceAgent
from app.agents.document_intelligence import DocumentIntelligenceAgent
from app.agents.executive_insights_agent import ExecutiveInsightsAgent
from app.agents.knowledge_graph_agent import KnowledgeGraphAgent
from app.agents.lessons_learned_agent import LessonsLearnedAgent
from app.agents.maintenance_agent import MaintenanceIntelligenceAgent
from app.agents.rca_agent import RCAAgent


AGENTS = [
    DocumentIntelligenceAgent(),
    KnowledgeGraphAgent(),
    MaintenanceIntelligenceAgent(),
    ComplianceAgent(),
    RCAAgent(),
    LessonsLearnedAgent(),
    ExecutiveInsightsAgent(),
]


def run_agents(context: dict) -> list[dict]:
    return [agent.run(context).__dict__ for agent in AGENTS]
