# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-25)

**Core value:** Admin can see all tenants and their monthly revenue in one place, and sellers can easily report their earnings each month.
**Current focus:** Phase 2 — Tenant Management

## Current Position

Phase: 2 of 4 (Tenant Management)
Plan: 1 of 2 in current phase
Status: In Progress — plan 02-01 complete, 02-02 next
Last activity: 2026-02-25 — Plan 02-01 complete (tenant CRUD at /admin/tenants with DataTable, Sheet form, delete dialog)

Progress: [███░░░░░░░] 38%

## Performance Metrics

**Velocity:**
- Total plans completed: 3
- Average duration: ~28 min
- Total execution time: ~85 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 2 | 60min | 30min |
| 02-tenant-management | 1 | 25min | 25min |

**Recent Trend:**
- Last 5 plans: 01-01 (~15min), 01-02 (~45min), 02-01 (~25min)
- Trend: —

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Research]: Store role in `app_metadata` only (not `user_metadata`) — sellers cannot self-escalate
- [Research]: Use `getClaims()` in proxy.ts and `getUser()` in every Server Component — not `getSession()` (security)
- [Research]: Middleware (proxy.ts) is NOT the sole auth guard — every admin Server Component calls `getUser()` independently (CVE-2025-29927)
- [Research]: Enable RLS + write policies in the same migration — never leave a table with RLS on and no policies
- [Research]: Service role key used only in Server Actions, never browser — must not carry NEXT_PUBLIC_ prefix
- [01-01]: All RLS policies use app_metadata — confirmed correct pattern in migration SQL
- [01-01]: types/database.ts is hand-written placeholder — must regen with `npx supabase gen types typescript --linked` after project is linked
- [01-01]: SUPABASE_SERVICE_ROLE_KEY has no NEXT_PUBLIC_ prefix — naming convention set correctly from day one
- [01-02]: proxy.ts filename (not middleware.ts) — required for Next.js 16 compatibility
- [01-02]: Seller username login handled client-side — append @pceuropa.lt before signInWithPassword if no '@' in identifier
- [01-02]: getUser() in every protected Server Component page — defense-in-depth, proxy.ts alone insufficient per CVE-2025-29927
- [01-02]: All Lithuanian UI strings centralized in lib/strings.ts — single source of truth for AUTH_STRINGS, ADMIN_NAV_ITEMS, SELLER_NAV_ITEMS
- [Phase 02-tenant-management]: TenantFormValues uses string types for numeric fields (space_m2, rent_eur) — Zod v4 z.coerce.number() unknown input type breaks react-hook-form resolver; values parsed to float in Server Actions
- [Phase 02-tenant-management]: Column factory pattern getColumns(onEdit, onDelete) — keeps ColumnDef stateless, callbacks flow from TenantsTable state owner
- [Phase 02-tenant-management]: Atomic tenant creation with orphan cleanup — auth user created first, tenant record second; if step 2 fails, auth.admin.deleteUser() called immediately to prevent ghost accounts

### Pending Todos

None yet.

### Blockers/Concerns

- First-login password change flow not decided — admin sets seller passwords; decide before Phase 1 ships whether to include a `first_login` flag + change prompt in v1 or defer to v1.x
- Test data seed script needed for Phase 3 analytics — charts require 3+ months of revenue data to render meaningfully; plan seed script at start of Phase 3

## Session Continuity

Last session: 2026-02-25
Stopped at: Plan 02-01 complete — tenant CRUD at /admin/tenants with TanStack DataTable, Sheet form drawer (create/edit), AlertDialog delete confirmation. All 4 TNNT requirements satisfied.
Resume file: None
