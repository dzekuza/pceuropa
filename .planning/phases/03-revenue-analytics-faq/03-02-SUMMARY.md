---
phase: 03-revenue-analytics-faq
plan: 02
subsystem: ui
tags: [recharts, analytics, charts, next.js, react, shadcn, typescript]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: createClient, auth guard pattern (getUser + app_metadata.role), types/database.ts
  - phase: 02-tenant-management
    provides: Tenant data in supabase, revenue_reports table schema
provides:
  - Admin analytics dashboard at /admin/analytics
  - Monthly revenue line chart (center-wide)
  - Per-category horizontal bar chart
  - Per-tenant month-over-month trend chart (ANLT-03)
  - Submission status tracker with summary cards, progress bar, filterable badge table
  - Analytics date range picker (URL searchParams-driven)
  - lib/utils/analytics.ts pure aggregation functions
affects: [03-faq, future-reporting]

# Tech tracking
tech-stack:
  added: [recharts@^2.x]
  patterns:
    - Server Component fetches data + calls pure aggregation functions, passes to 'use client' chart components
    - URL searchParams as filter state (from/to) — router.push triggers Server Component refetch
    - Pure aggregation utilities in lib/utils/analytics.ts — no side effects, fully typed
    - Gap-fill pattern: getDateRangeMonths fills missing months with total:0 for unbroken X-axis

key-files:
  created:
    - lib/utils/analytics.ts
    - app/(dashboard)/admin/analytics/page.tsx
    - components/analytics/revenue-line-chart.tsx
    - components/analytics/category-bar-chart.tsx
    - components/analytics/tenant-trend-chart.tsx
    - components/analytics/submission-tracker.tsx
    - components/analytics/analytics-date-range.tsx
  modified:
    - package.json (recharts added)

key-decisions:
  - "Single-tenant dropdown approach for TenantTrendChart (ANLT-03) instead of multi-line — readability with many tenants; top-by-revenue default ordering"
  - "SubmissionTracker as 'use client' with useState filter toggle (Visi/Pateike/Laukiama) — filter buttons need interactivity without a round-trip"
  - "AnalyticsDateRange pushes to /admin/analytics?from=YYYY-MM&to=YYYY-MM — Server Component refetch pattern vs. client-side state keeps data fresh and shareable via URL"
  - "LabelList formatter typed as (v: any) with eslint-disable — recharts LabelFormatter type (RenderableText) incompatible with typed number formatter"

patterns-established:
  - "Analytics Server Component pattern: fetch raw data → call pure aggregation utils → pass typed props to 'use client' chart components"
  - "URL searchParams as filter state for Server Components — avoids client-side data duplication, keeps URL shareable"
  - "Gap-fill months: getDateRangeMonths generates full range, aggregation functions fill missing months with 0"

requirements-completed: [ANLT-01, ANLT-02, ANLT-03, ANLT-04]

# Metrics
duration: 3min
completed: 2026-02-25
---

# Phase 3 Plan 02: Analytics Dashboard Summary

**Admin analytics dashboard with recharts line/bar/trend charts, submission tracker, and URL-driven date range filter at /admin/analytics**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-25T16:49:47Z
- **Completed:** 2026-02-25T16:52:47Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Installed recharts; created 5 pure aggregation functions in lib/utils/analytics.ts covering monthly revenue, category breakdown, tenant trends, submission status, and date range generation
- Built responsive analytics page at /admin/analytics: 3 summary stat cards, full-width monthly revenue line chart, category bar chart + submission tracker side-by-side, per-tenant trend chart
- Submission tracker with progress bar and client-side filter buttons (Visi/Pateike/Laukiama) with colored Pateikta/Nepateikta badges
- Date range picker (Nuo/Iki selects) using URL searchParams to drive Server Component refetch — filter state is shareable via URL

## Task Commits

1. **Task 1: Install recharts and create analytics data aggregation utilities** - `9ad35c6` (feat)
2. **Task 2: Admin analytics page with charts and submission tracker** - `deda95c` (feat)

