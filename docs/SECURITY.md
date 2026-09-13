# Security and governance

## New integration boundary

- Provider credentials stay in server-only modules; clients receive no keys or raw provider error bodies. HTTPS URLs reject embedded credentials, query strings and fragments. Redirects are rejected.
- Integration sessions are HMAC-signed, expiring, HttpOnly/SameSite cookies. They are separate from the legacy FastAPI JWT system. Account roles/scopes are reloaded server-side; request role/tenant fields are not trusted.
- Read/write/approval/admin checks precede integration operations. Only plant managers and safety officers review observations/executions. Origin checks and per-process rate limits protect writes. Passwords use salted scrypt.
- Qdrant queries/deletions include tenant, plant and role filters; returned evidence scope and content hash are validated. Capability callbacks are random, expiring and bound to one execution's original question and authenticated scope.
- Uploaded files are restricted to PDF/TXT/CSV/MD/LOG and 10 MiB; extracted content has a size limit. PDFs retain measured page metadata. Scans fail with OCR guidance. Originals are private and retained on deletion for recovery.
- Transcript imports remain pending until reviewed. Failed indexing remains visible. Duplicate source IDs/content hashes do not create duplicate records.
- Retrieved text is untrusted data, separated from workflow instructions. Only exact source quotations may be facts; inference labels are mandatory for other conclusions. Citations are validated, not treated as proof merely because an ID exists.
- Review never approves hot work, equipment restart, permit exemptions or corrective field work. AI supports—not replaces—authorized engineering judgment.
- Audit events record imports, review, indexing/deletion, retrieval, workflow steps/execution/failure, fallback and exports. Hash linkage detects accidental changes; this is not a tamper-proof compliance archive.

## Explicit limitations and production blockers

The original FastAPI prototype still has demo passwords, an anonymous demo-manager identity and handlers without full production authorization. Its SQLite data lacks tenant isolation. The new Next integration checks do not secure a separately exposed Python service. Keep it local/private until that independent boundary is hardened and regression-tested. The preserved static dashboards/reports are labelled demo; they are not authoritative operational records.

The integration JSON state is single-instance and requires a persistent disk and consistent backups. A stale crash lock requires operator recovery. Rate limits are per process, not distributed. Omi account binding supports one tenant/plant per deployment. Observation extraction is deterministic and uncalibrated. Callback receipt events require the native workflow to place HTTP nodes around actual agents; vendor account validation is outstanding. Prompt injection defenses cannot guarantee semantic correctness; human review remains mandatory.

Credentials supplied during follow-up verification are held only in an ignored local file excluded from the Docker context. Rotate conversation-pasted credentials before production. No claim is made that pre-existing Git history has been fully audited with an external secret-scanning service. Before release run organization-approved secret scanning on the branch and history, verify production TLS, test backups, and validate real-account isolation.
