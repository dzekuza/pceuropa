---
phase: 03-revenue-analytics-faq
verified: 2026-02-25T18:00:00Z
status: gaps_found
score: 4/5 success criteria verified
re_verification: false
gaps:
  - truth: "Seller cannot submit the same month twice; attempting to do so shows a clear Lithuanian error"
    status: partial
    reason: "The implementation uses upsert (onConflict) which silently updates the existing record instead of showing an error. The seller sees 'Redaguojate jau pateiktus duomenis' indicator and 'Duomenys atnaujinti' confirmation toast — not an explicit error for a duplicate attempt. This satisfies the spirit of REVN-04 (no duplicate rows) but not the stated success criterion verbatim ('shows a clear Lithuanian error')."
    artifacts:
      - path: "actions/revenue.ts"
        issue: "Uses .upsert({ onConflict: 'tenant_id,month' }) — no explicit duplicate detection or error path; any second submission for the same month silently updates"
      - path: "components/revenue/revenue-form.tsx"
        issue: "isEditing flag shows 'Redaguojate' indicator when a report exists for the month, but there is no distinct error message for 'attempted duplicate' — the form just pre-fills and allows update"
    missing:
      - "No code path that detects a duplicate attempt and returns a Lithuanian error string; current behavior is update-in-place which is arguably better UX but deviates from stated success criterion SC-2"
      - "Note: If the intent was always to allow edits (upsert model), the success criterion wording is misleading and should be updated; functionally REVN-04 is satisfied by the DB UNIQUE constraint + upsert"
human_verification:
  - test: "Verify revenue form weekly breakdown vs. simple field requirement"
    expected: "Seller sees month selector and can enter data that results in Apyvarta (EUR total) and Pirkimu sk. being stored; the weekly table is an implementation detail that satisfies the underlying goal"
    why_human: "The form structure changed from the plan (simple 2 fields) to a weekly breakdown table (5 rows). Functionally the data stored is correct (amount_eur summed, tx_count summed) but the UX changed significantly and needs human confirmation that the weekly approach is acceptable for the business requirement"
  - test: "Confirm seller/page.tsx placeholder does not block users from reaching /seller/revenue"
    expected: "Seller sidebar links directly to /seller/revenue — the seller home page placeholder at /seller is a dead page but navigation bypasses it"
    why_human: "seller/page.tsx still shows 'Apyvartos pateikimas bus prieinamas netrukus' — a Phase 1 placeholder that was never updated. Navigation links correctly to /seller/revenue but landing on /seller after login may confuse sellers"
---

# Phase 03: Revenue, Analytics & FAQ Verification Report

