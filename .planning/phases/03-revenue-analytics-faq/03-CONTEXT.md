# Phase 3: Revenue, Analytics & FAQ - Context

**Gathered:** 2026-02-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Sellers report monthly revenue (Apyvarta EUR + Pirkimu sk.), admins see aggregated analytics with charts and submission tracking, and both roles interact with FAQ (admin CRUD + reorder, seller read-only). Revenue export, advanced metrics (EUR/m2), and notifications are out of scope.

</domain>

<decisions>
## Implementation Decisions

### Revenue submission form
- Current month auto-selected by default, with dropdown to switch to previous months if not yet submitted
- Form fields: Apyvarta (EUR) and Pirkimu sk. (transaction count) for the selected month
- When selecting an already-submitted month, form pre-fills with previous values and shows indicator: "Redaguojate jau pateiktus duomenis"
- Submission history table below the form: columns Menuo, Apyvarta (EUR), Pirkimu sk., Pateikta (date) — clicking a row loads that month into the form for editing
- Inline field validation errors in Lithuanian (e.g., "Apyvarta turi buti teigiamas skaicius") — submit button disabled until valid

### Analytics dashboard layout
- Line chart for center-wide monthly revenue totals — X-axis: months, Y-axis: EUR total, hover shows exact values
- Horizontal bar chart for per-category revenue breakdown — one bar per tenant category, sorted by revenue, EUR values on bars
- Submission status tracker: summary cards at top ("Pateike: 12/18", "Laukiama: 6/18") with progress bar, below a sortable/filterable table of tenants with status badges (Pateikta / Nepateikta)
- Default time range: last 12 months, admin can adjust with a date range picker — all charts update together

### Claude's Discretion
- FAQ management UI (accordion vs flat list, rich text vs plain, reorder mechanism)
- FAQ read-only display for sellers
- Empty state messaging and illustrations
- Chart library choice and exact styling
- Loading skeletons and error states
- Analytics page layout arrangement (card grid, sections)

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. All UI labels in Lithuanian as established in previous phases.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-revenue-analytics-faq*
*Context gathered: 2026-02-25*
