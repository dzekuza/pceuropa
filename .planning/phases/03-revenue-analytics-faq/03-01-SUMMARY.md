---
phase: 03-revenue-analytics-faq
plan: 01
subsystem: ui
tags: [react-hook-form, zod, supabase, server-actions, nextjs]

# Dependency graph
requires:
  - phase: 02-tenant-management
    provides: tenants table with tenant_id FK used by revenue_reports
provides:
  - Seller revenue submission page at /seller/revenue with upsert Server Action
  - revenueFormSchema Zod validation with Lithuanian error messages
  - submitRevenue Server Action with seller auth guard and tenant lookup
  - RevenuePageClient holding selectedMonth state bridging form and history
  - SubmissionHistory table with clickable rows for pre-fill
affects: [03-02-analytics, 03-03-faq]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - String fields for numeric inputs in Zod schemas (matches tenant.ts pattern)
    - Thin client wrapper (RevenuePageClient) to bridge Server Component data with Client Component state
    - Defense-in-depth seller auth check in every Server Component (CVE-2025-29927)

key-files:
  created:
    - lib/validations/revenue.ts
    - actions/revenue.ts
    - app/(dashboard)/seller/revenue/page.tsx
    - components/revenue/revenue-form.tsx
    - components/revenue/revenue-page-client.tsx
    - components/revenue/submission-history.tsx
  modified: []

key-decisions:
  - "RevenuePageClient thin wrapper pattern: Server Component page passes reports; client wrapper holds selectedMonth state shared between RevenueForm and SubmissionHistory"
  - "String fields for amount_eur and tx_count in Zod schema — mirrors tenant.ts established pattern for Zod v4 + react-hook-form compatibility"
  - "State-based alert for submit feedback instead of sonner toast — sonner not installed, inline state message used"

patterns-established:
  - "RevenuePageClient pattern: thin 'use client' wrapper with state, renders children as props — avoids prop drilling through Server Component boundary"
  - "month stored as YYYY-MM-01 in DB, 'YYYY-MM' used in form — slice(0,7) converts between formats"

requirements-completed: [REVN-01, REVN-02, REVN-03, REVN-04]

# Metrics
duration: 15min
completed: 2026-02-25
---

# Phase 3 Plan 01: Revenue Submission Summary

**Seller revenue submission with upsert Server Action, month pre-fill, editing indicator, and submission history table at /seller/revenue**

## Performance

- **Duration:** 15 min
- **Started:** 2026-02-25T10:09:58Z
- **Completed:** 2026-02-25T10:24:58Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Seller can submit monthly Apyvarta (EUR) and Pirkimu sk. via form at /seller/revenue
- Already-submitted months pre-fill form and show "Redaguojate jau pateiktus duomenis" indicator
- Submission history table lists all submitted months with clickable rows for editing
- submitRevenue upserts with onConflict 'tenant_id,month' — no duplicates possible

## Task Commits

1. **Task 1: Revenue validation schema and Server Action** - `4f7531c` (feat)
2. **Task 2: Seller revenue page with form and submission history** - `f361741` (feat)

**Plan metadata:** (final commit hash — see below)

## Files Created/Modified

- `lib/validations/revenue.ts` - Zod schema revenueFormSchema with Lithuanian error messages
- `actions/revenue.ts` - submitRevenue Server Action with seller auth guard and upsert
- `app/(dashboard)/seller/revenue/page.tsx` - Server Component page with auth guard and tenant lookup
- `components/revenue/revenue-form.tsx` - Month selector form with pre-fill, editing indicator, state-based feedback
- `components/revenue/revenue-page-client.tsx` - Thin client wrapper holding selectedMonth state
- `components/revenue/submission-history.tsx` - History table with clickable rows

## Decisions Made

- **RevenuePageClient pattern:** Server Component passes reports to thin client wrapper; wrapper holds selectedMonth state shared between RevenueForm and SubmissionHistory — cleaner than prop drilling or lifting further up
- **String fields in Zod schema:** amount_eur and tx_count validated as strings, parsed in Server Action — mirrors established tenant.ts pattern for Zod v4 + react-hook-form compatibility
- **State-based feedback instead of sonner toast:** sonner not installed in project; inline state message below form button used instead — avoids adding unplanned dependency

## Deviations from Plan

None — plan executed exactly as written. The state-based alert (instead of sonner toast) was anticipated in the plan instructions ("if not installed, use a state-based alert below the button").

## Issues Encountered

- Pre-existing TypeScript error in `components/analytics/category-bar-chart.tsx` (LabelFormatter type mismatch) found during TSC check — out of scope for this plan, logged to `deferred-items.md` for Phase 03 Plan 02 (analytics).

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Revenue reports table now receives data from seller submissions
- Phase 03 Plan 02 (admin analytics) can query revenue_reports to render charts and metrics
- Phase 03 Plan 03 (FAQ) is independent of this plan

---
*Phase: 03-revenue-analytics-faq*
*Completed: 2026-02-25*
