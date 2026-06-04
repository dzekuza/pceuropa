---
paths:
  - "supabase/migrations/**"
  - "supabase/**"
  - "types/database.ts"
---

# Database (Supabase / PostgreSQL)

- **Never modify an existing migration.** Always create a new one. Existing migrations may have already run in production.
- RLS must be enabled on every table. Never skip it.
- Use `@supabase/ssr` for server-side auth in Next.js — never use the browser client on the server.
- After any schema change: `npx supabase gen types typescript --linked > types/database.ts`.
- `SUPABASE_SERVICE_ROLE_KEY` is for `lib/supabase/admin.ts` only — never expose to client bundles.
- Never seed production data in migration files. Use dedicated seed files.
- Never drop columns or tables without confirming data is no longer needed.
- Add indexes in their own migration, not bundled with schema changes.
- Client map: `lib/supabase/server.ts` (Server Components / Actions / Route Handlers), `lib/supabase/admin.ts` (admin ops only), `lib/supabase/client.ts` (Client Components).
