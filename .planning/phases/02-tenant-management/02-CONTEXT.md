# Phase 2: Tenant Management - Context

**Gathered:** 2026-02-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Admin can create, view, edit, and remove tenants — and inspect any tenant's yearly revenue detail with auto-calculated metrics. Tenants are the core entity: sellers must exist before revenue submission or analytics. This phase delivers the full tenant CRUD and per-tenant detail view. Revenue submission by sellers and analytics are Phase 3.

</domain>

<decisions>
## Implementation Decisions

### Tenant list layout
- Data table with sortable columns (not cards or simple list)
- Visible columns: Parduotuve, Operatorius, Kategorija, Plotas (m2), Nuomos kaina (EUR)
- Clicking a row navigates to that tenant's detail page
- Three-dot actions menu at end of each row for quick edit/delete
- Expect 30-100 tenants — needs category filter and possibly pagination

### Create/edit forms
- Side panel / drawer that slides in from the right (list stays visible behind)
- Same form layout for both create and edit (pre-filled when editing)
- Admin manually sets username + password when creating a tenant (shares credentials with seller out-of-band)
- Category (Kategorija) field is a fixed dropdown with predefined options (not free text)
- Fields: username, password, operator, company code (Im. kodas), store name (Parduotuve), category (Kategorija), space m2 (Patalpos), rent price EUR (Nuomos kaina)

### Revenue detail table
- Tenant detail page has info header (store name, operator, category, space m2, rent) above the revenue table
- 12-month table always shows all months (Sausis-Gruodis)
- Auto-calculated columns (P.K, Apyvarta/m2, Efektyvumas) have subtle background tint to distinguish from entered data
- Efektyvumas (%) uses green/yellow/red color coding to indicate performance at a glance
- Months with no submitted data show zeros (0.00 for EUR, 0 for counts), dashes for calculated fields
- Vidurkis (average) row at the bottom
- Year selector to view different years

### Claude's Discretion
- Exact category list for the dropdown (derive from common shopping center tenant types)
- Efektyvumas color thresholds (what % is green vs yellow vs red)
- Table sorting defaults and available sort options
- Delete confirmation dialog style (modal vs inline)
- Pagination vs infinite scroll for the tenant list
- Validation error display style on forms
- Loading states and skeleton patterns

</decisions>

<specifics>
## Specific Ideas

- All UI labels in Lithuanian (Parduotuve, Operatorius, Kategorija, etc.)
- Data table should feel admin-professional — clean, scannable, not cluttered
- Side drawer for forms keeps context (admin can see the list they came from)
- Color-coded efficiency makes monthly performance scannable without reading numbers

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-tenant-management*
*Context gathered: 2026-02-25*
