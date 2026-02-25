# Requirements: PC EUROPA

**Defined:** 2026-02-25
**Core Value:** Admin can see all tenants and their monthly revenue in one place, and sellers can easily report their earnings each month.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication

- [x] **AUTH-01**: Admin can log in with email and password
- [x] **AUTH-02**: Seller can log in with username and password (account created by admin)
- [x] **AUTH-03**: User session persists across browser refresh
- [x] **AUTH-04**: Role-based access — admin sees admin pages, seller sees seller pages
- [x] **AUTH-05**: Unauthorized users are redirected to login page

### Tenant Management (Admin)

- [x] **TNNT-01**: Admin can view a list of all tenants with key info (store name, operator, category, space m², rent price)
- [x] **TNNT-02**: Admin can add a new tenant with fields: username, password, operator, company code (Įm. kodas), store name (Parduotuvė), category (Kategorija), space m² (Patalpos), rent price EUR (Nuomos kaina)
- [x] **TNNT-03**: Admin can edit any tenant's details
- [x] **TNNT-04**: Admin can remove a tenant (with confirmation)
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

- [x] **REVN-01**: Seller can submit monthly revenue: Apyvarta (EUR) + Pirkimų sk. (transaction count)
- [x] **REVN-02**: Seller selects which month they are submitting for
- [x] **REVN-03**: Seller can update a previously submitted month's data
- [x] **REVN-04**: Seller cannot submit for the same month twice without updating (unique constraint)

### Analytics (Admin)

- [ ] **ANLT-01**: Admin sees center-wide monthly revenue totals (chart + summary)
- [ ] **ANLT-02**: Admin sees revenue breakdown by tenant category (bar chart)
- [ ] **ANLT-03**: Admin sees month-over-month trend charts per tenant
- [ ] **ANLT-04**: Admin sees submission status tracker — which tenants submitted / haven't for current month

### FAQ

- [x] **FAQ-01**: Admin can create FAQ entries (question + answer)
- [x] **FAQ-02**: Admin can edit existing FAQ entries
- [x] **FAQ-03**: Admin can delete FAQ entries (with confirmation)
- [x] **FAQ-04**: Admin can reorder FAQ entries
- [x] **FAQ-05**: Seller can view all FAQ entries in read-only mode

### Dashboard Shell

- [x] **SHLL-01**: Dashboard has sidebar navigation with role-aware menu items
- [x] **SHLL-02**: Admin navigation: Nuomininkai (Tenants), Analitika (Analytics), DUK (FAQ), Nustatymai (Settings)
- [x] **SHLL-03**: Seller navigation: Apyvarta (Revenue), DUK (FAQ)
- [x] **SHLL-04**: Lithuanian labels throughout all UI elements
- [x] **SHLL-05**: Responsive layout — works on desktop and tablet

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
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Complete |
| AUTH-04 | Phase 1 | Complete |
| AUTH-05 | Phase 1 | Complete |
| SHLL-01 | Phase 1 | Complete |
| SHLL-02 | Phase 1 | Complete |
| SHLL-03 | Phase 1 | Complete |
| SHLL-04 | Phase 1 | Complete |
| SHLL-05 | Phase 1 | Complete |
| TNNT-01 | Phase 2 | Complete |
| TNNT-02 | Phase 2 | Complete |
| TNNT-03 | Phase 2 | Complete |
| TNNT-04 | Phase 2 | Complete |
| TNNT-05 | Phase 2 | Pending |
| TDTL-01 | Phase 2 | Pending |
| TDTL-02 | Phase 2 | Pending |
| TDTL-03 | Phase 2 | Pending |
| TDTL-04 | Phase 2 | Pending |
| TDTL-05 | Phase 2 | Pending |
| TDTL-06 | Phase 2 | Pending |
| TDTL-07 | Phase 2 | Pending |
| REVN-01 | Phase 3 | Complete |
| REVN-02 | Phase 3 | Complete |
| REVN-03 | Phase 3 | Complete |
| REVN-04 | Phase 3 | Complete |
| ANLT-01 | Phase 3 | Pending |
| ANLT-02 | Phase 3 | Pending |
| ANLT-03 | Phase 3 | Pending |
| ANLT-04 | Phase 3 | Pending |
| FAQ-01 | Phase 3 | Complete |
| FAQ-02 | Phase 3 | Complete |
| FAQ-03 | Phase 3 | Complete |
| FAQ-04 | Phase 3 | Complete |
| FAQ-05 | Phase 3 | Complete |
| LAND-01 | Phase 4 | Pending |
| LAND-02 | Phase 4 | Pending |
| LAND-03 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 38 total
- Mapped to phases: 38
- Unmapped: 0

---
*Requirements defined: 2026-02-25*
*Last updated: 2026-02-25 after roadmap creation*
