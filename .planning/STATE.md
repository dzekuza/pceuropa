# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-25)

**Core value:** Admin can see all tenants and their monthly revenue in one place, and sellers can easily report their earnings each month.
**Current focus:** Phase 3 — Revenue, Analytics, FAQ

## Current Position

Phase: 3 of 4 (Revenue, Analytics, FAQ)
Plan: 3 of 3 in current phase
Status: In Progress — plan 03-03 complete, phase 03 complete
Last activity: 2026-02-25 — Plan 03-03 complete (admin FAQ CRUD at /admin/faq with Dialog form, AlertDialog delete, move up/down reorder; seller read-only accordion at /seller/faq)

Progress: [███████░░░] 70%

## Performance Metrics

**Velocity:**
- Total plans completed: 6
- Average duration: ~20 min
- Total execution time: ~100 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 2 | 60min | 30min |
| 02-tenant-management | 1 | 25min | 25min |
| 03-revenue-analytics-faq | 3 | ~45min | ~15min |

**Recent Trend:**
- Last 5 plans: 01-01 (~15min), 01-02 (~45min), 02-01 (~25min), 03-01 (~15min), 03-03 (~15min)
- Trend: Accelerating

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
- [Phase 03-revenue-analytics-faq]: RevenuePageClient thin wrapper: holds selectedMonth state shared between RevenueForm and SubmissionHistory
- [Phase 03-revenue-analytics-faq]: String fields for amount_eur/tx_count in Zod schema, parsed in Server Action — mirrors tenant.ts pattern
- [03-03]: reorderFaqItems uses individual loop updates — FAQ lists small (<20 items), simplicity over batch upsert
- [03-03]: FaqAdminList optimistic reorder — local state swap is instant, server action persists asynchronously
- [03-03]: reorderFaqItems revalidates /admin/faq and /seller/faq both — seller sees admin changes immediately
- [03-02]: Single-tenant dropdown for TenantTrendChart (ANLT-03) — multi-line with 10+ tenants unreadable; dropdown lets admin pick any tenant individually
- [03-02]: SubmissionTracker as 'use client' with filter toggle (Visi/Pateike/Laukiama) — interactivity without DB round-trip; pre-computed arrays from Server Component
- [03-02]: URL searchParams (from/to) as analytics date range state — shareable/bookmarkable, Server Component refetch pattern

### Pending Todos

None yet.

### Blockers/Concerns

- First-login password change flow not decided — admin sets seller passwords; decide before Phase 1 ships whether to include a `first_login` flag + change prompt in v1 or defer to v1.x
- Test data seed script needed for Phase 3 analytics — charts require 3+ months of revenue data to render meaningfully; plan seed script at start of Phase 3

## Session Continuity

Last session: 2026-02-25
Stopped at: Plan 03-02 complete — admin analytics dashboard at /admin/analytics with recharts line/bar/trend charts, submission tracker, and URL-driven date range filter. All 4 ANLT requirements satisfied.
Resume file: None
