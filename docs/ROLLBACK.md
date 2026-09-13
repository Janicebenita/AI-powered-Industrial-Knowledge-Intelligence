# Rollback and recovery

No production deployment has been performed by this work. Baseline repository commit: `40584d47904884a4b4349bd4d2de0e00ef0625a0`. It is a code recovery reference, **not a verified Render deployment ID**. Obtain the last healthy deployment ID from the existing service before rollout.

Before production: save deployment ID, image/commit, environment variable names and secure values, persistent disk backup, original uploads, integration state, private account file and Qdrant collection configuration. Test restoring a copy. Record backup time and checksums without exposing secrets.

On failed readiness or critical workflow regression:

1. Stop further rollout/migration and notify the owner with the observed failure. Follow the owner's approved rollback procedure; production changes still require authorization.
2. Roll back the existing Render service to the recorded stable deployment. Restore its corresponding environment settings from the secure backup.
3. Restore the matching data backup if necessary. Do not overwrite newer approvals without preserving a copy for reconciliation.
4. Keep the new versioned Qdrant collection and legacy sources intact. Never delete vectors or legacy data as part of rollback.
5. Recheck homepage, all navigation, upload, local demo Copilot, report export and the original health behavior.

Optional temporary fallback is an explicit owner-approved configuration change: VOICE_PROVIDER=disabled, VECTOR_PROVIDER=legacy, AGENT_PROVIDER=local. The UI must remain labelled demo/local fallback; do not imply external connectivity.

Integration state uses `state.json`, private originals and `state.lock` under INTEGRATION_DATA_DIR. A crash-held lock fails closed. Confirm no process holds the lock and back up state before manually removing a stale lock. Corrupt state must be restored, never silently replaced with an empty store. Long-running external executions may continue after an app timeout; inspect Lyzr Studio before retrying to avoid duplicate work.
