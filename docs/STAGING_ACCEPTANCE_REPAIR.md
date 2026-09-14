# Staging acceptance repair

The independent verifier remains necessary but is not sufficient for releasing a claim. The application still validates the strict response schema, every submitted claim ID, citations, exact normalized supporting excerpts, numbers, references, causal rankings, narrowed partials and operational safety.

## Evidence-bound propositions

`mechanisms.ts` separates coordinated subjects and explicit clauses for proposition-level inspection. Substantive vocabulary must occur in the cited passages after conservative inflection normalization. Grammatical, reporting and relationship words are distinguished from physical concepts. An unfamiliar condition is permitted only in an explicit whole-proposition statement that it is missing evidence requiring investigation. Appending an investigation recommendation to an asserted condition does not excuse it.

A compound claim with an unsupported proposition is rejected unless the independent verifier supplies a narrower supported claim that passes all existing checks. There is no domain-word blacklist, claim-ID exception or fuzzy excerpt matching. This conservative vocabulary guard can reject valid technical synonyms; rejection is preferable to silently introducing a physical mechanism.

Rejected originals and verifier commentary remain in the private audit record. Public answers and cited execution exports contain only released claims and sanitized rejection reasons. Unverified manager summaries and recommendations are not promoted into the answer.

## Contract reconciliation

Contract version: `industrial-evidence-verification/v2-reconciled`.

The canonical fields remain `overall_status`, `claim_verdicts`, the three verdict counts and `requires_human_review`. Valid item-level verdicts determine locally recomputed counts and overall status. Disagreements are recorded as sanitized contract inconsistencies. Invalid schema or missing, duplicate or unknown claim IDs still fail closed. Each otherwise valid verdict must independently pass evidence validation.

For a supported verdict, the original candidate text is retained regardless of verifier rewriting. It still passes every safety, mechanism, citation and exact-excerpt check. Only a partially supported verdict may supply narrowed replacement text. Verifier wording remains private audit data.

An invalid verifier citation may be resolved only when every supporting excerpt uniquely matches one passage in the evidence supplied for that claim. The application copies those complete existing IDs; it never repairs strings or searches unrelated evidence. Missing or ambiguous matches fail with `invalid_citation_id`. Original and resolved verifier IDs are recorded privately. Invalid orchestrator citations without excerpts remain rejected before verification.

Saved staging diagnosis: WO-10421 had a supported verdict and exact excerpt but rewritten wording. WO-10877 had an invalid orchestrator citation and never reached the verifier; no excerpt exists to recover its citation. Replay must preserve that rejection rather than fabricate recovery.

Maintenance-history output orders retained claims chronologically. When wording omits a date, the application may attach source-date context from a complete cited CSV row whose `work_order` identifier occurs exactly in that claim. This does not rewrite the verified claim. Uncited rows, invalid dates, truncated records and conflicting dates do not supply context. A causal conclusion is not required to return supported maintenance facts. Confidence remains unknown and human review remains mandatory.

## Responsive verification

The shell no longer conceals horizontal overflow. Grid/flex children may shrink, ordinary text wraps, the hero and metric grids adapt to available space, the heatmap moves labels above values on narrow screens, and document status/badge rows wrap. Wide evidence tables retain local horizontal scrolling.

Test all 13 routes at 320×568, 360×800, 390×844, 412×915, 768×1024 and 1366×900. Record the actual browser inner width as well as document client/scroll widths. Inspect text and element bounds to detect clipping that a document-width assertion misses. Screen-reader-only labels and verified table-local scrolling are intentional exceptions, not hidden meaningful content.

Run `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build` in `frontend`. Pass the exported function from `scripts/measure-layout.cjs` to the browser DOM evaluation API after each route has rendered, adding the route and requested viewport to each result. Validate those real measurements with `node scripts/assert-layout-report.cjs <private-browser-report.json>`. The report contains 78 records with `route`, `viewport`, `innerWidth`, `width`, `scroll` and `offenders` fields. Measurement reports exclude rendered text to avoid copying private identifiers.

Live acceptance additionally requires both P101 questions, authenticated provider health, readiness, citation/scope checks and an unchanged Qdrant count of 354. Mocked regression tests alone do not establish live acceptance. No migration or provider configuration changes are part of this repair. Staging remains disposable Free compute with no durable filesystem storage, no disk and automatic deployments disabled.

## Provider ownership and application identity

The provider account owner is separate from the application user. Both inference payloads retain the existing stable SHA-256 hash of tenant, plant and application subject. Tests verify stability, scope/user separation, hexadecimal output and absence from adapter console logs. This is pseudonymization, not a claim of anonymity or resistance to guessing known inputs. Each execution creates fresh agent sessions; saved fixtures are only used locally.
