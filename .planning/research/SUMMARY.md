# Project Research Summary

**Project:** PC EUROPA Tenant Management Dashboard
**Domain:** Commercial shopping center tenant management — SaaS-lite internal tool, two-role (Admin/Seller)
**Researched:** 2026-02-25
**Confidence:** HIGH

## Executive Summary

PC EUROPA is a purpose-built internal dashboard for a single commercial shopping center. Sellers (retail store managers) log in once per month to submit a single EUR revenue total. Admins manage tenant accounts, view center-wide revenue analytics, and maintain a FAQ for sellers. The project is fundamentally a two-role CRUD application with an analytics layer — not a complex SaaS product. The recommended approach is Next.js 16 App Router + Supabase, deployed on Vercel, with the shadcn Nova preset providing the UI foundation. All features in PROJECT.md are achievable in a single development cycle, and the implementation complexity is LOW across the board. The primary engineering challenge is not feature complexity — it is security correctness.

The most important decisions in this project are security decisions, not feature decisions. Supabase RLS must be enabled and correctly configured on every table from day one. Role must be stored in `app_metadata` (not `user_metadata`). The service role key must never reach the browser. Server-side auth must use `getClaims()`/`getUser()`, not `getSession()`. Middleware alone is not sufficient as an auth guard (CVE-2025-29927). These are not implementation details to revisit — they are structural decisions that, if wrong, require expensive remediation and can expose tenant PII and revenue data.

The build order is dictated by hard data dependencies: Auth and DB schema must come before everything. Tenant CRUD must come before revenue submission (sellers are tenants — they must exist before they can submit). Revenue submission must come before analytics (analytics is a derived view on submitted data). FAQ is independent and can be slotted anywhere. The landing page has no data dependency and can run in parallel. All 9 v1 features are P1 — the platform has no value with any of them missing.

---

## Key Findings

### Recommended Stack

The stack is well-defined and fully compatible. Bootstrap with `npx shadcn@latest create` using the Nova preset, which scaffolds Next.js 16, React 19, TypeScript 5.9, Tailwind CSS v4, and shadcn/ui 3.8.5 in one command. Supabase handles auth, PostgreSQL, and RLS — no separate auth service needed. Form handling is react-hook-form v7 + zod v4, sharing the same Zod schema between client validation and Server Action server validation. shadcn's built-in Chart component (Recharts-backed) covers all dashboard chart types without additional charting libraries.

Critical version notes: Next.js 16 renames `middleware.ts` to `proxy.ts` and requires `@supabase/ssr` (not the deprecated `@supabase/auth-helpers-nextjs`). react-hook-form v8 beta is not production-ready — stay on v7.71.1. zod v4 is current stable and required by `@hookform/resolvers` v5. Do not install Tremor — it conflicts with Nova's theming and adds no capability beyond what shadcn Chart already provides.

**Core technologies:**
- Next.js 16.1.6: Full-stack React framework — App Router is default; Turbopack is default bundler; Server Actions replace API routes for mutations
- React 19.2: UI rendering — bundled with Next.js 16; React Compiler eliminates manual memoization
- TypeScript 5.9.x: Type safety — minimum 5.1 required by Next.js 16; TypeScript 7 (Go-native) is mid-2026, not ready
- Tailwind CSS 4.x: Utility styling — CSS-first config; OKLCH colors; `tw-animate-css` replaces `tailwindcss-animate`
- shadcn/ui 3.8.5: Component library — Nova preset production-ready; zero runtime dependencies; Chart component included
- Supabase (JS SDK ^2.x): Backend-as-a-service — Auth + PostgreSQL + RLS; `@supabase/ssr` for cookie-based SSR auth

**Supporting libraries:**
- `@supabase/ssr` 0.8.0: Cookie-based SSR auth for Next.js — required; replaces deprecated auth-helpers
- react-hook-form 7.71.1: Form state management — all forms; do not upgrade to v8 beta
- zod 4.3.5: Schema validation — shared between client and Server Action; not backward-compatible with zod v3
- date-fns ^4.x: Date handling — revenue report month/year display in Lithuanian locale

