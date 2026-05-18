# Feature Research

**Domain:** Commercial Shopping Center Tenant Management Dashboard
**Researched:** 2026-02-25
**Confidence:** MEDIUM — core tenant portal features verified across multiple sources; shopping-center-specific patterns (sales reporting, tenant mix analytics) confirmed by industry platforms (Retail Report, MRI, Yardi, CenterCheck); FAQ management for internal admin dashboards is light in public research but a well-understood UX pattern.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Tenant CRUD (admin) | Admin must be able to add/edit/remove tenants — the foundation of all other features | LOW | Fields: username, password, operator, company code, store name, category, space m², rent price EUR. All required per PROJECT.md. |
| Secure login with roles | Every dashboard has auth; without role separation admin and seller UX collapse | LOW | Supabase Auth + RLS. Two roles: Admin and Seller. Row-level security gates seller data to their own record. |
| Seller revenue submission | Core value of the platform — why sellers log in at all | LOW | One EUR total per month. Simple form. No breakdown, no attachments. Keep it a single input + month picker. |
| Admin view: all tenants + their revenue | Core value for admin — seeing the full picture in one place | MEDIUM | Tabular view of all tenants. Each row expandable or linkable to that tenant's monthly revenue history. Needs month/year filter. |
| Monthly revenue history per tenant | Admin needs trend visibility — one month is never enough context | LOW | Table or chart of each tenant's submitted months. Visible from admin tenant detail view. |
| Password-based auth (no magic links) | Sellers are non-technical retail store managers; magic links create confusion | LOW | Email + password login. Supabase Auth handles this natively. Admin creates accounts, no self-registration. |
| Admin-managed accounts (no self-signup) | Sellers don't find the platform — admin invites them by creating their account | LOW | Admin creates username/password. Sellers never register themselves. Avoids unauthorized access. |
| Lithuanian UI throughout | Non-negotiable for target users — Lithuanian retail staff won't use an English-only tool | LOW | All labels, nav, error messages, buttons in Lithuanian. Hard-code strings, no i18n library needed for v1. |
| Responsive/accessible web UI | Modern expectation — sellers may access from store tablets or phones | LOW | shadcn/Nova is responsive by default. No special effort needed beyond standard layout. |
| FAQ view for sellers | Sellers need a place to get answers without calling admin | LOW | Read-only list of FAQ entries. Admin creates and manages them; sellers only view. |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valued — align with PC EUROPA's need to understand center-wide performance and simplify tenant communication.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Revenue analytics with per-category breakdown | Industry research (McKinsey, CenterCheck, Retail Report) shows category-level revenue tracking is how center managers optimize tenant mix. Seeing that "Clothing" outperforms "Electronics" by 40% is actionable; seeing total EUR is not. | MEDIUM | Requires grouping submitted revenues by tenant category. Bar chart by category, table with category totals. Depends on: Tenant CRUD (category field) + revenue submissions. |
| Revenue per m² metric (EUR/m² per tenant) | Standard KPI for retail CRE. Total revenue divided by space m² normalizes for store size — a 30m² store at 10,000 EUR/mo outperforms a 200m² store at 20,000 EUR/mo. Without it, admin compares apples to oranges. | LOW | Calculated field: revenue ÷ space m². No extra data needed — all fields already in the data model. Add as a column in the tenant revenue table and per-tenant charts. |
| Month-over-month trend chart per tenant | Single-number monthly reporting becomes meaningful only when trended. Context turns data into insight. | LOW | Line chart per tenant showing 12 months of submitted revenue. shadcn charts (Recharts under the hood) handle this trivially. |
| Center-wide monthly revenue totals dashboard | Admin wants to see how the whole center performed this month vs last month, not just per-tenant. Retail Report and MRI both highlight this as a key admin view. | LOW | Sum of all submitted revenues per month. Line/bar chart of monthly center totals. Depends on: all tenants submitting that month. |
| Revenue submission status tracker (admin) | Retail Report cites a 43% improvement in submission rates when visibility exists. Admin needs to know which tenants haven't submitted for the current month so they can follow up. | LOW | Simple table: tenants × current month, status = Submitted / Not Submitted. No automated reminders needed for v1 — admin follows up manually. |
| FAQ management (admin CRUD) | Most platforms use an external CMS or helpdesk for this. Putting FAQ management directly in the dashboard means admin never leaves to update docs — zero context switch. | LOW | Full CRUD on FAQ entries (question + answer). Ordered list. Sellers see read-only. No rich text needed for v1 — plain text is sufficient. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems. These are explicitly out of scope for PC EUROPA.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Real-time notifications / push alerts | "Remind sellers to submit revenue" sounds valuable | Adds infrastructure complexity (email/SMS/push service), delivery reliability issues, and maintenance overhead. For a small center with ~20-50 tenants, admin can follow up manually. | Use the submission status tracker — admin sees who hasn't submitted and contacts them via their normal channel (WhatsApp, phone, email). |
| Weekly or itemized revenue breakdown | "More data = more insights" is the instinct | Sellers are retail managers, not accountants. Granular reporting increases friction and reduces submission rates. Retail Report's research shows simplicity drives compliance. One number per month is a feature, not a limitation. | Monthly total only. If granularity is needed later, add it in v2 after validating the monthly flow. |
| Tenant self-registration / invite flow | "Let tenants sign up themselves" reduces admin work | Creates access control risk — anyone could create a seller account. For a known closed group of tenants, admin-controlled account creation is safer and simpler. | Admin creates accounts manually. Small tenant count makes this practical. |
| Payment processing (rent collection) | "While they're logged in, collect rent too" | Revenue reporting ≠ payment collection. Adding payment processing introduces PCI compliance, payment gateway integration, financial liability, and significant legal complexity. Out of scope per PROJECT.md. | Platform reports revenue; rent invoicing and collection happen through existing financial processes. |
| Mobile native app | "Sellers want an app on their phone" | Web is already mobile-responsive. A native app doubles the codebase, requires app store review, and is unnecessary for a form-submission tool used once per month. | Responsive web works on mobile. Sellers bookmark the URL. |
| Multi-language support (i18n) | "What if we expand to other countries later?" | Adds significant development overhead (string externalization, locale management, translation maintenance) for a v1 product serving one country with one language. | Lithuanian-only for v1. If expansion happens, add i18n at that point with proper tooling (next-intl). |
| Audit log / change history | "Who changed what?" is a legitimate admin concern | Full audit logging requires significant schema design (event sourcing or append-only log tables), UI to surface it, and ongoing storage. Overkill for a small tenant base. | If needed later, Supabase provides basic updated_at timestamps and can be extended with a simple changelog table in v2. |
| Document management / lease uploads | "Store lease PDFs in the system" | Turns the dashboard into a DMS. Adds file storage, version control, access permissions, and preview complexity. Not requested in PROJECT.md. | Keep leases in existing document systems (Google Drive, email). This dashboard is for revenue reporting and analytics only. |
| Percentage rent / variable rent calculations | "Many retail leases include percentage rent clauses" (Adventures in CRE) | Complex lease math requires legal accuracy, varies per tenant, and creates liability if calculated incorrectly. PC EUROPA has a fixed rent price field only. | Store fixed rent price EUR as a reference field. Revenue is reported; rent billing happens outside the platform. |

