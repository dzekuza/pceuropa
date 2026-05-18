---
phase: 02-tenant-management
plan: 02
subsystem: ui
tags: [revenue-table, calculations, year-selector, server-component, supabase]

# Dependency graph
requires:
  - phase: 02-tenant-management
    plan: 01
    provides: Tenant CRUD, admin client, constants (MONTHS_LT), validation schema
provides:
  - Tenant detail page at /admin/tenants/[id] with info header
  - 12-month revenue table with auto-calculated P.K, Apyvarta/m², Efektyvumas
  - Color-coded efficiency badges (green/yellow/red)
  - Year selector via URL search params
  - Pure calculation utilities in lib/utils/calculations.ts
affects: [03-analytics]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Pure calculation functions with null guards — all division-by-zero cases return null"
    - "Server Component revenue table — no client state, all computed server-side"
    - "Year selector via URL searchParams — bookmarkable, SSR-rendered"
    - "Promise.all parallel fetches for tenant + revenue_reports"

key-files:
  created:
    - lib/utils/calculations.ts
    - components/tenants/tenant-detail-header.tsx
    - components/tenants/tenant-revenue-table.tsx
    - components/tenants/year-selector.tsx
    - app/(dashboard)/admin/tenants/[id]/page.tsx
  modified: []

key-decisions:
  - "P.K is constant per tenant (rent/space), computed once; Apyvarta/m² and Efektyvumas vary per month"
  - "Vidurkis averages only months with submitted data — zeros from empty months excluded"
  - "Year selector uses router.push with ?year=YYYY — page is SSR with searchParams"
  - "Efektyvumas thresholds: >= 100% green, 70-99% yellow, < 70% red"

patterns-established:
  - "Pattern: calculation utilities as pure functions with null guards in lib/utils/calculations.ts"
  - "Pattern: MONTHS_LT[idx] for month name lookups, reportMap keyed by YYYY-MM for O(1) data merge"

requirements-completed: [TNNT-05, TDTL-01, TDTL-02, TDTL-03, TDTL-04, TDTL-05, TDTL-06, TDTL-07]

# Metrics
duration: ~15min
completed: 2026-02-25
---

# Phase 2 Plan 02: Tenant Detail Page Summary

**Tenant detail page at /admin/tenants/[id] — info header card, 12-month revenue table with auto-calculated P.K/Apyvarta per m²/Efektyvumas, color-coded efficiency badges, Vidurkis average row, year selector**

## Performance

- **Duration:** ~15 min
- **Tasks:** 1 of 1 auto tasks complete (checkpoint pending)
- **Files created:** 5

## Accomplishments
- Pure calculation utilities (calculatePK, calculateApyvartaPerM2, calculateEfektyvumas) with null/zero guards
- Tenant detail header card with store name, operator, category, space, rent — horizontal grid on desktop, stacked on mobile
- 12-month revenue table using MONTHS_LT — all months shown even without data (zeros/dashes)
- Auto-calculated columns with subtle bg-muted/50 background tint
- Efektyvumas color coding: green (>=100%), yellow (70-99%), red (<70%)
- Vidurkis (average) row in tfoot — averages only months with submitted data
- Year selector client component — navigates via ?year=YYYY, defaults to current year
- Server Component page with defense-in-depth admin auth, Promise.all parallel fetches

## Task Commits

1. **Task 1: Calculation utilities and tenant detail page with revenue table** - `24480f0` (feat)

## Files Created
- `lib/utils/calculations.ts` - calculatePK, calculateApyvartaPerM2, calculateEfektyvumas with null guards
- `components/tenants/tenant-detail-header.tsx` - Info header card with tenant details and back link
- `components/tenants/tenant-revenue-table.tsx` - 12-month table with auto-calculated columns, color coding, Vidurkis row
- `components/tenants/year-selector.tsx` - Client component year selector via URL params
- `app/(dashboard)/admin/tenants/[id]/page.tsx` - Server Component with admin auth, parallel tenant+reports fetch

## Decisions Made
- P.K is constant per tenant, computed once outside the month loop
- Vidurkis only averages months that have submitted data — prevents dilution by empty months
- Year selector uses router.push (not state) — URL is bookmarkable and SSR-rendered

## Deviations from Plan
None — implementation matches plan specification.

## Self-Check: PASSED

All 5 files created and verified. Commit 24480f0 confirmed in git log.

---
*Phase: 02-tenant-management*
*Completed: 2026-02-25*
