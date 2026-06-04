---
paths:
  - "app/api/**"
  - "app/auth/**"
  - "app/login/**"
  - "proxy.ts"
  - "lib/supabase/**"
  - "actions/**"
  - "app/**/actions.ts"
---

# Security

- Validate all user input at the system boundary. Never trust request parameters.
- Use parameterized queries. Never concatenate user input into SQL or shell commands.
- Sanitize output to prevent XSS. Use framework-provided escaping.
- Always `supabase.auth.getUser()`, never `getSession()` — validates JWT against Supabase Auth server.
- Every admin Server Component must call `getUser()` independently (CVE-2025-29927: middleware can be bypassed).
- `lib/supabase/admin.ts` uses `SUPABASE_SERVICE_ROLE_KEY` — server-side only, never import in Client Components or expose to browser.
- Never log secrets, tokens, passwords, or PII.
- Roles live in `user.app_metadata.role` — never trust `user_metadata` for authorization.
- Rate-limit authentication endpoints.
- RLS must be enabled on every Supabase table — never disable it.
