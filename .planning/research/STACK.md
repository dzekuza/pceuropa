# Stack Research

**Domain:** Tenant management dashboard (SaaS-lite, two-role internal tool)
**Researched:** 2026-02-25
**Confidence:** HIGH (core framework versions verified via official release pages; library versions verified via npm/official sources)

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 16.1.6 | Full-stack React framework | App Router is the current default; Turbopack is now the default bundler (2–5x faster builds). React Compiler stable. Server Actions + `proxy.ts` (formerly `middleware.ts`) replace API routes for most mutation patterns. Async cookies/params enforced — no footguns. Vercel is the native deployment target. |
| React | 19.2 | UI rendering | Bundled with Next.js 16. React Compiler automatic memoization eliminates manual `useMemo`/`useCallback`. View Transitions API for animated route changes. |
| TypeScript | 5.9.x | Type safety | Minimum version required by Next.js 16 is 5.1; current stable is 5.9.x. TypeScript 7 (Go-native) targets mid-2026 — not production-ready yet, stick with 5.9. |
| Tailwind CSS | 4.x | Utility styling | shadcn/ui is fully compatible with Tailwind v4. CSS-first config replaces `tailwind.config.js`. OKLCH color system. `tw-animate-css` replaces deprecated `tailwindcss-animate`. shadcn CLI initializes v4 by default. |
| shadcn/ui | 3.8.5 (CLI) | Component library | Nova preset is production-ready as of December 2025 (`npx shadcn create`). Copy-paste model means zero runtime dependencies. Built-in Chart component (Recharts-backed) ships with the library — no separate charting lib needed for standard dashboard charts. Full Tailwind v4 + React 19 compatibility. |
| Supabase | hosted (JS SDK ^2.x) | Backend-as-a-service | Auth + PostgreSQL + RLS in one service. `@supabase/ssr` handles cookie-based auth for SSR correctly. RLS enforces data isolation at the DB level — no auth bypass possible from the application layer. Free tier is adequate for this project scale. |

---

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@supabase/supabase-js` | ^2.x | Supabase JS client | Always — core database and auth operations |
| `@supabase/ssr` | 0.8.0 (stable) / 0.9.0-rc.6 (pre-release) | Cookie-based SSR auth for Next.js | Always — replaces the deprecated `@supabase/auth-helpers-nextjs`. Required for Server Components, Server Actions, and `proxy.ts` auth token refresh. |
| `react-hook-form` | 7.71.1 | Form state management | All forms (tenant creation, revenue submission, FAQ editing). Do NOT upgrade to v8 beta — breaking changes, not production-ready. |
| `zod` | 4.3.5 | Schema validation | Pair with react-hook-form via `@hookform/resolvers`. Use the same Zod schema on both client (react-hook-form `zodResolver`) and Server Action for shared validation with zero duplication. |
| `@hookform/resolvers` | 5.2.2 | RHF ↔ Zod bridge | Always alongside react-hook-form + zod |
| `recharts` | 3.7.0 | Chart rendering | Used internally by shadcn/ui Chart component. You do NOT import recharts directly — consume it through `<ChartContainer>` from shadcn/ui. Only import recharts directly if you need chart types not exposed by shadcn's chart primitives. |
| `date-fns` | ^4.x | Date formatting/manipulation | Revenue report date handling, chart axis labels (month/year display in Lithuanian locale). Lightweight, tree-shakeable, no moment.js baggage. |
| `lucide-react` | latest | Icons | Specified in the shadcn Nova preset (`iconLibrary=lucide`). Consistent icon family across all dashboard components. |

---

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| ESLint (flat config `eslint.config.mjs`) | Linting | `next lint` command removed in Next.js 16. Projects now use `eslint` CLI directly. shadcn scaffold generates the flat config. |
| Biome | Optional fast linting/formatting alternative | Available at project init. If you prefer it over ESLint, choose at `create-next-app` time. Not recommended to mix both. |
| Turbopack | Bundler | Default in Next.js 16 — no configuration needed. `next dev` and `next build` use it automatically. |
| Supabase CLI | DB migrations, local dev, type generation | `npx supabase gen types typescript` generates TypeScript types from your DB schema. Run this after every migration. |
| Vercel CLI | Preview deployments | `vercel` CLI for branch previews. Environment variables managed in Vercel dashboard, not committed to repo. |

---

## Auth Pattern: Supabase + Next.js 16

### Package Pair (required)
```bash
npm install @supabase/supabase-js @supabase/ssr
```

### File Structure
```
lib/supabase/
  client.ts      # createBrowserClient() — for Client Components
  server.ts      # createServerClient() with cookies() — for Server Components, Server Actions
  middleware.ts  # updateSession() called by proxy.ts
