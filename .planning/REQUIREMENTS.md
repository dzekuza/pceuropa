# Requirements: PC EUROPA

**Defined:** 2026-02-25
**Core Value:** Admin can see all tenants and their monthly revenue in one place, and sellers can easily report their earnings each month.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication

- [ ] **AUTH-01**: Admin can log in with email and password
- [ ] **AUTH-02**: Seller can log in with username and password (account created by admin)
- [ ] **AUTH-03**: User session persists across browser refresh
- [ ] **AUTH-04**: Role-based access — admin sees admin pages, seller sees seller pages
- [ ] **AUTH-05**: Unauthorized users are redirected to login page

### Tenant Management (Admin)

- [ ] **TNNT-01**: Admin can view a list of all tenants with key info (store name, operator, category, space m², rent price)
- [ ] **TNNT-02**: Admin can add a new tenant with fields: username, password, operator, company code (Įm. kodas), store name (Parduotuvė), category (Kategorija), space m² (Patalpos), rent price EUR (Nuomos kaina)
- [ ] **TNNT-03**: Admin can edit any tenant's details
- [ ] **TNNT-04**: Admin can remove a tenant (with confirmation)
- [ ] **TNNT-05**: Admin can view a single tenant detail page with yearly revenue breakdown table

### Tenant Detail Table (Admin)

- [ ] **TDTL-01**: Single tenant page shows yearly table with columns: Mėnuo, Nuomuojamas plotas (m²), Pirkimų sk., Apyvarta (EUR), P.K (EUR/m²), Apyvarta (EUR/m²), Efektyvumas (%)
- [ ] **TDTL-02**: Table shows all 12 months (Sausis–Gruodis) with data or zeros
- [ ] **TDTL-03**: P.K (EUR/m²) is auto-calculated: Nuomos kaina ÷ plotas
- [ ] **TDTL-04**: Apyvarta (EUR/m²) is auto-calculated: Apyvarta ÷ plotas
- [ ] **TDTL-05**: Efektyvumas (%) is auto-calculated: (Apyvarta ÷ total monthly rent) × 100
- [ ] **TDTL-06**: Vidurkis (average) row at the bottom of the table
- [ ] **TDTL-07**: Year selector to view different years

### Revenue Submission (Seller)

- [ ] **REVN-01**: Seller can submit monthly revenue: Apyvarta (EUR) + Pirkimų sk. (transaction count)
- [ ] **REVN-02**: Seller selects which month they are submitting for
- [ ] **REVN-03**: Seller can update a previously submitted month's data
- [ ] **REVN-04**: Seller cannot submit for the same month twice without updating (unique constraint)

### Analytics (Admin)

- [ ] **ANLT-01**: Admin sees center-wide monthly revenue totals (chart + summary)
- [ ] **ANLT-02**: Admin sees revenue breakdown by tenant category (bar chart)
- [ ] **ANLT-03**: Admin sees month-over-month trend charts per tenant
- [ ] **ANLT-04**: Admin sees submission status tracker — which tenants submitted / haven't for current month

### FAQ

- [ ] **FAQ-01**: Admin can create FAQ entries (question + answer)
- [ ] **FAQ-02**: Admin can edit existing FAQ entries
- [ ] **FAQ-03**: Admin can delete FAQ entries (with confirmation)
- [ ] **FAQ-04**: Admin can reorder FAQ entries
- [ ] **FAQ-05**: Seller can view all FAQ entries in read-only mode

### Dashboard Shell

- [ ] **SHLL-01**: Dashboard has sidebar navigation with role-aware menu items
- [ ] **SHLL-02**: Admin navigation: Nuomininkai (Tenants), Analitika (Analytics), DUK (FAQ), Nustatymai (Settings)
- [ ] **SHLL-03**: Seller navigation: Apyvarta (Revenue), DUK (FAQ)
- [ ] **SHLL-04**: Lithuanian labels throughout all UI elements
- [ ] **SHLL-05**: Responsive layout — works on desktop and tablet

### Landing Page

- [ ] **LAND-01**: Public landing page for PC EUROPA (separate from dashboard)
- [ ] **LAND-02**: Built from custom Figma design
- [ ] **LAND-03**: Link/button to access dashboard login

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Analytics Enhancements

- **ANLT-05**: Revenue per m² metric (EUR/m² per tenant) as analytics widget
- **ANLT-06**: Year-over-year comparison charts
- **ANLT-07**: Export analytics data to CSV/PDF

### Notifications

- **NOTF-01**: Email reminder to sellers who haven't submitted revenue
- **NOTF-02**: Admin notification when seller submits revenue

### Seller Enhancements

- **SELL-01**: Seller can view their own submission history and trend
- **SELL-02**: Seller can view their tenant profile details

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real-time chat / messaging | High complexity, admin contacts tenants via existing channels |
| Payment processing / rent collection | Revenue reporting ≠ payment; PCI compliance overhead |
| Tenant self-registration | Closed user group — admin creates accounts |
| Mobile native app | Web is responsive; unnecessary for monthly form submission |
| Multi-language (i18n) | Lithuanian-only for v1 |
| Document management / lease uploads | Keeps in existing systems (Google Drive, email) |
| Weekly/itemized revenue breakdown | Monthly total + transaction count is sufficient |
| Audit log / change history | Overkill for small tenant base in v1 |
| Percentage rent calculations | Fixed rent only; complex lease math is liability |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | — | Pending |
| AUTH-02 | — | Pending |
| AUTH-03 | — | Pending |
| AUTH-04 | — | Pending |
| AUTH-05 | — | Pending |
| TNNT-01 | — | Pending |
| TNNT-02 | — | Pending |
| TNNT-03 | — | Pending |
| TNNT-04 | — | Pending |
| TNNT-05 | — | Pending |
| TDTL-01 | — | Pending |
| TDTL-02 | — | Pending |
| TDTL-03 | — | Pending |
| TDTL-04 | — | Pending |
| TDTL-05 | — | Pending |
| TDTL-06 | — | Pending |
| TDTL-07 | — | Pending |
| REVN-01 | — | Pending |
| REVN-02 | — | Pending |
| REVN-03 | — | Pending |
| REVN-04 | — | Pending |
| ANLT-01 | — | Pending |
| ANLT-02 | — | Pending |
| ANLT-03 | — | Pending |
| ANLT-04 | — | Pending |
| FAQ-01 | — | Pending |
| FAQ-02 | — | Pending |
| FAQ-03 | — | Pending |
| FAQ-04 | — | Pending |
| FAQ-05 | — | Pending |
| SHLL-01 | — | Pending |
| SHLL-02 | — | Pending |
| SHLL-03 | — | Pending |
| SHLL-04 | — | Pending |
| SHLL-05 | — | Pending |
| LAND-01 | — | Pending |
| LAND-02 | — | Pending |
| LAND-03 | — | Pending |

**Coverage:**
- v1 requirements: 38 total
- Mapped to phases: 0
- Unmapped: 38 ⚠️

---
*Requirements defined: 2026-02-25*
*Last updated: 2026-02-25 after initial definition*
