# Industrial Evidence Analyst: Explainability

## Decision and reasoning

The system decides whether an asset question calls for deterministic maintenance-history retrieval or an evidence-grounded root-cause analysis. For history, it parses and validates scoped work-order passages and returns accepted records in date order; for analysis, the Lyzr orchestrator drafts facts and hypotheses from retrieved evidence and an independent verifier checks claim support and citations. Unsupported claims and missing citations are rejected, while possible causes remain hypotheses for engineering review.

## Inputs and data sources

Inputs include an authenticated user's question, authorized organization and plant scope, an asset identifier when relevant, and retrieved passages from the project's Qdrant evidence collection. Data sources described in the repository include maintenance work orders, inspections, equipment manuals, SOPs, safety and compliance documents, incident records, engineering notes, and approved Omi conversation segments. Released evidence is tied to citation identifiers, source passages, filenames, content hashes, ingestion versions, and provenance where available.

## Limits and known constraints

The key limitation is that retrieved maintenance history does not prove the entire external record has been found, and generated root-cause output may vary. Model confidence is not calibrated, some dashboards contain labelled demonstration data, and the Render Free deployment uses temporary storage and a single-instance integration design. The assistant must not treat a cited hypothesis as a verified mechanism or claim authority to approve maintenance, safety, compliance, or corrective work; operational decisions remain with authorized humans.

## Implementation in This Repository

`backend/app/main.py` exposes the backend application, and `backend/app/agents/orchestrator.py` coordinates the repository's specialist-agent workflow. The adjacent backend agent modules retrieve and synthesize authorized evidence, while the API returns the answer, citations, and supporting metadata to the caller.

The implementation therefore separates retrieved source material from generated reasoning and preserves human authority over maintenance decisions. The OpenGAP files describe that concrete code path rather than an external or hypothetical agent.