### Expected Features

All features identified in PROJECT.md are classified as P1 (must have for launch) — the platform provides no value without the complete set. Features break cleanly into four functional areas: Auth/RBAC, Tenant Management, Revenue Reporting, and FAQ Management. The revenue analytics layer (charts, per-m² metric, category breakdown, submission tracker) is achievable at LOW complexity because shadcn Chart covers all required chart types and all required data is already captured in the core data model.

**Must have (table stakes) — v1 launch:**
- Auth with Admin/Seller roles — Supabase Auth + RLS; password-based only; no self-registration; admin-created accounts
- Tenant CRUD (admin) — all PROJECT.md fields: operator, company code, store name, category, space m², rent price EUR
- Revenue submission (seller) — one EUR total per month, no breakdowns; keep it a single input + month picker
- Admin revenue view — all tenants, all months; filterable by month/year
- Revenue analytics (admin) — center-wide totals chart, per-tenant trend chart, revenue per m², category breakdown
- Submission status tracker (admin) — which tenants have/haven't submitted for the current month
- FAQ CRUD (admin) — plain text question/answer entries with sort order
- FAQ view (seller) — read-only; sellers never edit
- Lithuanian UI throughout — hard-coded strings; no i18n library needed for v1

**Should have (competitive differentiators — included in v1):**
- Revenue per m² metric — calculated field (revenue / space_m2); no extra data needed; add as a column
- Month-over-month trend chart per tenant — line chart of 12 months; shadcn charts handle trivially
- Revenue by category chart — group submitted revenues by tenant category field; requires seeded test data during dev

**Defer to v1.x (add after validation):**
- CSV/Excel export of revenue data
- Automated submission reminders (email) — only if admin reports manual follow-up is burdensome
- Comparative period analytics (this month vs same month last year)

**Defer to v2+ (future consideration):**
- Rich text FAQ, per-tenant analytics visible to seller, audit trail, i18n, document management, payment processing

**Explicit anti-features (do not build):**
- Real-time notifications/push alerts — adds infrastructure complexity for no v1 gain
- Tenant self-registration — security risk for a closed tenant group
- Payment processing — PCI compliance, legal liability, out of scope
- Mobile native app — responsive web is sufficient

### Architecture Approach

The architecture is a standard Next.js App Router + Supabase pattern with clear role-based route separation. All data fetching happens in React Server Components via the Supabase server client. All mutations go through Server Actions (never API route handlers). Middleware (`proxy.ts` in Next.js 16) validates JWTs and redirects by role, but is NOT the sole auth guard — every Server Component in a protected route must independently call `getUser()` as defense-in-depth against CVE-2025-29927. Two Supabase clients are maintained: a browser client (`createBrowserClient`) for Client Components and a server client (`createServerClient`) for Server Components and Server Actions. A third admin client using the service role key is used only in Server Actions for privileged operations (user creation, `app_metadata` writes).

**Major components:**
1. `proxy.ts` (Next.js 16 middleware) — JWT validation via `getClaims()`, token refresh, role-based redirect; runs at the edge before every request
2. Server Components — data fetching directly from Supabase; renders HTML server-side; no client round-trips for read operations
3. Server Actions — all mutations (create/update/delete tenant, submit revenue, FAQ CRUD); CSRF-protected automatically by Next.js; co-located with forms
4. Supabase RLS policies — final enforcement layer; admin sees all rows; sellers see only their own; enforced at the database level regardless of application-level checks
5. `lib/supabase/client.ts` + `server.ts` — two distinct clients; browser handles session via cookies differently than server; never share a single client instance
6. `actions/` directory — Server Actions for tenants, revenue, and FAQ; service role admin client only instantiated here