proxy.ts         # replaces middleware.ts in Next.js 16
```

### Critical Security Rule
- Use `supabase.auth.getClaims()` or `getUser()` to protect pages server-side
- **Never** trust `getSession()` in server code — it reads from the cookie without JWT verification
- `getClaims()` validates the JWT signature against Supabase's published keys

### Role-Based Access (Admin vs Seller)
Store roles in `app_metadata` (not `user_metadata`). `app_metadata` cannot be modified by the user client-side — only from a trusted server context (Supabase dashboard, Edge Function, or service-role key).

```sql
-- RLS policy example: sellers can only see their own revenue
CREATE POLICY "seller_own_revenue" ON revenue_reports
  FOR ALL TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'seller'
         AND user_id = auth.uid());

-- RLS policy example: admins see everything
CREATE POLICY "admin_full_access" ON revenue_reports
  FOR ALL TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
```

**Warning:** `user_metadata` (the field users can edit with `updateUser()`) must NEVER be used in RLS policies. Anyone can change it. This is the top misconfiguration causing data exposure (Lovable incident, January 2025: 83% of exposed Supabase DBs had RLS misconfigurations).

---

## Chart Strategy

shadcn/ui ships a built-in `<Chart>` component backed by Recharts 3.x. For this dashboard's analytics requirements (revenue totals, monthly trends, per-tenant comparisons):

- **Bar chart** — monthly revenue totals, per-tenant comparison
- **Line/Area chart** — revenue trends over time
- **Pie/Donut chart** — revenue breakdown by category

All of these are covered by shadcn's Chart primitives. **Do not install Tremor.** It adds a dependency layer on top of Recharts that you already have through shadcn, introduces its own theming that conflicts with Nova, and offers nothing that shadcn's Chart component doesn't already provide for this use case.

---

## Installation

```bash
# Bootstrap with shadcn Nova preset (from PROJECT.md)
npx shadcn@latest create --preset "https://ui.shadcn.com/init?base=base&style=nova&baseColor=neutral&theme=neutral&iconLibrary=lucide&font=inter&menuAccent=subtle&menuColor=default&radius=default&template=next&rtl=false" --template next

# Core dependencies (most are auto-installed by the preset)
npm install @supabase/supabase-js @supabase/ssr

# Forms + validation
npm install react-hook-form@7.71.1 zod@4.3.5 @hookform/resolvers@5.2.2

# Dates (for revenue report month handling)
npm install date-fns

# shadcn chart component (if not included by preset)
npx shadcn@latest add chart

