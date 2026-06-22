from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any

from app.services.embedding_service import embed_text


class AIProvider(ABC):
    @abstractmethod
    def summarize(self, prompt: str, evidence: list[dict[str, Any]]) -> str:
        raise NotImplementedError

    @abstractmethod
    def embed(self, text: str) -> dict[str, float]:
        raise NotImplementedError


class LocalEmbeddingProvider(AIProvider):
    def summarize(self, prompt: str, evidence: list[dict[str, Any]]) -> str:
        fragments = " ".join(item.get("text", "")[:180] for item in evidence[:4])
        return f"{prompt}\n\nEvidence-backed summary: {fragments}".strip()

    def embed(self, text: str) -> dict[str, float]:
        return embed_text(text)


class OpenAIProvider(LocalEmbeddingProvider):
    """OpenAI-compatible extension point. Falls back to local deterministic behavior unless wired with an API key."""


class GeminiProvider(LocalEmbeddingProvider):
    """Gemini extension point. Falls back to local deterministic behavior unless wired with an API key."""


def provider_for(name: str | None) -> AIProvider:
    if name == "openai":
        return OpenAIProvider()
    if name == "gemini":
        return GeminiProvider()
    return LocalEmbeddingProvider()
