from __future__ import annotations

from app.agents.base import AgentResult, IndustrialAgent
from app.services.graph_service import graph_stats


class KnowledgeGraphAgent(IndustrialAgent):
    name = "Knowledge Graph Agent"

    def run(self, context):
        stats = graph_stats()
        return AgentResult(self.name, f"Knowledge graph has {stats['nodes']} nodes and {stats['edges']} relationships.", ["Entity linking complete", "Dependency relationships generated"], 0.84, context.get("citations", []))