---

## Feature Dependencies

```
[Auth (Supabase login + roles)]
    └──required by──> [Tenant CRUD - admin]
    └──required by──> [Revenue submission - seller]
    └──required by──> [FAQ view - seller]
    └──required by──> [Analytics - admin]

[Tenant CRUD - admin]
    └──required by──> [Revenue submission - seller]
                          └──required by──> [Admin revenue view]
                                               └──required by──> [Analytics / charts]
                                               └──required by──> [Submission status tracker]

[Tenant CRUD (category field)]
    └──required by──> [Revenue by category analytics]

[Tenant CRUD (space m² field)]
    └──required by──> [Revenue per m² metric]

[FAQ CRUD - admin]
    └──required by──> [FAQ view - seller]

[Revenue submissions (multiple months)]
    └──enables──> [Month-over-month trend chart]
    └──enables──> [Center-wide monthly totals]
```

### Dependency Notes

- **Auth required by everything:** Nothing works without login and role assignment. Supabase Auth with RLS must be the first thing built.
- **Tenant CRUD before revenue submission:** Sellers are tenants — accounts must exist before they can log in and submit. The tenant record IS the seller account.
- **Revenue submissions before analytics:** Charts and analytics are derived views on top of submitted data. Analytics cannot be developed meaningfully without test data. Build submission first, wire analytics second.
- **FAQ CRUD before FAQ view:** Admin must be able to create FAQ entries before sellers can see anything. Build admin-side first, seller view is just a read query.
- **Multiple months of data required for trends:** The month-over-month chart is only meaningful with 3+ months of data. In early stages, seed test data so charts render correctly during development.

---

## MVP Definition

### Launch With (v1)

Minimum viable product — everything in PROJECT.md requirements is v1. The platform has no value without all of these.

- [ ] Auth — Supabase login, role-based routing (admin vs seller), RLS on all tables
- [ ] Tenant CRUD (admin) — create, edit, delete tenant accounts with all required fields
- [ ] Revenue submission (seller) — submit one EUR total per month, view own submission history
- [ ] Admin revenue view — see all tenants and their submitted monthly revenues, filter by month
- [ ] Revenue analytics (admin) — center-wide totals chart, per-tenant trend chart, revenue per m², category breakdown
- [ ] Submission status tracker (admin) — who has/hasn't submitted for the current month
- [ ] FAQ CRUD (admin) — add, edit, delete FAQ entries
- [ ] FAQ view (seller) — read-only list of FAQ entries
- [ ] Lithuanian UI — all text in Lithuanian

### Add After Validation (v1.x)

