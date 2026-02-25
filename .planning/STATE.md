# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-25)

**Core value:** Admin can see all tenants and their monthly revenue in one place, and sellers can easily report their earnings each month.
**Current focus:** Phase 1 — Foundation

## Current Position

Phase: 1 of 4 (Foundation)
Plan: 0 of 2 in current phase
Status: Ready to plan
Last activity: 2026-02-25 — Roadmap created, ready to begin Phase 1 planning

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**
- Total plans completed: 0
- Average duration: —
- Total execution time: —

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**
- Last 5 plans: —
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

### Pending Todos

None yet.

### Blockers/Concerns

- Lithuanian string inventory not yet drafted — all Zod validation messages and UI strings must be Lithuanian from day one; consider creating a strings constants file in Phase 1
- First-login password change flow not decided — admin sets seller passwords; decide before Phase 1 ships whether to include a `first_login` flag + change prompt in v1 or defer to v1.x
- Test data seed script needed for Phase 3 analytics — charts require 3+ months of revenue data to render meaningfully; plan seed script at start of Phase 3

## Session Continuity

Last session: 2026-02-25
Stopped at: Roadmap created — Phase 1 planning not yet started
Resume file: None