**Database schema (three tables):**
- `tenants` — linked to `auth.users` via `user_id`, stores all PROJECT.md fields, `ON DELETE CASCADE` required
- `revenue_reports` — `(tenant_id, month)` UNIQUE constraint prevents duplicate submissions; `month` stored as first day of month date
- `faq_items` — `sort_order` integer for admin-controlled ordering

**Route structure:**
```
app/
  (landing)/           # Public landing page — no auth
  (dashboard)/
    admin/             # Admin-only: tenants, revenue, analytics, faq
    seller/            # Seller-only: revenue submission, faq view
  auth/login           # Password-based login
proxy.ts               # JWT validation + role redirect (Next.js 16)
```

### Critical Pitfalls

1. **RLS disabled on new tables** — Every Supabase table has RLS off by default. Enable RLS and write policies in the same migration. Run Supabase Linter before every deployment. This is the root cause of 83% of Supabase data exposures (Lovable incident, January 2025).

2. **`getSession()` used server-side** — `getSession()` reads the JWT cookie without cryptographic verification; a forged cookie can impersonate an admin. Use `getClaims()` in `proxy.ts` and `getUser()` in all Server Components and Server Actions. Zero tolerance — grep for `getSession` in server code before shipping.

3. **Role in `user_metadata` instead of `app_metadata`** — `user_metadata` is writable by the authenticated user via `supabase.auth.updateUser()`. Any seller can self-escalate to admin. Store role exclusively in `app_metadata`, set via service role key server-side only.

4. **Middleware as the only auth guard (CVE-2025-29927)** — Next.js middleware can be bypassed with the `x-middleware-subrequest` header. Every admin Server Component must call `getUser()` and check `app_metadata.role` independently. Defense in depth is required.

5. **Service role key exposed to browser** — Never prefix `SUPABASE_SERVICE_ROLE_KEY` with `NEXT_PUBLIC_`. The service role key bypasses all RLS. Audit with `grep -r "SERVICE_ROLE" --include="*.tsx"` before deployment — must return zero results.

6. **RLS enabled with no policies (silent empty results)** — Enabling RLS without writing policies causes all queries to return empty arrays with no error. Write SELECT, INSERT, UPDATE, DELETE policies immediately after enabling RLS for each table.

7. **Missing `ON DELETE CASCADE` on tenant FK** — Without cascade, deleting a user via Supabase Admin API fails with a FK constraint error. Always: `user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE`.

---

## Implications for Roadmap

Based on research, the build order is dictated by hard data dependencies and security requirements. The architecture research explicitly provides a 7-phase build order, which aligns with the feature dependency graph from FEATURES.md and the pitfall-to-phase mapping from PITFALLS.md. The roadmapper should follow this order closely.

### Phase 1: Foundation — DB Schema, Auth Config, Type Generation

**Rationale:** Everything else depends on this. RLS must be correct before any feature code is written — a retrofit is expensive. Type generation from the schema eliminates an entire class of runtime bugs.

**Delivers:** Supabase project with all three tables (`tenants`, `revenue_reports`, `faq_items`), RLS enabled and policies written for all tables, both Supabase clients (`lib/supabase/client.ts` and `server.ts`), TypeScript types generated from the schema, `proxy.ts` middleware with JWT validation and role redirect.

**Addresses:** Auth + RBAC (table stakes), all three database tables

**Avoids:** RLS-disabled tables (Pitfall 1), RLS-without-policies silent empty results (Pitfall 2), missing CASCADE (Pitfall 8), role in `user_metadata` (Pitfall 5)

**Research flag:** Standard patterns — Supabase official docs cover this exactly. No phase-level research needed.

---

### Phase 2: Auth Shell — Login, Callback, Dashboard Layout

**Rationale:** Sellers and admin can't use any feature without working auth. The dashboard shell (sidebar, role-aware nav) must exist before any feature pages are built inside it.

**Delivers:** `/auth/login` page (email/password, Lithuanian labels), `/auth/callback` route, `(dashboard)/layout.tsx` with sidebar and role-based navigation, post-login redirect to correct role landing page.