Features to add once core flow is proven working and real tenants are using it.

- [ ] Automated submission reminders (email) — only if admin reports that manual follow-up is burdensome
- [ ] CSV/Excel export of revenue data — if admin needs to share data with finance or external parties
- [ ] Comparative period analytics (this month vs same month last year) — only if admin finds month-over-month insufficient

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Rich text FAQ (markdown/WYSIWYG) — only if plain text proves insufficient for complex answers
- [ ] Per-tenant analytics visible to seller — only if sellers request visibility into their own trends
- [ ] Audit trail / change history — if compliance or disputes arise
- [ ] i18n / English support — only if non-Lithuanian admins are added

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Auth + RBAC | HIGH | LOW | P1 |
| Tenant CRUD | HIGH | LOW | P1 |
| Revenue submission (seller) | HIGH | LOW | P1 |
| Admin revenue view (all tenants) | HIGH | LOW | P1 |
| FAQ CRUD (admin) | HIGH | LOW | P1 |
| FAQ view (seller) | HIGH | LOW | P1 |
| Lithuanian UI | HIGH | LOW | P1 |
| Center-wide revenue chart | HIGH | LOW | P1 |
| Per-tenant trend chart | HIGH | LOW | P1 |
| Revenue per m² metric | HIGH | LOW | P1 |
| Revenue by category chart | MEDIUM | LOW | P1 |
| Submission status tracker | MEDIUM | LOW | P1 |
| CSV export | MEDIUM | LOW | P2 |
| Automated email reminders | MEDIUM | MEDIUM | P2 |
| Per-tenant analytics for seller | LOW | LOW | P3 |
| Audit trail | LOW | MEDIUM | P3 |
| i18n | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

| Feature | Retail Report | Yardi / MRI | Our Approach |
|---------|---------------|-------------|--------------|
| Tenant sales submission portal | Yes — dedicated per-tenant portal, multiple submission methods (email, call, portal) | Yes — CommercialCafe tenant portal | Single web form, one EUR total per month. Simpler than enterprise solutions; appropriate for ~20-50 tenants. |
| Revenue analytics for admin | Yes — center-wide dashboards, category breakdowns, submission rates | Yes — complex CAM reconciliations, percentage rent calculations | Core charts: totals, trends, per m², by category. No percentage rent or CAM — out of scope. |
| Role-based access (admin vs tenant) | Yes | Yes | Two roles only: Admin and Seller. No intermediate roles needed for a single-building center. |
| FAQ / knowledge base for tenants | Not found in public feature lists — most use separate helpdesk tools or document portals | Not found as a built-in feature | Direct in-dashboard FAQ CRUD. Admin edits without leaving the platform. Sellers see a simple list. Simpler than an external CMS. |
| Submission status tracking | Yes — Retail Report highlights 43% improvement in submission rates with visibility tools | Available in enterprise platforms | Simple submitted/not-submitted per tenant per month. No automated reminders in v1. |
| Document management | Yes — shared documents in tenant portal | Yes — full DMS capabilities | Deliberately excluded. Adds complexity without being requested. |
| Lease administration | Yes — full lease lifecycle | Yes — core product feature | Rent price stored as a reference field only. No lease management. |

---

## Sources

- Retail Report — Shopping Mall Management Software features: https://retailreport.com/features/shopping-mall-management-software/ (redirected, content sourced from WebSearch summary)
- Retail Report — Retail Sales Data Collection: https://retailreport.com/features/retail-sales-data-collection/
- PropertyAutomate — Shopping Mall Management System: https://propertyautomate.com/blog/shopping-mall-management-system/
- Pickspace — Retail Shopping Malls Management Software: https://www.pickspace.com/retail-shopping-malls-management-software/
- CenterCheck — Store-Level Transaction Analytics (2026 review): https://centercheck.com/blog/centercheck-2026-review-details-pricing-features
- DoorLoop — Commercial Property Management Software: https://www.doorloop.com/blog/best-commercial-property-management-software
- McKinsey — Boosting Mall Revenues Through Advanced Analytics: https://www.mckinsey.com/industries/retail/our-insights/boosting-mall-revenues-through-advanced-analytics
- Adventures in CRE — Tenant Sales and Occupancy Cost: https://www.adventuresincre.com/tenant-sales-occupancy-cost-analysis/
- ICSC — Tenant Sales Data Tech: https://www.icsc.com/news-and-views/icsc-exchange/a-tech-firm-that-can-deliver-tenant-sales-data-and-it-does-other-stuff-too
- Flame Analytics — KPIs Every Shopping Center Should Track: https://flameanalytics.com/en/benchmarking-performance-kpis-shopping-center/
- Yardi CommercialCafe — Tenant Services: https://www.yardi.com/products/commercialcafe/
- RBAC Best Practices 2026: https://www.techprescient.com/blogs/role-based-access-control-best-practices/

---

*Feature research for: PC EUROPA tenant management dashboard*
*Researched: 2026-02-25*
