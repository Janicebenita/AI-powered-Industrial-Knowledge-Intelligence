# Industrial Evidence Analyst: Explainability

## Decision and reasoning

The system decides whether an asset question calls for deterministic maintenance-history retrieval or an evidence-grounded root-cause analysis. For history, it parses and validates scoped work-order passages and returns accepted records in date order; for analysis, the Lyzr orchestrator drafts facts and hypotheses from retrieved evidence and an independent verifier checks claim support and citations. Unsupported claims and missing citations are rejected, while possible causes remain hypotheses for engineering review.

## Inputs and data sources

Inputs include an authenticated user's question, authorized organization and plant scope, an asset identifier when relevant, and retrieved passages from the project's Qdrant evidence collection. Data sources described in the repository include maintenance work orders, inspections, equipment manuals, SOPs, safety and compliance documents, incident records, engineering notes, and approved Omi conversation segments. Released evidence is tied to citation identifiers, source passages, filenames, content hashes, ingestion versions, and provenance where available.

## Limits and known constraints

The key limitation is that retrieved maintenance history does not prove the entire external record has been found, and generated root-cause output may vary. Model confidence is not calibrated, some dashboards contain labelled demonstration data, and the Render Free deployment uses temporary storage and a single-instance integration design. The assistant must not treat a cited hypothesis as a verified mechanism or claim authority to approve maintenance, safety, compliance, or corrective work; operational decisions remain with authorized humans.

## Implementation in This Repository

`backend/app/main.py` creates the FastAPI service and mounts the repository's authenticated API routes. `backend/app/agents/orchestrator.py` constructs seven concrete specialists—document intelligence, knowledge graph, maintenance intelligence, compliance, root-cause analysis, lessons learned, and executive insights—and `run_agents(context)` runs each specialist over the same authorized context and serializes its result.

The adjacent `backend/app/services` and `backend/app/rag` modules implement ingestion, retrieval, evidence access, citations, and reports, while API schemas structure the response. The code therefore separates retrieved source material from generated reasoning and preserves human authority over maintenance decisions.

## Outputs and supporting evidence

The API returns specialist findings with citations, source identifiers, and supporting metadata assembled from the authorized retrieval context. That provenance lets the reviewer trace a proposed root cause or maintenance action back to the records used.

## Uncertainty and human review

Retrieval may be incomplete and generated hypotheses are not verified mechanisms. Authorized engineers must inspect cited records and approve every safety, compliance, or maintenance action.