**Addresses:** Secure login (table stakes), Lithuanian UI, Admin-managed accounts

**Avoids:** `getSession()` in server code (Pitfall 4), middleware-only auth guard (Pitfall 10), service role key exposure (Pitfall 6)

**Uses:** `@supabase/ssr`, `proxy.ts`, shadcn sidebar component from Nova preset

**Research flag:** Standard patterns — well-documented in Supabase SSR guide for Next.js. No additional research needed.

---

### Phase 3: Admin Core — Tenant CRUD

**Rationale:** Seller accounts are tenant records. No tenant records = no sellers can log in and submit. Tenant CRUD must be the first feature built after auth.

**Delivers:** `/admin/tenants` (list), `/admin/tenants/new` (create form), `/admin/tenants/[id]` (edit form), `actions/tenants.ts` (createTenant, updateTenant, deleteTenant with service role admin client), confirmation dialog for delete.

**Addresses:** Tenant CRUD (table stakes P1), Admin-managed accounts

**Avoids:** Admin API calls from client (Pitfall 7), service role key exposure (Pitfall 6), missing CASCADE (Pitfall 8 — verified by deleting a test user and confirming cascade)

**Uses:** react-hook-form + zod (shared schema), shadcn Form, shadcn AlertDialog for delete confirmation, `supabaseAdmin` with service role for user creation

**Research flag:** Standard patterns. No additional research needed.

---

### Phase 4: Seller Core — Revenue Submission

**Rationale:** Core reason sellers log in. Must be built before analytics (analytics is derived from this data). Requires tenant records to exist (Phase 3 prerequisite).

**Delivers:** `/seller/revenue` page — submit form (single EUR amount + month picker), list of own past submissions. `actions/revenue.ts` (submitRevenue). UNIQUE constraint on `(tenant_id, month)` enforced at DB and surfaced as a clear error in Lithuanian.

**Addresses:** Revenue submission (table stakes P1), monthly revenue history per tenant

**Avoids:** Duplicate revenue submission (Pitfall — UX and security), Lithuanian validation error messages (UX pitfall), no loading/empty state (UX pitfall)

**Uses:** react-hook-form + zod, date-fns for month formatting, Server Action with `revalidatePath`

**Research flag:** Standard patterns. No additional research needed.

---

### Phase 5: Admin Revenue Views + Analytics

**Rationale:** Admin value-add layer. Requires data from Phase 3 (tenants with category and space_m2 fields) and Phase 4 (submitted revenue records). Seed test data for 3+ months before building charts to make trends visible.

**Delivers:** `/admin/revenue` (all tenants, all months, month filter), `/admin/analytics` (center-wide totals chart, per-tenant trend chart, revenue per m² metric, revenue by category breakdown, submission status tracker). All charts via shadcn `<ChartContainer>`.

**Addresses:** Admin revenue view (P1), all analytics features (P1), submission status tracker (P1), revenue per m² (P1 differentiator), category breakdown (P1 differentiator), center-wide totals (P1 differentiator)

**Avoids:** Fetching all raw rows to client for charting (performance trap — use server-side SQL aggregation), N+1 queries in tenant list (add indexes on `user_id` and `(tenant_id, month)`), analytics page with no loading state (wrap chart sections in `<Suspense>` with skeleton fallback)

**Uses:** shadcn Chart component (Recharts 3 under the hood), date-fns for axis labels, SQL `GROUP BY` aggregation in Server Components

**Research flag:** Standard patterns for chart types. SQL aggregation queries may benefit from quick validation during task-level planning.

---

### Phase 6: FAQ — Admin CRUD + Seller View

**Rationale:** Lowest dependency — FAQ has no dependency on revenue data. Can be built after the core revenue flow is proven. Admin-side CRUD first (sellers can't view what doesn't exist).

**Delivers:** `/admin/faq` (create/edit/delete FAQ entries, sort order), `actions/faq.ts`, `/seller/faq` (read-only ordered list).

