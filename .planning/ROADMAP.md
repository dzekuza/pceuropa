# Roadmap: PC EUROPA

## Overview

Four phases take PC EUROPA from a scaffolded Next.js project to a fully deployed tenant management platform. Phase 1 lays the security foundation — database schema, Supabase auth, RLS policies, and the dashboard shell that all features live inside. Phase 2 delivers tenant management, the core admin capability (sellers are tenants — they must exist before anything else). Phase 3 delivers the platform's core value: sellers submit revenue, admins view it and analyze it, and both roles can access FAQ. Phase 4 delivers the public landing page, which has no data dependencies and can be scheduled flexibly.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - DB schema, Supabase auth, RLS policies, and dashboard shell with role-aware navigation (completed 2026-02-25)
- [ ] **Phase 2: Tenant Management** - Admin CRUD for tenant accounts and per-tenant detail tables with auto-calculated metrics
- [ ] **Phase 3: Revenue, Analytics & FAQ** - Seller revenue submission, admin analytics views, and FAQ management
- [ ] **Phase 4: Landing Page** - Public-facing page built from Figma design with link to dashboard login

## Phase Details

### Phase 1: Foundation
**Goal**: Authenticated users with the correct role can reach their dashboard and nothing else
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, SHLL-01, SHLL-02, SHLL-03, SHLL-04, SHLL-05
**Success Criteria** (what must be TRUE):
  1. Admin can log in with email and password and land on the admin dashboard
  2. Seller can log in with username and password and land on the seller dashboard
  3. An unauthenticated visitor attempting to access any dashboard route is redirected to the login page
  4. A seller attempting to access any admin route is redirected away (role enforcement works)
  5. Session persists after browser refresh — users do not need to log in again
**Plans:** 2/2 plans complete

Plans:
- [x] 01-01-PLAN.md — Supabase DB schema (tenants, revenue_reports, faq_items), RLS policies, TypeScript type generation
- [ ] 01-02-PLAN.md — Next.js scaffold with shadcn Nova preset, Supabase SSR clients, proxy.ts middleware, login page, auth callback, dashboard shell with role-aware sidebar

### Phase 2: Tenant Management
**Goal**: Admin can create, view, edit, and remove tenants — and inspect any tenant's yearly revenue detail
**Depends on**: Phase 1
**Requirements**: TNNT-01, TNNT-02, TNNT-03, TNNT-04, TNNT-05, TDTL-01, TDTL-02, TDTL-03, TDTL-04, TDTL-05, TDTL-06, TDTL-07
**Success Criteria** (what must be TRUE):
  1. Admin can see a list of all tenants with store name, operator, category, space m², and rent price
  2. Admin can add a new tenant — the tenant can immediately log in as a seller
  3. Admin can edit any tenant's details and delete a tenant with a confirmation prompt
  4. Admin can open a single tenant page and see a 12-month table with Mėnuo, Apyvarta, Pirkimų sk., P.K, Apyvarta/m², Efektyvumas columns
  5. P.K, Apyvarta/m², and Efektyvumas are auto-calculated — admin never enters these values manually
**Plans:** 1/2 plans executed

Plans:
- [ ] 02-01-PLAN.md — Tenant list page with DataTable, CRUD via side drawer form and delete dialog, Server Actions with service role admin client
- [ ] 02-02-PLAN.md — Tenant detail page with 12-month revenue table, auto-calculated metrics (P.K, Apyvarta/m², Efektyvumas), color-coded efficiency, average row, year selector

### Phase 3: Revenue, Analytics & FAQ
**Goal**: Sellers report monthly revenue, admins see it aggregated and can answer seller questions via FAQ
**Depends on**: Phase 2
**Requirements**: REVN-01, REVN-02, REVN-03, REVN-04, ANLT-01, ANLT-02, ANLT-03, ANLT-04, FAQ-01, FAQ-02, FAQ-03, FAQ-04, FAQ-05
**Success Criteria** (what must be TRUE):
  1. Seller can submit Apyvarta (EUR) and Pirkimų sk. for a selected month — and update a previously submitted month
  2. Seller cannot submit the same month twice; attempting to do so shows a clear Lithuanian error
  3. Admin sees center-wide monthly revenue totals with a chart and per-category revenue breakdown
  4. Admin sees a submission status tracker showing which tenants have and have not submitted for the current month
  5. Admin can create, edit, reorder, and delete FAQ entries; seller can read all FAQ entries in read-only mode
**Plans:** 3 plans

Plans:
- [ ] 03-01-PLAN.md — Seller revenue submission form with month selector, upsert Server Action, and submission history table
- [ ] 03-02-PLAN.md — Admin analytics dashboard with monthly revenue line chart, category bar chart, and submission status tracker
- [ ] 03-03-PLAN.md — FAQ admin CRUD with reorder and seller read-only accordion view

### Phase 4: Landing Page
**Goal**: A visitor to the PC EUROPA website sees the public landing page and can navigate to the dashboard login
**Depends on**: Nothing (no data dependencies — can be built any time after Phase 1)
**Requirements**: LAND-01, LAND-02, LAND-03
**Success Criteria** (what must be TRUE):
  1. Visiting the root URL shows the public PC EUROPA landing page (not the dashboard)
  2. The landing page matches the Figma design
  3. A visible link or button on the landing page takes the visitor to the dashboard login page
**Plans**: TBD

Plans:
- [ ] 04-01: Landing page implementation from Figma design with dashboard login link

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 2/2 | Complete   | 2026-02-25 |
| 2. Tenant Management | 1/2 | In Progress|  |
| 3. Revenue, Analytics & FAQ | 0/3 | Not started | - |
| 4. Landing Page | 0/1 | Not started | - |