**Phase Goal:** Sellers report monthly revenue, admins see it aggregated and can answer seller questions via FAQ
**Verified:** 2026-02-25T18:00:00Z
**Status:** gaps_found
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths (from Phase Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| SC-1 | Seller can submit Apyvarta (EUR) and Pirkimu sk. for a selected month — and update a previously submitted month | VERIFIED | `actions/revenue.ts` upserts with auto-summed totals; `revenue-form.tsx` has month selector, weekly breakdown table (summed to amount_eur + tx_count), pre-fill on re-select, "Redaguojate" indicator, and "Duomenys atnaujinti" on update |
| SC-2 | Seller cannot submit the same month twice; attempting to do so shows a clear Lithuanian error | PARTIAL | DB UNIQUE(tenant_id,month) constraint enforced; upsert prevents duplicates. However there is NO distinct "error for duplicate attempt" — the form shows pre-filled values and "Redaguojate jau pateiktus duomenis" which allows editing, not an error path |
| SC-3 | Admin sees center-wide monthly revenue totals with a chart and per-category revenue breakdown | VERIFIED | `revenue-line-chart.tsx` (recharts LineChart) + `category-bar-chart.tsx` (recharts BarChart layout=vertical) both wired from `admin/analytics/page.tsx` via `aggregateMonthlyRevenue` and `aggregateCategoryRevenue` from `lib/utils/analytics.ts` |
| SC-4 | Admin sees a submission status tracker showing which tenants have and have not submitted for the current month | VERIFIED | `submission-tracker.tsx` shows summary cards (Pateike N/total + Laukiama N/total), progress bar, and filterable tenant table with Pateikta/Nepateikta badges; wired from `admin/analytics/page.tsx` via `getSubmissionStatus` |
| SC-5 | Admin can create, edit, reorder, and delete FAQ entries; seller can read all FAQ entries in read-only mode | VERIFIED | `faq-admin-list.tsx` has create/edit/delete/move-up/move-down controls calling `createFaqItem`, `updateFaqItem`, `deleteFaqItem`, `reorderFaqItems` Server Actions; `faq-reader.tsx` renders shadcn Accordion (type=multiple) at `/seller/faq` |

**Score:** 4/5 success criteria verified (SC-2 is PARTIAL — functional but behavioral gap from stated criterion)

---

## Required Artifacts

### Plan 01 — Revenue Submission

| Artifact | Status | Details |
|----------|--------|---------|
| `lib/validations/revenue.ts` | VERIFIED | Exports `revenueFormSchema` and `RevenueFormValues`; uses weekly breakdown structure (z.tuple of 5 weekSchemas + month + submitted_by) with Lithuanian error messages |
| `actions/revenue.ts` | VERIFIED | Exports `submitRevenue`; seller auth guard, tenant lookup, weekly parse → auto-sum totals, upsert with onConflict='tenant_id,month', revalidatePath |
| `app/(dashboard)/seller/revenue/page.tsx` | VERIFIED | Server Component; seller role guard, tenant lookup, revenue_reports fetch, renders `<RevenuePageClient reports={...} />` |
| `components/revenue/revenue-form.tsx` | VERIFIED | Exports `RevenueForm`; 'use client', month selector, 5-week breakdown table with live Suma totals, isEditing flag, "Redaguojate" indicator, submit feedback, calls `submitRevenue`, router.refresh() on success |
| `components/revenue/revenue-page-client.tsx` | VERIFIED | Exports `RevenuePageClient`; 'use client', holds `selectedMonth` state, renders `RevenueForm` + `SubmissionHistory` with shared state |
| `components/revenue/submission-history.tsx` | VERIFIED | Exports `SubmissionHistory`; table of reports sorted descending, clickable rows call `onSelectMonth(report.month.slice(0,7))`, empty state present |

### Plan 02 — Analytics Dashboard

| Artifact | Status | Details |
|----------|--------|---------|
| `lib/utils/analytics.ts` | VERIFIED | Exports all 5 required functions: `aggregateMonthlyRevenue`, `aggregateCategoryRevenue`, `getSubmissionStatus`, `getDateRangeMonths`, `aggregateTenantTrends` — all pure, fully typed |
| `app/(dashboard)/admin/analytics/page.tsx` | VERIFIED | Server Component; admin auth guard, URL searchParam date range, parallel fetch of tenants + reports, calls all aggregation functions, renders RevenueLineChart, CategoryBarChart, TenantTrendChart, SubmissionTracker, AnalyticsDateRange |
| `components/analytics/revenue-line-chart.tsx` | VERIFIED | Exports `RevenueLineChart`; recharts LineChart with XAxis=label, YAxis=EUR, custom tooltip, empty state |
| `components/analytics/category-bar-chart.tsx` | VERIFIED | Exports `CategoryBarChart`; recharts BarChart layout="vertical", LabelList with EUR formatter, empty state |
| `components/analytics/tenant-trend-chart.tsx` | VERIFIED | Exports `TenantTrendChart`; Select dropdown for tenant selection (single-tenant approach chosen over multi-line), recharts LineChart per selection, empty state |
| `components/analytics/submission-tracker.tsx` | VERIFIED | Exports `SubmissionTracker`; 'use client', summary cards (Pateike/Laukiama), progress bar, filter buttons (Visi/Pateike/Laukiama), Table with Pateikta/Nepateikta badges |
| `components/analytics/analytics-date-range.tsx` | VERIFIED | Exports `AnalyticsDateRange`; 'use client', two Select dropdowns pushing ?from=YYYY-MM&to=YYYY-MM to URL via router.push, triggers Server Component refetch |

### Plan 03 — FAQ

| Artifact | Status | Details |
|----------|--------|---------|
| `lib/validations/faq.ts` | VERIFIED | Exports `faqFormSchema` and `FaqFormValues`; question min 3 ('Klausimas per trumpas'), answer min 3 ('Atsakymas per trumpas') |
| `actions/faq.ts` | VERIFIED | Exports `createFaqItem`, `updateFaqItem`, `deleteFaqItem`, `reorderFaqItems`; all with admin role guard; reorderFaqItems revalidates both /admin/faq and /seller/faq |
| `app/(dashboard)/admin/faq/page.tsx` | VERIFIED | Server Component; admin auth guard, fetches faq_items ordered by sort_order, renders `<FaqAdminList items={...} />` |
| `components/faq/faq-admin-list.tsx` | VERIFIED | Exports `FaqAdminList`; 'use client', local state for optimistic reorder, move up/down with disabled states on first/last, edit opens FaqFormDialog, delete opens DeleteFaqDialog, empty state |
| `app/(dashboard)/seller/faq/page.tsx` | VERIFIED | Server Component; seller role guard, fetches faq_items ordered by sort_order, renders `<FaqReader items={...} />` |
| `components/faq/faq-reader.tsx` | VERIFIED | Exports `FaqReader`; shadcn Accordion type="multiple", whitespace-pre-wrap on answers, empty state |

---

## Key Link Verification

### Plan 01 — Revenue

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `revenue-form.tsx` | `actions/revenue.ts` | `submitRevenue` call in `onSubmit` | WIRED | Line 135: `const result = await submitRevenue(values)` inside startTransition |
| `seller/revenue/page.tsx` | `revenue-page-client.tsx` | renders `<RevenuePageClient reports={...} />` | WIRED | Line 46: `<RevenuePageClient reports={reports ?? []} />` |
| `revenue-page-client.tsx` | `revenue-form.tsx` | passes `selectedMonth` state and `onSelectMonth` callback | WIRED | Lines 23-27: `<RevenueForm reports={reports} selectedMonth={selectedMonth} onSelectMonth={setSelectedMonth} />` |
| `submission-history.tsx` | `revenue-page-client.tsx` | clicking row calls `onSelectMonth` in parent | WIRED | Line 61: `onClick={() => onSelectMonth(report.month.slice(0, 7))}` |

### Plan 02 — Analytics

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `admin/analytics/page.tsx` | `lib/utils/analytics.ts` | calls aggregation functions with raw data | WIRED | Lines 94-97: all 4 aggregation functions called with fetched data |
| `admin/analytics/page.tsx` | `revenue-line-chart.tsx` | passes aggregated monthly data as props | WIRED | Line 154: `<RevenueLineChart data={monthlyRevenue} />` |
| `admin/analytics/page.tsx` | `submission-tracker.tsx` | passes computed status arrays from Server Component | WIRED | Lines 162-168: all 5 props passed from getSubmissionStatus result |
| `tenant-trend-chart.tsx` | `lib/utils/analytics.ts` | receives TenantTrendSeries[] typed from analytics.ts | WIRED | Line 26: `import type { TenantTrendSeries } from '@/lib/utils/analytics'` |

### Plan 03 — FAQ

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `faq-admin-list.tsx` | `actions/faq.ts` | calls `reorderFaqItems` on move up/down | WIRED | Line 4: import; Line 51: `await reorderFaqItems(newItems.map((item) => item.id))` |
| `faq-form-dialog.tsx` | `actions/faq.ts` | calls `createFaqItem` or `updateFaqItem` on form submit | WIRED | Line 6: import; Lines 63-66: conditional call based on `isEdit` |
| `seller/faq/page.tsx` | `faq-reader.tsx` | passes faq_items sorted by sort_order | WIRED | Line 36: `<FaqReader items={items ?? []} />` |

---

## Requirements Coverage

All 13 requirements claimed by this phase are covered:

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| REVN-01 | 03-01 | Seller can submit monthly Apyvarta (EUR) + Pirkimu sk. | SATISFIED | Weekly form sums to amount_eur + tx_count; upsert stores both |
| REVN-02 | 03-01 | Seller selects which month they are submitting for | SATISFIED | Month dropdown in revenue-form.tsx generating last 12 months |
| REVN-03 | 03-01 | Seller can update a previously submitted month | SATISFIED | upsert onConflict + isEditing pre-fill + "Duomenys atnaujinti" |
| REVN-04 | 03-01 | Seller cannot submit same month twice without updating | SATISFIED | DB UNIQUE(tenant_id,month) + upsert prevents duplicate rows; SC-2 wording about "error" is debatable (see gaps) |
| ANLT-01 | 03-02 | Admin sees center-wide monthly revenue totals | SATISFIED | RevenueLineChart with aggregateMonthlyRevenue data |
| ANLT-02 | 03-02 | Admin sees revenue breakdown by tenant category | SATISFIED | CategoryBarChart with aggregateCategoryRevenue data |
| ANLT-03 | 03-02 | Admin sees month-over-month trend charts per tenant | SATISFIED | TenantTrendChart with Select dropdown + aggregateTenantTrends data |
| ANLT-04 | 03-02 | Admin sees submission status tracker | SATISFIED | SubmissionTracker with getSubmissionStatus — summary cards + progress bar + badge table |
| FAQ-01 | 03-03 | Admin can create FAQ entries | SATISFIED | FaqFormDialog calls createFaqItem with admin guard |
| FAQ-02 | 03-03 | Admin can edit existing FAQ entries | SATISFIED | FaqFormDialog in edit mode calls updateFaqItem with pre-fill |
| FAQ-03 | 03-03 | Admin can delete FAQ entries with confirmation | SATISFIED | DeleteFaqDialog (AlertDialog) calls deleteFaqItem with useTransition |
| FAQ-04 | 03-03 | Admin can reorder FAQ entries | SATISFIED | Move up/down buttons in FaqAdminList call reorderFaqItems with optimistic local state |
| FAQ-05 | 03-03 | Seller can view all FAQ entries in read-only mode | SATISFIED | FaqReader accordion at /seller/faq, seller role guard, sorted by sort_order |

No orphaned requirements — all 13 IDs from the plans map correctly to phase 03 in REQUIREMENTS.md and are marked [x] (complete).

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `app/(dashboard)/seller/page.tsx` | 28-38 | "Apyvartos pateikimas bus prieinamas netrukus" — old Phase 1 placeholder never updated | Warning | Sellers who navigate to `/seller` (not `/seller/revenue`) see a "coming soon" page; sidebar nav correctly points to `/seller/revenue` so this path is not the primary entry point |
| `app/(dashboard)/admin/page.tsx` | 35-75 | Admin summary cards show `—` with TODO comments for Phase 2/3 real data | Warning | Admin home page still shows placeholder dashes instead of real counts; real data is in `/admin/analytics` and `/admin/tenants` which function correctly |
| `supabase/migrations/001_initial_schema.sql` | 40-48 | revenue_reports table missing `weeks` and `submitted_by` columns | Warning | The initial schema file does not include these columns; they are added in `002_weekly_revenue.sql` which is correct migration practice, but the base schema is incomplete for documentation/onboarding purposes |

---

## Notable Implementation Deviations

### Revenue form: weekly breakdown instead of simple 2-field form

The plan specified a simple form with two fields (Apyvarta EUR + Pirkimu sk.). The implementation uses a 5-week breakdown table where each week has tx_count + amount_eur, plus a "Užpildė" (submitted_by) field. Totals are auto-summed server-side. A migration `002_weekly_revenue.sql` was created to add `weeks jsonb` and `submitted_by text` columns.

**Impact on requirements:** REVN-01 through REVN-04 are all satisfied — the stored data (amount_eur, tx_count in revenue_reports) is the same. Analytics functions consume only these totals. The weekly breakdown is additive, not a regression. However, the CONTEXT.md decision ("Form fields: Apyvarta (EUR) and Pirkimu sk. (transaction count) for the selected month") was not followed.

**Assessment:** The weekly form is a scope expansion beyond what was decided in the context document. It is functional and the analytics data pipeline is unaffected. No success criteria are broken by this change.

### SC-2: No explicit "duplicate error" — upsert model used instead

The stated success criterion says "attempting to [submit the same month] shows a clear Lithuanian error." The implementation never shows an error for a second submission — it silently updates with pre-fill and a blue "Redaguojate" badge. This is a UX-level divergence. The DB constraint (UNIQUE + upsert) ensures no duplicate rows are created, satisfying REVN-04 functionally.

---

## Human Verification Required

### 1. Weekly revenue form UX acceptability

**Test:** Log in as a seller, navigate to /seller/revenue. Observe the form structure.
**Expected:** A 5-row table (weeks I–V) with Pirkimu skaičius and Apyvarta be PVM columns, a Suma row that auto-totals, and a "Užpildė" text field.
**Why human:** The CONTEXT.md and plan specified a simple 2-field form (Apyvarta EUR + Pirkimu sk.). The actual form is a weekly breakdown that sums to those totals. Verify whether this meets the business requirement or whether a simpler form was intended.

### 2. Seller home page placeholder

**Test:** Log in as a seller. Observe the page immediately after login (likely at `/seller`).
**Expected:** Either the seller is automatically redirected to `/seller/revenue`, OR the `/seller` page shows a useful link/redirect to the revenue form.
**Why human:** `seller/page.tsx` shows "Apyvartos pateikimas bus prieinamas netrukus" — a Phase 1 placeholder that was not updated. The sidebar links to `/seller/revenue` correctly but the home page itself is confusing. If sellers land on `/seller` they may think the feature is not yet available.

### 3. Admin home page summary cards

**Test:** Log in as admin. Observe the `/admin` home page.
**Expected:** Summary cards show real data — total tenants count, submissions this month, total revenue.
**Why human:** The admin home page at `/admin` still shows `—` placeholders for all three cards (TDOO Phase 2/Phase 3 comments). Real analytics data is available at `/admin/analytics` but the home page dashboard is not wired.

---

## Gaps Summary

One gap is found at the behavioral level (SC-2). All artifacts exist, are substantive, and are properly wired. The gap is that the stated success criterion ("attempting to submit the same month twice shows a clear Lithuanian error") describes a different behavior than what was implemented (upsert with "Redaguojate" indicator). Functionally, REVN-04 is satisfied — no duplicate rows are created. The divergence is whether the requirement intended to show an error vs. allow an update flow.

Two items require human confirmation: (1) whether the weekly revenue form is acceptable vs. the simple form originally specified, and (2) whether the seller home page placeholder is a blocker for seller usability.

All other success criteria are fully verified with substantive implementations and correct wiring throughout the codebase.

---

_Verified: 2026-02-25T18:00:00Z_
_Verifier: Claude (gsd-verifier)_
