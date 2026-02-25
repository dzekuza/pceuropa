# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-25)

**Core value:** Admin can see all tenants and their monthly revenue in one place, and sellers can easily report their earnings each month.
**Current focus:** Phase 1 — Foundation

## Current Position

Phase: 1 of 4 (Foundation)
Plan: 2 of 2 in current phase
Status: Phase 1 Complete — both plans done (01-01 and 01-02)
Last activity: 2026-02-25 — Plan 01-02 complete (auth flow, dashboard shell, login page, role-aware sidebar)

Progress: [██░░░░░░░░] 25%

## Performance Metrics

**Velocity:**
- Total plans completed: 2
- Average duration: ~30 min
- Total execution time: ~60 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 2 | 60min | 30min |

**Recent Trend:**
- Last 5 plans: 01-01 (~15min), 01-02 (~45min)
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

### Pending Todos

None yet.

### Blockers/Concerns

- First-login password change flow not decided — admin sets seller passwords; decide before Phase 1 ships whether to include a `first_login` flag + change prompt in v1 or defer to v1.x
- Test data seed script needed for Phase 3 analytics — charts require 3+ months of revenue data to render meaningfully; plan seed script at start of Phase 3

## Session Continuity

Last session: 2026-02-25
Stopped at: Plan 01-02 complete — auth flow (login, proxy.ts, session), dashboard shell (sidebar, admin/seller pages) all verified. Phase 1 complete. Ready to begin Phase 2.
Resume file: None
