---
phase: 01-foundation
plan: 01
subsystem: database
tags: [supabase, postgres, rls, typescript, migrations]

# Dependency graph
requires: []
provides:
  - PostgreSQL schema with tenants, revenue_reports, and faq_items tables
  - RLS policies enforcing admin/seller role-based access using app_metadata
  - TypeScript Database type matching the migration schema
  - Environment variable configuration (.env.example and .env.local template)
affects: [01-02, 02-tenants, 03-analytics, 04-settings]

# Tech tracking
tech-stack:
  added:
    - supabase (hosted PostgreSQL + auth + RLS)
    - Supabase CLI (npx supabase — migrations, type generation)
  patterns:
    - RLS enabled and policies written in the same migration (never leave table with RLS on and no policies)
    - Role stored in app_metadata only (not user_metadata — user_metadata is writable by users)
    - Policy pattern: (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'

key-files:
  created:
    - supabase/config.toml
    - supabase/migrations/001_initial_schema.sql
    - types/database.ts
    - .env.example
    - .env.local
    - .gitignore
  modified: []

key-decisions:
  - "Use app_metadata (not user_metadata) for all RLS role checks — user_metadata is writable by any authenticated user"
  - "Write RLS + all policies in the same migration — never leave a table with RLS enabled and no policies (causes silent empty results)"
  - "types/database.ts is hand-written placeholder — must be regenerated with npx supabase gen types typescript --linked after project is linked"
  - "SUPABASE_SERVICE_ROLE_KEY has no NEXT_PUBLIC_ prefix — server-only key, never exposed to browser"

patterns-established:
  - "Pattern: RLS policy for admin — USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')"
  - "Pattern: RLS policy for seller own-data — USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'seller' AND user_id = auth.uid())"
  - "Pattern: Composite UNIQUE(tenant_id, month) on revenue_reports prevents duplicate submissions"

requirements-completed: [AUTH-01, AUTH-02, AUTH-04]

# Metrics
duration: 15min
completed: 2026-02-25
---

# Phase 1 Plan 01: Supabase Schema Summary

**PostgreSQL schema with tenants, revenue_reports, and faq_items tables — RLS enabled with role-based policies using app_metadata, TypeScript types generated from migration**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-02-25T17:48:36Z
- **Completed:** 2026-02-25T18:03:00Z
- **Tasks:** 3 of 3 complete
- **Files modified:** 6

## Accomplishments
- Database migration SQL with all 3 tables, RLS enabled, and complete policies — no table left with RLS on and no policies
- All RLS policies use `app_metadata` (not `user_metadata`) — prevents users from self-escalating privileges
- TypeScript Database type with Row/Insert/Update types for all 3 tables + convenience type aliases
- Environment configuration with correct key naming (no NEXT_PUBLIC_ prefix on service role key)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Supabase migration with full schema and RLS policies** - `f5f1f7d` (feat)
2. **Task 2: Configure environment and generate TypeScript types** - `2264842` (feat)
3. **Task 3: Verify Supabase project connection** - checkpoint approved (human-verify)

## Files Created/Modified
- `supabase/config.toml` - Supabase local dev configuration
- `supabase/migrations/001_initial_schema.sql` - Complete schema: tenants, revenue_reports, faq_items with RLS + policies + indexes
- `types/database.ts` - Hand-written Database TypeScript type (replace with generated after npx supabase link)
- `.env.example` - Environment variable template with all 3 Supabase keys (committed)
- `.env.local` - Local environment file placeholder (gitignored — fill with real values)
- `.gitignore` - Excludes .env.local, node_modules, .next, supabase temp files

## Decisions Made
- Used `app_metadata` for all role checks — users cannot self-escalate via `supabase.auth.updateUser()` which only writes `user_metadata`
- RLS + policies written in same migration — following research guidance to prevent silent empty query results
- Service role key named `SUPABASE_SERVICE_ROLE_KEY` (no NEXT_PUBLIC_ prefix) — server-only, not needed in Phase 1 but naming convention set correctly from day one
- `types/database.ts` is hand-written to match migration schema exactly — must be replaced with generated types after Supabase project is linked

## Deviations from Plan

None — plan executed exactly as written. The `supabase init` step was replaced with direct file creation (equivalent result, no interactive CLI required).

## User Setup Required

**Completed.** Supabase project was linked, migration applied, admin user created with `app_metadata.role=admin`, and TypeScript types regenerated from live schema.

## Issues Encountered

None.

## Next Phase Readiness
- Migration SQL ready to push to Supabase once project is linked
- TypeScript types ready (will be regenerated from live schema after linking)
- Environment configuration ready (user fills in real values)
- Plan 01-02 (Next.js scaffold) can begin in parallel with Supabase setup, but database types should be regenerated before wiring data queries

---
*Phase: 01-foundation*
*Completed: 2026-02-25*