## Files Created/Modified
- `lib/utils/analytics.ts` - Pure aggregation functions: aggregateMonthlyRevenue, aggregateCategoryRevenue, getSubmissionStatus, getDateRangeMonths, aggregateTenantTrends
- `app/(dashboard)/admin/analytics/page.tsx` - Server Component analytics page with auth guard, parallel fetch, aggregation, responsive layout
- `components/analytics/revenue-line-chart.tsx` - Monthly revenue line chart with Lithuanian labels, hover tooltip, empty state
- `components/analytics/category-bar-chart.tsx` - Horizontal bar chart for per-category revenue sorted descending
- `components/analytics/tenant-trend-chart.tsx` - Per-tenant trend with Select dropdown for tenant selection (ANLT-03)
- `components/analytics/submission-tracker.tsx` - Summary cards + progress bar + filterable badge table ('use client')
- `components/analytics/analytics-date-range.tsx` - Date range picker pushing to URL searchParams
- `package.json` + `package-lock.json` - recharts added

## Decisions Made
- **Single-tenant dropdown for TenantTrendChart** — Multi-line chart with 10+ tenants becomes unreadable; dropdown lets admin pick any tenant and see their individual trend clearly. Tenants sorted by total revenue so top performers appear first.
- **SubmissionTracker as 'use client'** — Filter toggle (Visi/Pateike/Laukiama) requires interactivity. Pre-computed submitted/pending arrays passed from Server Component as props — no additional DB calls needed.
- **URL searchParams for date range** — `router.push(?from=YYYY-MM&to=YYYY-MM)` triggers Server Component refetch, keeps filter state in URL (shareable/bookmarkable), avoids client-side data duplication.
- **LabelList any-typed formatter** — recharts `LabelFormatter` type expects `RenderableText` (includes undefined) but a number-specific formatter is needed for EUR formatting; `any` cast with eslint-disable is pragmatic.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed recharts LabelList formatter TypeScript type mismatch**
- **Found during:** Task 2 (category-bar-chart.tsx)
- **Issue:** recharts `LabelFormatter` type is `RenderableText` (string | number | undefined) — typed `(v: number) => string` not assignable
- **Fix:** Changed formatter to `(v: any) => (v != null ? formatEur(Number(v)) : '')` with eslint-disable comment
- **Files modified:** components/analytics/category-bar-chart.tsx
- **Verification:** `npx tsc --noEmit` passes with zero errors
- **Committed in:** deda95c (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - type mismatch)
**Impact on plan:** Minor type fix required for recharts LabelList. No scope creep.

## Issues Encountered
- recharts LabelList formatter type incompatibility with strict TypeScript — resolved with pragmatic any cast (recharts types do not expose a typed formatter signature).

## User Setup Required
None - no external service configuration required. Analytics page uses existing Supabase tables (tenants, revenue_reports).

## Next Phase Readiness
- Analytics dashboard complete; all 4 ANLT requirements satisfied (ANLT-01 through ANLT-04)
- Ready for Phase 3 Plan 03: FAQ management (/admin/faq CRUD + /seller/faq read-only view)
- Note: Charts will show empty states until revenue_reports data is seeded — seed script blocker noted in STATE.md remains for Phase 3 start

---
*Phase: 03-revenue-analytics-faq*
*Completed: 2026-02-25*

## Self-Check: PASSED

- lib/utils/analytics.ts: FOUND
- app/(dashboard)/admin/analytics/page.tsx: FOUND
- components/analytics/revenue-line-chart.tsx: FOUND
- components/analytics/category-bar-chart.tsx: FOUND
- components/analytics/tenant-trend-chart.tsx: FOUND
- components/analytics/submission-tracker.tsx: FOUND
- components/analytics/analytics-date-range.tsx: FOUND
- .planning/phases/03-revenue-analytics-faq/03-02-SUMMARY.md: FOUND
- Commit 9ad35c6: FOUND
- Commit deda95c: FOUND