**Addresses:** FAQ CRUD (P1 table stakes), FAQ view for sellers (P1 table stakes)

**Avoids:** No RLS on FAQ table (faq_items needs INSERT/UPDATE/DELETE restricted to admin; sellers SELECT only)

**Uses:** shadcn Form, shadcn Table or list component, Server Actions for mutations

**Research flag:** Standard patterns. No research needed.

---

### Phase 7: Landing Page

**Rationale:** No data dependencies. Purely presentational. Can run in parallel with any phase above — schedule based on design readiness, not technical dependencies.

**Delivers:** `(landing)/page.tsx` implementing the Figma design, `(landing)/layout.tsx` with no dashboard navigation.

**Addresses:** Public marketing/information page

**Uses:** shadcn/Nova components, Next.js route group `(landing)/` to isolate layout from dashboard

**Research flag:** No research needed. This is static HTML/CSS implementation of a Figma design.

---

### Phase Ordering Rationale

- **Security first:** Phases 1-2 establish the security foundation. No feature code is written before RLS is correct and auth is working. This is the lesson from the PITFALLS research — retrofitting security is expensive.
- **Data dependencies dictate order:** Phase 3 (tenants) before Phase 4 (revenue) before Phase 5 (analytics). This mirrors the dependency graph in FEATURES.md exactly.
- **Analytics last in core flow:** Phase 5 is deliberately after Phase 4 so that real test data exists when charts are built. Building charts against empty tables hides rendering bugs.
- **FAQ is independent:** Phase 6 has no technical dependency on Phases 3-5. Schedule it when dev bandwidth is available between Phase 4 and Phase 5 if desired.
- **Landing page is parallel work:** Phase 7 can be front-loaded if a designer/front-end resource is available while backend work proceeds.

### Research Flags

Phases with well-documented standard patterns (no phase-level research needed):
- **Phase 1** — Supabase official docs cover schema setup and RLS exactly
- **Phase 2** — Supabase SSR guide for Next.js is the authoritative source; already researched
- **Phase 3** — Admin CRUD with Server Actions is a standard Next.js App Router pattern
- **Phase 4** — Revenue submission form is a standard RHF + Server Action pattern
- **Phase 6** — FAQ CRUD is identical in structure to Phase 3 (Tenant CRUD)
- **Phase 7** — Static landing page, no research needed

Phases that may benefit from task-level planning research:
- **Phase 5 (Analytics)** — SQL aggregation query patterns for Supabase (GROUP BY month, category totals, per-m² calculations). The charts themselves are standard; the query design benefits from review. Consider `/gsd:research-phase` if the SQL patterns are unfamiliar.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Core framework versions verified via official release pages (Next.js blog, TypeScript blog, npm). All critical compatibility relationships confirmed (shadcn v4, RHF v7, zod v4). |
| Features | MEDIUM | Core tenant portal features verified across multiple industry sources (Retail Report, MRI, Yardi, CenterCheck, McKinsey). FAQ management in internal admin dashboards has lighter public documentation, but the pattern is straightforward. |
| Architecture | HIGH | Primary findings from Supabase official docs and Next.js official docs. RLS patterns, SSR auth pattern, and two-client structure are all from official sources. |
| Pitfalls | HIGH | All critical pitfalls sourced from official Supabase docs, official Vercel blog, public CVEs (CVE-2025-29927), and confirmed GitHub issues in the Supabase auth-js repo. |

**Overall confidence:** HIGH

### Gaps to Address

- **Lithuanian string inventory:** All Zod validation messages and UI strings must be in Lithuanian from day one. A string inventory (Lithuanian translations for all form labels, error messages, nav items) should be drafted before coding begins to avoid a retrofit pass. This is a product/content gap, not a technical one.

- **First-login password change flow:** PITFALLS.md flags that admin-set passwords are a UX risk (sellers never change them). The recommended approach (a `first_login` flag in the profiles table + password change prompt) is identified but not included in the core architecture. Decide whether to include this in Phase 2 or defer to v1.x before starting implementation.

