# Qdrant bounded validation

This report supersedes earlier DNS/authentication/collection-unavailable observations. No full migration or deployment was performed.

- Collection: `industrial_brain_evidence_v1`; 384 dimensions, Cosine.
- Scope: `organization_id=industrial-brain-ai`, `plant_id=plant-a`.
- Three labelled demo validation points: maintenance, unrelated quality record, manager-only inspection.
- Every stored vector was checked for exactly 384 finite numeric values before upsert.
- Exact count: 0 before upload, 3 after upload, 3 after repeating the same upsert.
- Plant manager retrieved 3 points; operator retrieved 2, excluding the restricted inspection.
- Wrong organization/plant and independently altered canonical scope fields returned zero points. P101 asset filter returned two points.
- Original passages, full metadata and stable citation identifiers round-tripped exactly. Exact-citation verification passed.
- Content hashes of all 31 existing legacy source/storage files remained unchanged.
- No approved Omi record was available; that optional validation was skipped without creating an approval.
- Qdrant HTTP health: 200, healthy, actual count 3. Readiness: 503 because the full migration/evaluation activation gate remains false.

## Payload indexes

- `tenant`: keyword
- `plant`: keyword
- `organization_id`: keyword
- `plant_id`: keyword
- `asset_tag`: keyword
- `document_id`: keyword
- `document_type`: keyword
- `doc_type`: keyword
- `permission_scope`: keyword
- `source_id`: keyword
- `content_hash`: keyword
- `ingestion_version`: keyword
- `omi_conversation_id`: keyword
- `timestamp`: datetime

## Measured similarity

- maintenance_score: 0.84265596
- restricted_inspection_score: 0.88408273
- unrelated_score: 0.6418812

Similarity scores are not confidence probabilities. Both related records ranked above the unrelated control. Full judge-set retrieval relevance and threshold tuning remain necessary; this small subset is not a production acceptance test. The three validation points remain labelled `validation_only=true`; no cleanup or deletion was authorized or attempted.

The validation script and this report are local, uncommitted additions. No push, merge, Render change or deployment occurred. Collection and index creation plus the three-point upsert were performed under the user's explicit limited approval.

Completed (UTC): 2026-09-13T19:08:25.239Z

READY FOR FULL QDRANT MIGRATION
