# PC EUROPA

## What This Is

A web platform for PC EUROPA — a commercial shopping center in Lithuania. It consists of two parts: a public landing page (custom Figma design) and a tenant management dashboard (shadcn/Nova). The dashboard serves two user roles: **Admin** (building management) who manages tenants, views analytics, and edits FAQ; and **Seller** (tenants renting office/store space) who can view FAQ and submit monthly revenue reports.

## Core Value

Admin can see all tenants and their monthly revenue in one place, and sellers can easily report their earnings each month.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Landing page built from custom Figma design (separate from dashboard)
- [ ] Dashboard using shadcn Nova preset with Next.js
- [ ] Supabase backend — auth, database, row-level security
- [ ] Two user roles: Admin and Seller
- [ ] Admin: full CRUD on tenant/user records (username, password, operator, company code, store name, category, space m², rent price EUR)
- [ ] Admin: view all tenants and their submitted monthly revenue
- [ ] Admin: analytics page — revenue overview (totals, monthly trends, charts) and per-tenant stats (revenue per store, comparisons)
- [ ] Admin: manage FAQ entries (add, edit, delete)
- [ ] Seller: view FAQ
- [ ] Seller: submit monthly revenue (single total amount in EUR per month)
- [ ] Full Lithuanian UI — all labels, buttons, navigation in Lithuanian
- [ ] Deploy to Vercel

### Out of Scope

- Mobile app — web-first
- Multi-language (i18n) — Lithuanian only for now
- Real-time notifications — not needed for v1
- Weekly/detailed revenue breakdown — just monthly total
- CMS for FAQ — admin manages directly from dashboard
- Payment processing — revenue is reported, not collected through the platform

## Context

- PC EUROPA is a shopping center where businesses rent retail/office space
- Tenant data model (Lithuanian field names):
  - Vartotojo vardas (Username) — e.g., "Lindex"
  - Slaptažodis (Password)
  - Operatorius (Operator/Company) — e.g., "Lindex UAB"
  - Įm. kodas (Company code) — e.g., "300636460"
  - Parduotuvė (Store name) — e.g., "Lindex"
  - Kategorija (Category) — e.g., "Drabužiai" (Clothing)
  - Patalpos m² (Space) — e.g., "639,69"
  - Nuomos kaina EUR (Rent price) — e.g., "10,00"
- Revenue submission: sellers enter one number per month (total EUR)
- Dashboard preset: `npx shadcn@latest create --preset "https://ui.shadcn.com/init?base=base&style=nova&baseColor=neutral&theme=neutral&iconLibrary=lucide&font=inter&menuAccent=subtle&menuColor=default&radius=default&template=next&rtl=false" --template next`
- Landing page: separate implementation from Figma design (not part of dashboard scaffold)

## Constraints

- **Tech stack**: Next.js + shadcn (Nova preset) + Supabase + Vercel
- **Design**: Dashboard uses shadcn Nova; landing page uses custom Figma design
- **Language**: Lithuanian UI throughout
- **Auth**: Supabase Auth with role-based access (admin vs seller)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Supabase for backend | Fast setup, built-in auth, RLS for role-based access, free tier | — Pending |
| shadcn Nova preset | Modern UI kit, consistent components, good DX with Next.js | — Pending |
| Single monthly revenue figure | Keeps seller UX simple — one number per month | — Pending |
| Admin-managed FAQ | No CMS overhead, admin edits directly in dashboard | — Pending |
| Lithuanian-only UI | Primary users are Lithuanian businesses, no i18n complexity | — Pending |

---
*Last updated: 2026-02-25 after initialization*
