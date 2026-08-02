---
paths:
  - "app/api/**"
  - "app/login/**"
  - "proxy.ts"
  - "lib/auth/**"
  - "lib/db/**"
  - "actions/**"
  - "app/**/actions.ts"
---

# Security

- Validate all user input at the system boundary. Never trust request parameters.
- Use parameterized queries (Drizzle's query builder, never raw string interpolation). Never concatenate user input into SQL or shell commands.
- Sanitize output to prevent XSS. Use framework-provided escaping.
- Every admin/seller Server Component must independently re-validate the session via `lib/auth/get-role.ts` or `auth()` from `lib/auth/config.ts` — middleware alone is not the auth guard (CVE-2025-29927: middleware can be bypassed via `x-middleware-subrequest`).
- `auth()`'s JWT check is Edge-safe crypto verification only — it does **not** hit the database to confirm the user still exists/wasn't revoked. If that guarantee matters for a given code path, query `users` directly.
- Passwords are hashed with `bcryptjs` (`lib/auth/config.ts`'s `authorize()`) — never store or compare plaintext.
- Login attempts are rate-limited via a Postgres-backed sliding window (`lib/auth/rate-limit.ts`) — don't bypass `checkRateLimit`/`recordLoginAttempt` when touching the credentials flow.
- Never log secrets, tokens, passwords, or PII.
- Roles live in the signed session JWT (`session.user.role`, set once at sign-in via `lib/auth/auth.config.ts`'s callbacks) — never trust a client-supplied role value for authorization.
- RLS must be enabled on every table — never disable it. Policies rely on `current_setting('app.user_id'/'app.user_role', true)` being `SET LOCAL` per request-scoped transaction; don't query outside that transaction context for RLS-gated tables.
- `proxy.ts` builds redirect URLs from `request.headers.get('host')`, not `request.url` — see `CLAUDE.md` for why. Don't revert this when touching redirect logic.
