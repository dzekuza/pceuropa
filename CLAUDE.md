# CLAUDE.md

> **Migration in progress**: this branch (`migration/self-hosted-vps`) replaces Supabase (Auth + Postgres + Storage) and Vercel with a self-hosted stack — plain Postgres + Drizzle ORM + Auth.js + local-disk storage, deployed via Docker/Caddy on a VPS with GitHub Actions CI/CD. `main`/`master` still reflect the pre-migration Supabase/Vercel setup as a rollback baseline. This file describes the **new** stack; update it again once this branch merges.

## Commands

```bash
pnpm dev          # dev server
pnpm build        # production build
pnpm lint         # ESLint
pnpm tsc --noEmit # type-check
npx drizzle-kit generate --config drizzle.config.ts  # after schema changes in drizzle/schema.ts
docker compose build app   # local Docker build test
```

## Architecture

Two parts: `app/(marketing)/` (public, Lithuanian, Figma design) and `app/(dashboard)/` (shadcn Nova, roles: `admin` | `seller`).

- **DB**: plain Postgres, schema in `drizzle/schema.ts`, migrations in `drizzle/migrations/` (Drizzle-generated). RLS policies (`drizzle/rls-policies.sql`), the `tenants_public` view (`drizzle/tenants-public-view.sql`), and admin RPC functions (`drizzle/rpc-functions.sql`) are hand-ported SQL, applied manually alongside the generated migration — not auto-managed by drizzle-kit.
- **Auth**: Auth.js v5, Credentials provider, JWT sessions. `lib/auth/auth.config.ts` is the Edge-safe shared config (used by `proxy.ts` on the Edge runtime); `lib/auth/config.ts` extends it with the Credentials provider + Drizzle/bcrypt (Node runtime only, used by `/api/auth/[...nextauth]` and Server Components).
- **Storage**: local disk under `$STORAGE_ROOT` (`.data/uploads` in dev, `/data/uploads` in the Docker volume), bucket-scoped subdirectories (`marketing-assets`, `tenant-assets`, `faq-attachments`). `lib/storage/resize-image.ts` for URL rewriting, `app/api/upload/route.ts` for validated uploads, `app/api/storage/[bucket]/[...path]/route.ts` for serving + on-the-fly resize via `sharp`.
- **Deploy**: `Dockerfile` (multi-stage, Next.js `output: "standalone"`), `docker-compose.yml` (`app` + `postgres` + `caddy` services), `Caddyfile` (reverse proxy + automatic TLS). `.github/workflows/deploy.yml` builds/pushes to `ghcr.io/dzekuza/pceuropa` and deploys over SSH on push to this branch.
- **Domains** (staging, until `pceuropa.lt` DNS is cut over): `europa.gvozdovic.com` (marketing), `nuomininkai.europa.gvozdovic.com` (dashboard) — both proxied to the same container; `proxy.ts`'s subdomain check is domain-agnostic (`hostname.startsWith('nuomininkai.')`), no code change needed when the real domain takes over.

## Non-obvious constraints

- `proxy.ts` exports `proxy`, not `middleware` — Next.js 16 rename. Do not change the export name.
- `proxy.ts` builds redirect targets from `request.headers.get('host')`, **not** `request.url`/`request.nextUrl.origin` — once Auth.js's `auth()` wrapper touches the request, those collapse to a single canonical origin instead of the real incoming Host header, which breaks cross-subdomain redirects (marketing apex vs. `nuomininkai.` dashboard). `trustHost: true` in the Auth.js config does **not** fix this — it only governs Auth.js's own internal redirect/CSRF logic, not this middleware's own `NextResponse.redirect()` calls.
- Every admin Server Component calls `lib/auth/get-role.ts` (or `auth()` from `lib/auth/config.ts`) independently — middleware alone is not the auth guard (CVE-2025-29927 still applies: middleware can be bypassed via `x-middleware-subrequest`).
- `session.user.id` is populated explicitly in `lib/auth/auth.config.ts`'s `session()` callback from `token.sub` — it is **not** set automatically under the JWT strategy. Don't remove that line; every seller-facing query keyed on the signed-in user's id depends on it.
- All Lithuanian UI strings live in `lib/strings.ts` — never scatter literals in components.
- React Compiler is enabled (`reactCompiler: true`) — avoid patterns that defeat memoization.
- Roles live in the signed JWT (`session.user.role`, embedded via `lib/auth/auth.config.ts`'s `jwt`/`session` callbacks) — mirrors the old `user.app_metadata.role` shape. Sellers log in as `{username}@pceuropa.lt`.
- Migrations in `drizzle/migrations/` — never edit an applied migration, always create a new one (same convention as the old `supabase/migrations/`).
- Marketing pages that query the DB without a dynamic route segment (home, `/akcijos`, `/naujienos`, `/planas`, `/dialogai`, and the other Puck-content static pages) are `export const dynamic = 'force-dynamic'`. This is required, not optional: the Docker build has no `DATABASE_URL` reachable at build time, so Next would otherwise try to statically prerender these at build and crash with `ECONNREFUSED`. `akcijos/[slug]`'s `generateStaticParams` instead returns `[]` when `DATABASE_URL` is unset, since dynamic-segment pages fall back to on-demand rendering.
- `components/ui/` — shadcn primitives only. Check here before building anything from scratch.
- **Env vars, new for this stack**: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `AUTH_TRUST_HOST=true`, `STORAGE_ROOT`. Removed: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. Unchanged: `MAINTENANCE_PASSWORD`, `MODERAN_*`, `GOOGLE_GENERATIVE_AI_API_KEY`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_ENABLE_REACT_GRAB`.
- **Known open gaps** (tracked, not yet closed): FK constraints from `users` → `tenants.userId`/`revenueReports.userId`/`moderanSyncLog.sentBy` are deferred (documented in `drizzle/MIGRATION_NOTES.md`); the admin impersonation token (`lib/auth/admin-users.ts`) is a short-lived signed JWT but not yet tracked as single-use server-side.
