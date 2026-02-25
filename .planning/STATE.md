# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-25)

**Core value:** Admin can see all tenants and their monthly revenue in one place, and sellers can easily report their earnings each month.
**Current focus:** Phase 1 — Foundation

## Current Position

Phase: 1 of 4 (Foundation)
Plan: 2 of 2 in current phase
Status: In Progress — plan 01-01 complete, 01-02 next
Last activity: 2026-02-25 — Plan 01-01 complete (all 3 tasks done, Supabase project linked and verified)

Progress: [█░░░░░░░░░] 13%

## Performance Metrics

**Velocity:**
- Total plans completed: 1
- Average duration: ~15 min
- Total execution time: ~15 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 1 | 15min | 15min |

**Recent Trend:**
- Last 5 plans: 01-01 (~15min)
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

### Pending Todos

None yet.

### Blockers/Concerns

- Lithuanian string inventory not yet drafted — all Zod validation messages and UI strings must be Lithuanian from day one; consider creating a strings constants file in Phase 1
- First-login password change flow not decided — admin sets seller passwords; decide before Phase 1 ships whether to include a `first_login` flag + change prompt in v1 or defer to v1.x
- Test data seed script needed for Phase 3 analytics — charts require 3+ months of revenue data to render meaningfully; plan seed script at start of Phase 3

## Session Continuity

Last session: 2026-02-25
Stopped at: Plan 01-01 complete — Supabase project linked, migration applied, admin user created, types regenerated. Ready to begin 01-02 (Next.js scaffold).
Resume file: None