# Dev tools
npm install -D supabase
```

---

## Alternatives Considered

| Recommended | Alternative | When Alternative Makes Sense |
|-------------|-------------|------------------------------|
| shadcn/ui Chart (Recharts 3) | Tremor | If you have NO shadcn/ui and want a full opinionated dashboard kit with zero assembly. Not applicable here — Nova preset is already chosen. |
| shadcn/ui Chart (Recharts 3) | Nivo | If you need complex interactive charts (geomaps, network graphs, heavy D3 customization). Overkill for monthly revenue charts. |
| `@supabase/ssr` | `@supabase/auth-helpers-nextjs` | Never — helpers package is deprecated and abandoned. Will break on Next.js 16. |
| react-hook-form v7 + zod | Conform (with Zod) | If Server Actions are your primary form submission path (Conform integrates better with `useActionState`). For this project's simplicity, RHF v7 is sufficient and more familiar. |
| date-fns | dayjs | Either works. date-fns is more TypeScript-native and tree-shakeable. Avoid moment.js — no tree-shaking, large bundle. |
| Vercel | Netlify, Render | Only if cost becomes an issue. Next.js 16 features (Cache Components, proxy.ts) are optimized for Vercel's infrastructure. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `@supabase/auth-helpers-nextjs` | Officially deprecated, does not support Next.js 16 `proxy.ts` / async cookies pattern. Will throw errors in production. | `@supabase/ssr` |
| `user_metadata` in RLS policies | User-modifiable via `supabase.auth.updateUser()` — anyone can elevate their own role. | `app_metadata` (server-only, set via Supabase dashboard or service-role key) |
| Tremor | Adds an extra dependency layer on top of Recharts when you already have shadcn/ui Chart. Theming conflicts with Nova preset's CSS variables. | shadcn/ui `<Chart>` component |
| react-hook-form v8 beta | Breaking changes from v7, not production-ready (v8.0.0-beta.1 as of January 2026). | react-hook-form@7.71.1 |
| `getSession()` in server code | Reads JWT from cookie without signature verification — can be spoofed. | `getUser()` or `getClaims()` |
| Pages Router | Next.js 16 is App Router-native. Supabase SSR helpers are designed for App Router. Nova preset scaffolds App Router. New projects have no reason to use Pages Router. | App Router |
| `middleware.ts` (in Next.js 16) | Renamed to `proxy.ts` in Next.js 16; `middleware.ts` is deprecated and will be removed in a future version. | `proxy.ts` |
| Zod v3 | Zod v4 is current stable (4.3.5) and the default for `@hookform/resolvers@5.x`. Zod v3 and v4 have API differences — mixing causes type errors. | zod@4.3.5 |

---

## Version Compatibility Matrix

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| Next.js 16.1.6 | React 19.2, TypeScript 5.1+ | Node.js 20.9+ required; Node 18 dropped |
| shadcn/ui 3.8.5 | Tailwind CSS v4, React 19 | `tw-animate-css` replaces `tailwindcss-animate` |
| `@supabase/ssr` 0.8.0 | Next.js 16 (proxy.ts), `@supabase/supabase-js` ^2.x | v0.9.0-rc.6 exists but is pre-release |
| react-hook-form 7.71.1 | React 19, zod 4.x via `@hookform/resolvers` 5.2.2 | Do not mix with v8 beta |
| zod 4.3.5 | `@hookform/resolvers` 5.2.2 | zod 4 is NOT backward-compatible with zod 3 API |
| recharts 3.7.0 | React 19, Tailwind v4 | Consumed via shadcn Chart — no direct import needed |
| Tailwind CSS v4 | shadcn/ui 3.8.5, Next.js 16 | CSS-first config; no `tailwind.config.js` needed |

---

## Stack Patterns by Variant

**For server-side data fetching (analytics page, tenant list):**
- Fetch directly in Server Components using the server Supabase client
- No TanStack Query needed — Next.js 16 cache + `"use cache"` directive handles caching
- TanStack Query only if you need optimistic updates or background polling (not required for this project's v1 scope)

**For form submissions (revenue report, tenant CRUD, FAQ):**
- Client Component with `react-hook-form` + `zodResolver` for client-side validation
- Server Action as the `onSubmit` target for secure server-side validation + DB write
- Same Zod schema used on both client and server

**For protected routes (admin vs seller):**
- `proxy.ts` reads JWT claims from cookie, redirects if unauthenticated
- Server Component checks `app_metadata.role` to render correct dashboard variant
- RLS policies serve as the final enforcement layer regardless of application-level checks

---

## Sources

- [Next.js 16 release blog](https://nextjs.org/blog/next-16) — version confirmed (16.1.6 latest stable), proxy.ts pattern, Turbopack default, breaking changes (HIGH confidence)
- [Next.js 15.5 release blog](https://nextjs.org/blog/next-15-5) — TypeScript improvements, deprecation warnings (HIGH confidence)
- [Supabase SSR docs](https://supabase.com/docs/guides/auth/server-side/nextjs) — `@supabase/ssr` pattern, `getClaims()` vs `getSession()` security guidance (HIGH confidence)
- [Supabase Custom Claims & RBAC docs](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac) — `app_metadata` vs `user_metadata` security (HIGH confidence)
- [shadcn/ui changelog](https://ui.shadcn.com/docs/changelog) — Nova preset, v3.8.5, Tailwind v4 compatibility (HIGH confidence)
- [shadcn/ui chart docs](https://ui.shadcn.com/docs/components/radix/chart) — Recharts-backed Chart component (HIGH confidence)
- [recharts npm](https://www.npmjs.com/package/recharts) — v3.7.0 current stable (HIGH confidence)
- [react-hook-form 2026 guide](https://dev.to/marufrahmanlive/react-hook-form-with-zod-complete-guide-for-2026-1em1) — v7.71.1 current stable, v8 beta warning (MEDIUM confidence — WebSearch, consistent with official docs)
- [TypeScript blog](https://devblogs.microsoft.com/typescript/announcing-typescript-5-8/) — 5.9.x current stable, TypeScript 7 mid-2026 target (HIGH confidence)
- [Tailwind v4 shadcn compat docs](https://ui.shadcn.com/docs/tailwind-v4) — full v4 support, `tw-animate-css` migration (HIGH confidence)
- Next.js 16.1 migration — `proxy.ts` confirmed from community migration guide (MEDIUM confidence — WebSearch verified against official Next.js blog)

---

*Stack research for: PC EUROPA tenant management dashboard*
*Researched: 2026-02-25*
