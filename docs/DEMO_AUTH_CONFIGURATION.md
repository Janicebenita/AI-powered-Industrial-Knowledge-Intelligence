# Restricted Plant A demonstration login

Local repair only; no account has been provisioned and no production setting changed.

Use `/login?returnTo=/platform/copilot`. Authentication uses the existing session endpoint, an eight-hour HttpOnly SameSite=Strict cookie and Secure in HTTPS or NODE_ENV/ENVIRONMENT production. Session restoration uses an uncached GET. The visual persona never grants permissions. Login/logout events use the existing scoped audit store. Disposable filesystem audit storage remains non-durable; this change does not establish durable retention.

## Secure configuration requirements

- Preserve the existing server-side `JWT_SECRET` (at least 32 characters) and production `APP_BASE_URL` (the existing HTTPS application URL).
- Set `ENVIRONMENT=production` and retain `NODE_ENV=production` for deployment; review existing startup validation requirements before changing configuration.
- Add a NEW dedicated account to `INTEGRATION_USERS_JSON`, or the private file named by `INTEGRATION_USERS_FILE`. JSON takes precedence: use one authoritative account source.
- Required account fields: unique pseudonymous `sub`, organizer-assigned `email`, `role` equal to `operator`, `tenant` equal to `industrial-brain-ai`, `plant` equal to `plant-a`, random `salt`, and `password_hash` equal to the hex encoding of Node scryptSync(password, salt, 64). Set `disabled=false`.
- Generate a new strong password and random salt securely outside tracked files; distribute demo credentials privately to judges. Never reuse privileged acceptance credentials, expose a password hash in the browser, or commit the account configuration.
- The operator can read only server-authorized evidence. Existing write, approval and admin checks deny this account. Read permission includes querying evidence; it does not authorize engineering work. Human review remains required.
- Disable the account after the demonstration. Account status is checked on each request. Logout clears the browser cookie; previously copied stateless tokens retain their existing eight-hour lifetime unless the account is disabled.
- Existing login rate limiting remains in place. Authentication never automatically assigns administrator permissions.

Run `npm run test:session` for isolated fixtures and mocked in-process HTTP; it makes no external provider calls.