- **Role change session invalidation:** PITFALLS.md flags that JWT role claims are stale until expiry after a role change. For this project scale (small number of tenants), programmatic logout via `supabase.auth.admin.signOut(userId, 'others')` is the recommended solution. This needs to be wired into the tenant edit flow (Phase 3) — document the decision explicitly so it's not forgotten.

- **Test data strategy:** Phase 5 (Analytics) requires 3+ months of seeded revenue data for charts to render meaningfully during development. Plan a seed script as part of Phase 4 or Phase 5 setup.

---

## Sources

### Primary (HIGH confidence)
- [Next.js 16 release blog](https://nextjs.org/blog/next-16) — version, proxy.ts, Turbopack default, breaking changes
- [Supabase SSR docs](https://supabase.com/docs/guides/auth/server-side/nextjs) — `@supabase/ssr` pattern, `getClaims()` vs `getSession()` security guidance
- [Supabase Custom Claims & RBAC docs](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac) — `app_metadata` vs `user_metadata`
- [Supabase Row Level Security docs](https://supabase.com/docs/guides/database/postgres/row-level-security) — RLS patterns, policy structure
- [Supabase Hardening the Data API](https://supabase.com/docs/guides/database/hardening-data-api) — service role key security
- [shadcn/ui changelog](https://ui.shadcn.com/docs/changelog) — Nova preset, v3.8.5, Tailwind v4 compatibility
- [shadcn/ui chart docs](https://ui.shadcn.com/docs/components/radix/chart) — Recharts-backed Chart component
- [TypeScript blog](https://devblogs.microsoft.com/typescript/announcing-typescript-5-8/) — 5.9.x current, TypeScript 7 mid-2026
- [CVE-2025-29927: Next.js Middleware Authorization Bypass](https://projectdiscovery.io/blog/nextjs-middleware-authorization-bypass) — middleware bypass via header
- [Vercel: Common mistakes with the Next.js App Router](https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them) — Server Component / Client Component boundary
- [Supabase auth-js issue #898](https://github.com/supabase/auth-js/issues/898) — `getSession()` security risk documentation
- [Next.js Project Structure docs](https://nextjs.org/docs/app/getting-started/project-structure) — route groups, file conventions

### Secondary (MEDIUM confidence)
- [Retail Report — Shopping Mall Management Software features](https://retailreport.com/features/shopping-mall-management-software/) — industry feature patterns
- [CenterCheck — Store-Level Transaction Analytics 2026 review](https://centercheck.com/blog/centercheck-2026-review-details-pricing-features) — analytics KPIs for shopping centers
- [McKinsey — Boosting Mall Revenues Through Advanced Analytics](https://www.mckinsey.com/industries/retail/our-insights/boosting-mall-revenues-through-advanced-analytics) — category-level revenue tracking rationale
- [MakerKit Next.js + Supabase Architecture](https://makerkit.dev/docs/next-supabase/architecture/architecture) — community architecture reference
- [react-hook-form 2026 guide (dev.to)](https://dev.to/marufrahmanlive/react-hook-form-with-zod-complete-guide-for-2026-1em1) — v7.71.1 stable, v8 beta warning

### Tertiary (MEDIUM-LOW confidence)
- [Retail Report — Retail Sales Data Collection](https://retailreport.com/features/retail-sales-data-collection/) — 43% submission rate improvement with visibility tools (cited statistic; treat as directional)
- [PropertyAutomate — Shopping Mall Management System](https://propertyautomate.com/blog/shopping-mall-management-system/) — feature landscape context
- [Flame Analytics — KPIs Every Shopping Center Should Track](https://flameanalytics.com/en/benchmarking-performance-kpis-shopping-center/) — revenue per m² as standard retail KPI

---

*Research completed: 2026-02-25*
*Ready for roadmap: yes*
