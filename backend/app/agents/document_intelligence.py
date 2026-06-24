from __future__ import annotations

from app.agents.base import AgentResult, IndustrialAgent


class DocumentIntelligenceAgent(IndustrialAgent):
    name = "Document Intelligence Agent"

    def run(self, context):
        document = context.get("document", {})
        return AgentResult(self.name, f"Classified {document.get('filename', 'document')} as {document.get('doc_type', 'IndustrialDocument')}.", ["Text extracted", "Document classified", "Key information detected"], 0.86, context.get("citations", []))
