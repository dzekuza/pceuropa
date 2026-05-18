# Phase 1: Foundation - Context

**Gathered:** 2026-02-25
**Status:** Ready for planning

<domain>
## Phase Boundary

DB schema (tenants, revenue_reports, faq_items), Supabase authentication with RLS policies, and a dashboard shell with role-aware sidebar navigation. Admin logs in with email/password, seller with username/password. Unauthenticated users are redirected to login. Role enforcement prevents cross-role access.

</domain>

<decisions>
## Implementation Decisions

### Login page
- Single login page for both roles at /login — system detects role after credentials
- Use shadcn login-03 block as the base (split layout: form side + branded panel)
- Single username field that works for both admin (email) and seller (username), plus password
- All labels in Lithuanian: Prisijungti, Vartotojo vardas, Slaptazodis — consistent with SHLL-04

### Dashboard shell & sidebar
- Use shadcn sidebar-08 block (inset sidebar with secondary navigation)
- Header area: breadcrumb navigation on the left, user avatar/dropdown with logout on the right
- Admin home page: summary cards with quick stats (total tenants, submissions this month, total revenue)
- Seller home page: lands directly on the revenue submission form — the main action sellers come for
- Lithuanian labels throughout: Nuomininkai, Analitika, DUK, Nustatymai (admin); Apyvarta, DUK (seller)

### Claude's Discretion
- Navigation behavior on mobile (drawer vs collapsed sidebar)
- Active state indicators and hover styles
- Auth error messages wording and display style
- Loading states and skeleton screens
- Color scheme and visual details beyond shadcn defaults
- Exact breadcrumb structure

</decisions>

<specifics>
## Specific Ideas

- Login page based on `npx shadcn@latest add login-03` — split layout block
- Sidebar based on `npx shadcn@latest add sidebar-08` — inset sidebar with secondary nav
- Admin summary cards are a placeholder shell in Phase 1 (real data comes in Phase 2-3)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-02-25*
