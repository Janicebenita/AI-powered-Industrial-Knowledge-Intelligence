from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass
class AgentResult:
    agent: str
    summary: str
    findings: list[str]
    confidence: float
    citations: list[dict[str, Any]]


class IndustrialAgent:
    name = "Industrial Agent"

    def run(self, context: dict[str, Any]) -> AgentResult:
        raise NotImplementedError
