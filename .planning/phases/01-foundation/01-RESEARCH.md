# Phase 1: Foundation - Research

**Researched:** 2026-02-25
**Domain:** Supabase project setup (DB schema + RLS) + Next.js scaffold (shadcn Nova, auth, dashboard shell)
**Confidence:** HIGH — all critical findings drawn from existing project research (STACK.md, ARCHITECTURE.md, PITFALLS.md) which were sourced from official Supabase docs, Next.js official docs, and public CVEs.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Login page**
- Single login page for both roles at /login — system detects role after credentials
- Use shadcn login-03 block as the base (split layout: form side + branded panel)
- Single username field that works for both admin (email) and seller (username), plus password
- All labels in Lithuanian: Prisijungti, Vartotojo vardas, Slaptazodis — consistent with SHLL-04

**Dashboard shell & sidebar**
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

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTH-01 | Admin can log in with email and password | Supabase `signInWithPassword` — email field; role read from `app_metadata` post-login; redirect to `/admin` |
| AUTH-02 | Seller can log in with username and password (account created by admin) | Same `signInWithPassword` flow — sellers use their username as Supabase email (stored as `username@pceuropa.internal` pattern or just email set to username by admin). Single login page detects role from `app_metadata.role` after authentication. |
| AUTH-03 | User session persists across browser refresh | `@supabase/ssr` cookie-based session — sessions survive refresh automatically; `proxy.ts` refreshes token if expired |
| AUTH-04 | Role-based access — admin sees admin pages, seller sees seller pages | `proxy.ts` reads `app_metadata.role` from validated JWT claims; redirects seller away from `/admin/*`; each admin Server Component also independently checks role (defense-in-depth, CVE-2025-29927) |
| AUTH-05 | Unauthorized users are redirected to login page | `proxy.ts` checks for authenticated session on all `/admin/*` and `/seller/*` routes; unauthenticated request redirects to `/login` |
| SHLL-01 | Dashboard has sidebar navigation with role-aware menu items | shadcn sidebar-08 block; sidebar items rendered conditionally based on `app_metadata.role` read in Server Component layout |
| SHLL-02 | Admin navigation: Nuomininkai, Analitika, DUK, Nustatymai | sidebar-08 items list — Lithuanian labels hardcoded; links to admin sub-routes |
| SHLL-03 | Seller navigation: Apyvarta, DUK | sidebar-08 items list — Lithuanian labels hardcoded; links to seller sub-routes |
| SHLL-04 | Lithuanian labels throughout all UI elements | All strings hardcoded in Lithuanian from day one; no i18n library — use a `lib/strings.ts` constants file to avoid scattered literals |
| SHLL-05 | Responsive layout — works on desktop and tablet | shadcn sidebar-08 handles responsive behavior; Claude's discretion for mobile drawer vs collapsed |
</phase_requirements>

---

## Summary

Phase 1 establishes the security and structural foundation that every subsequent phase builds on. It has two distinct halves: (1) Supabase project setup — creating the database schema, enabling RLS, writing policies, and generating TypeScript types; and (2) Next.js scaffold — bootstrapping with the shadcn Nova preset, wiring Supabase SSR clients, building `proxy.ts` middleware, the `/login` page, the auth callback, and the dashboard shell with role-aware sidebar.

All required patterns for this phase are thoroughly documented in the project's existing research (`.planning/research/`). There is no technical ambiguity — the stack is decided, the architecture is clear, and the security requirements are explicitly mapped to implementation patterns. The only discretion areas for Claude are low-stakes UI decisions (mobile nav behavior, active state styles, loading skeletons, error message wording).

The primary risk in this phase is not complexity — it is security correctness on first pass. RLS must be enabled AND policies must be written in the same migration. The middleware (`proxy.ts`) must NOT be the only auth guard. `getUser()` must be used in Server Components, not `getSession()`. Roles must be stored in `app_metadata`, not `user_metadata`. These non-negotiables are documented in detail in PITFALLS.md and are cross-referenced in every code pattern below.

**Primary recommendation:** Execute Plan 01-01 (Supabase setup) completely and verify it before touching Plan 01-02 (Next.js scaffold). Security foundations cannot be partially in place.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6 | Full-stack React framework | App Router default; `proxy.ts` replaces `middleware.ts`; Turbopack default bundler; Server Actions for mutations |
| React | 19.2 | UI rendering | Bundled with Next.js 16; React Compiler eliminates manual memoization |
| TypeScript | 5.9.x | Type safety | Required by Next.js 16 (min 5.1); generated Supabase types provide full type coverage |
| Tailwind CSS | 4.x | Utility styling | shadcn Nova preset initializes Tailwind v4; CSS-first config (no `tailwind.config.js`) |
| shadcn/ui | 3.8.5 (CLI) | Component library | Nova preset production-ready; login-03 and sidebar-08 blocks are the locked UI choices |
| Supabase | hosted (JS SDK ^2.x) | Backend — auth + DB + RLS | Auth, PostgreSQL, and row-level security in one service; free tier adequate for project scale |
| `@supabase/ssr` | 0.8.0 | Cookie-based SSR auth | Required for App Router; replaces deprecated `@supabase/auth-helpers-nextjs`; handles token refresh in middleware |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@supabase/supabase-js` | ^2.x | Supabase JS client | Core DB and auth operations — always installed |
| `lucide-react` | latest | Icons | Specified in Nova preset; sidebar and header icons |
| Supabase CLI | latest | DB migrations, type generation | `npx supabase gen types typescript` after every migration |

### Phase 1 Does NOT Need Yet

| Library | Reason |
|---------|--------|
| react-hook-form + zod | Forms come in Phase 2+ (tenant CRUD, revenue submission). Do not install in Phase 1. |
| date-fns | Revenue date handling — Phase 3. |
| recharts / shadcn Chart | Analytics — Phase 3. |

### Installation

```bash
# Bootstrap Next.js + shadcn Nova preset (scaffolds Next.js 16, React 19, Tailwind v4, shadcn 3.8.5)
npx shadcn@latest create --preset "https://ui.shadcn.com/init?base=base&style=nova&baseColor=neutral&theme=neutral&iconLibrary=lucide&font=inter&menuAccent=subtle&menuColor=default&radius=default&template=next&rtl=false" --template next

# Supabase SSR auth clients
npm install @supabase/supabase-js @supabase/ssr

# shadcn blocks (locked decisions)
npx shadcn@latest add login-03
npx shadcn@latest add sidebar-08

# Supabase CLI (dev dependency) for migrations + type generation
npm install -D supabase
```

---

## Architecture Patterns

### Recommended Project Structure (Phase 1 scope only)

```
app/
├── (dashboard)/
│   ├── layout.tsx          # Dashboard shell: sidebar-08, header, auth guard
│   ├── admin/
│   │   └── page.tsx        # Admin home — summary cards (placeholder data in Phase 1)
│   └── seller/
│       └── page.tsx        # Seller home — revenue form placeholder (redirects to Phase 3 form)
├── auth/
│   ├── login/
│   │   └── page.tsx        # Login page — shadcn login-03 block, Lithuanian labels
│   └── callback/
│       └── route.ts        # Auth callback for session exchange
└── layout.tsx              # Root layout

lib/
├── supabase/
│   ├── client.ts           # createBrowserClient() — Client Components only
│   └── server.ts           # createServerClient() with cookies() — Server Components + Actions
├── auth/
│   └── get-role.ts         # Helper: extract role from JWT claims
└── strings.ts              # Lithuanian UI strings constants

types/
└── database.ts             # Generated: npx supabase gen types typescript

proxy.ts                    # JWT validation + role redirect (Next.js 16 middleware)

supabase/
└── migrations/
    └── 001_initial_schema.sql  # tenants, revenue_reports, faq_items + RLS + policies
```

### Pattern 1: Supabase SSR Client Split (Two Clients Required)

**What:** Browser and server environments handle cookies differently. Two separate factory functions are required — never share a single client instance.

**When to use:** Always. Client Components use the browser client; Server Components, Server Actions, and `proxy.ts` use the server client.

```typescript
// lib/supabase/client.ts — for Client Components
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

```typescript
// lib/supabase/server.ts — for Server Components, Server Actions, Route Handlers
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

### Pattern 2: proxy.ts Middleware (JWT Validation + Role Redirect)

**What:** `proxy.ts` (the Next.js 16 name for `middleware.ts`) runs at the Edge before every request. It validates the JWT cryptographically via `getClaims()`, refreshes expired tokens, and redirects unauthenticated or wrong-role users.

**Critical:** This is NOT the sole auth guard. Every admin Server Component must also call `getUser()` independently (CVE-2025-29927 — middleware can be bypassed with `x-middleware-subrequest` header).

**Important note on `getClaims()` vs `getUser()`:** The existing project research references `getClaims()` in middleware. As of `@supabase/ssr` 0.8.0, the standard pattern from official Supabase docs uses `getUser()` in middleware for token refresh, and `getUser()` again in Server Components for auth validation. Use `getUser()` consistently — it validates the JWT with the Supabase Auth server. Do NOT use `getSession()` anywhere in server code.

```typescript
// proxy.ts (Next.js 16 — replaces middleware.ts)
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // MUST use getUser() — validates JWT with Supabase server. Never use getSession().
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isDashboardRoute = pathname.startsWith('/admin') || pathname.startsWith('/seller')

  // Redirect unauthenticated users away from dashboard routes
  if (!user && isDashboardRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect authenticated users away from login if already signed in
  if (user && pathname === '/login') {
    const role = user.app_metadata?.role
    const destination = role === 'admin' ? '/admin' : '/seller'
    return NextResponse.redirect(new URL(destination, request.url))
  }

  // Role enforcement: sellers cannot access admin routes
  if (user && pathname.startsWith('/admin')) {
    const role = user.app_metadata?.role
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/seller', request.url))
    }
  }

  // CRITICAL: Return supabaseResponse — not NextResponse.next() — so cookie refresh propagates
  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

### Pattern 3: Role Storage in app_metadata (Not user_metadata)

**What:** User roles (`admin` / `seller`) are stored in `app_metadata.role`. This field is server-only writeable — users cannot modify it via the client SDK. `user_metadata` is writable by users via `supabase.auth.updateUser()` and must NEVER be used for authorization decisions.

**For Phase 1:** The admin user is created manually in the Supabase dashboard with `app_metadata: { role: "admin" }`. Seller accounts are not created in Phase 1 — that happens in Phase 2 (Tenant CRUD) via the service role admin client.

**RLS policy pattern using app_metadata:**
```sql
-- Correct (app_metadata — server-only)
USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')

-- Wrong (user_metadata — user-writable)
USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')  -- NEVER DO THIS
```

### Pattern 4: Defense-in-Depth Auth (Middleware + Server Component)

**What:** Every admin Server Component must independently verify the user is admin. Middleware is the first line of defense (fast redirect), but cannot be the only guard.

```typescript
// app/(dashboard)/admin/page.tsx — admin home page
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminHomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Defense-in-depth: check even though middleware already redirected non-admins
  if (!user || user.app_metadata?.role !== 'admin') {
    redirect('/login')
  }

  // Render admin home — placeholder summary cards in Phase 1
  return (
    <div>
      {/* Summary cards: total tenants, submissions this month, total revenue */}
      {/* Real data comes in Phase 2-3; Phase 1 renders placeholders */}
    </div>
  )
}
```

### Pattern 5: Auth Callback Route

**What:** Supabase Auth uses a callback URL to exchange the authorization code for a session. Required for the login flow to complete correctly.

```typescript
// app/auth/callback/route.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to dashboard after login — middleware will enforce role-based routing
  return NextResponse.redirect(new URL('/admin', request.url))
}
```

### Pattern 6: Login Page (shadcn login-03 block, Lithuanian)

**What:** Single login page for both roles. Uses Supabase `signInWithPassword`. After login, reads `app_metadata.role` from the session and redirects accordingly.

**Locked decisions:** Use login-03 block (split layout). Single "Vartotojo vardas" field for both admin (email) and seller (username). All labels Lithuanian.

**Admin logs in with email** — standard Supabase email field.
**Seller logs in with username** — Admin creates the seller account; the Supabase user email is set to a deterministic pattern (e.g., `username@pceuropa.lt` or the actual email if the seller has one). The login-03 form collects whatever identifier the user types and passes it as the `email` field to `signInWithPassword`. The admin's email is their real email; the seller's "username" maps to their Supabase email via the pattern the admin used when creating the account.

**Implementation approach:** The login form collects `vartotojoVardas` (username/email) and `slaptazodis` (password). On submit, call `supabase.auth.signInWithPassword({ email: vartotojoVardas, password: slaptazodis })`. After success, read `user.app_metadata.role` and redirect to `/admin` or `/seller`.

```typescript
// Simplified login action — 'use client' or Server Action depending on approach
async function handleLogin(vartotojoVardas: string, slaptazodis: string) {
  const supabase = createClient() // browser client
  const { data, error } = await supabase.auth.signInWithPassword({
    email: vartotojoVardas,
    password: slaptazodis,
  })

  if (error) {
    // Display Lithuanian error: "Neteisingas vartotojo vardas arba slaptažodis"
    return
  }

  const role = data.user?.app_metadata?.role
  // Redirect handled by middleware on next navigation, or explicitly:
  window.location.href = role === 'admin' ? '/admin' : '/seller'
}
```

### Pattern 7: Database Schema + RLS Migration

**What:** All three tables created with RLS enabled and policies written in a single migration. Never leave a table with RLS on and no policies (silent empty results). Never leave a table without RLS (data exposure).

```sql
-- supabase/migrations/001_initial_schema.sql

-- ─────────────────────────────────────────────
-- TENANTS TABLE
-- ─────────────────────────────────────────────
CREATE TABLE public.tenants (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE,  -- CASCADE required
  store_name   text NOT NULL,           -- Parduotuvė
  operator     text,                    -- Operatorius
  company_code text,                    -- Įm. kodas
  category     text,                    -- Kategorija
  space_m2     numeric,                 -- Patalpos m²
  rent_eur     numeric,                 -- Nuomos kaina EUR
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenants_admin_all" ON public.tenants
  FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "tenants_seller_own_select" ON public.tenants
  FOR SELECT TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'seller'
    AND user_id = auth.uid()
  );

-- ─────────────────────────────────────────────
-- REVENUE REPORTS TABLE
-- ─────────────────────────────────────────────
CREATE TABLE public.revenue_reports (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE,  -- CASCADE required
  tenant_id    uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  month        date NOT NULL,           -- First day of month: 2025-01-01 = January 2025
  amount_eur   numeric NOT NULL,        -- Apyvarta EUR
  tx_count     integer,                 -- Pirkimų skaičius
  submitted_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, month)             -- Prevents duplicate submissions per month
);

ALTER TABLE public.revenue_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "revenue_admin_all" ON public.revenue_reports
  FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "revenue_seller_own_select" ON public.revenue_reports
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "revenue_seller_own_insert" ON public.revenue_reports
  FOR INSERT TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'seller'
    AND user_id = auth.uid()
  );

CREATE POLICY "revenue_seller_own_update" ON public.revenue_reports
  FOR UPDATE TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'seller'
    AND user_id = auth.uid()
  );

-- ─────────────────────────────────────────────
-- FAQ ITEMS TABLE
-- ─────────────────────────────────────────────
CREATE TABLE public.faq_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question    text NOT NULL,
  answer      text NOT NULL,
  sort_order  integer DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "faq_admin_all" ON public.faq_items
  FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "faq_authenticated_select" ON public.faq_items
  FOR SELECT TO authenticated
  USING (true);  -- All authenticated users (admin + seller) can read FAQ

-- ─────────────────────────────────────────────
-- INDEXES (performance for RLS and joins)
-- ─────────────────────────────────────────────
CREATE INDEX ON public.tenants(user_id);
CREATE INDEX ON public.revenue_reports(user_id);
CREATE INDEX ON public.revenue_reports(tenant_id, month);
CREATE INDEX ON public.faq_items(sort_order);
```

### Pattern 8: Dashboard Shell with Role-Aware Sidebar (sidebar-08)

**What:** `(dashboard)/layout.tsx` is a Server Component that reads the user's role and passes the appropriate nav items to the sidebar-08 block.

**Locked decisions:** sidebar-08 block; breadcrumb on left + user avatar/dropdown with logout on right; Lithuanian nav labels.

```typescript
// app/(dashboard)/layout.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { ADMIN_NAV_ITEMS, SELLER_NAV_ITEMS } from '@/lib/strings'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const role = user.app_metadata?.role as 'admin' | 'seller'
  const navItems = role === 'admin' ? ADMIN_NAV_ITEMS : SELLER_NAV_ITEMS

  return (
    <div className="flex h-screen">
      <AppSidebar navItems={navItems} user={user} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
```

```typescript
// lib/strings.ts — Lithuanian string constants
export const ADMIN_NAV_ITEMS = [
  { label: 'Nuomininkai', href: '/admin/tenants', icon: 'Building2' },
  { label: 'Analitika',   href: '/admin/analytics', icon: 'BarChart2' },
  { label: 'DUK',         href: '/admin/faq', icon: 'HelpCircle' },
  { label: 'Nustatymai',  href: '/admin/settings', icon: 'Settings' },
]

export const SELLER_NAV_ITEMS = [
  { label: 'Apyvarta', href: '/seller/revenue', icon: 'TrendingUp' },
  { label: 'DUK',      href: '/seller/faq', icon: 'HelpCircle' },
]

export const AUTH_STRINGS = {
  loginTitle: 'Prisijungti',
  usernameLabel: 'Vartotojo vardas',
  passwordLabel: 'Slaptažodis',
  loginButton: 'Prisijungti',
  loginError: 'Neteisingas vartotojo vardas arba slaptažodis',
  logoutLabel: 'Atsijungti',
}
```

### Pattern 9: TypeScript Type Generation

**What:** After the migration runs, generate TypeScript types from the Supabase schema. These types are imported everywhere database queries are made.

```bash
# Link to Supabase project first
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF

# Generate types
npx supabase gen types typescript --linked > types/database.ts

# Re-run this after every schema migration
```

### Anti-Patterns to Avoid

- **Using `getSession()` server-side:** Reads cookie without JWT verification. Use `getUser()` in Server Components and Server Actions; use `getUser()` in `proxy.ts` for token refresh.
- **Storing role in `user_metadata`:** Writable by any user via `supabase.auth.updateUser()`. Always use `app_metadata`.
- **RLS on without policies:** Results in silent empty query results. Write SELECT policy immediately after `ENABLE ROW LEVEL SECURITY`.
- **Middleware as sole auth guard:** CVE-2025-29927. Every admin Server Component calls `getUser()` independently.
- **Single Supabase client for browser and server:** Causes session loss or hydration errors. Two clients: `client.ts` and `server.ts`.
- **`NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`:** Service role key must never have the `NEXT_PUBLIC_` prefix. It belongs in `SUPABASE_SERVICE_ROLE_KEY` — server-only. (Service role client is not needed in Phase 1, but the env var naming convention must be set correctly from the start.)
- **Using `middleware.ts` instead of `proxy.ts`:** Next.js 16 renamed middleware. Use `proxy.ts`.
- **Testing RLS in Supabase SQL Editor:** SQL Editor runs as postgres superuser — bypasses RLS. Test RLS via JS client with real authenticated sessions only.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Session cookie management | Custom cookie serialization | `@supabase/ssr` `createServerClient` with cookie adapter | Token refresh, secure cookie attributes, edge compatibility — enormous edge case surface |
| JWT validation | Manual JWT decode + verify | `supabase.auth.getUser()` — validates against Supabase's published public keys | Cryptographic validation, key rotation, expiry handling |
| Role-based redirect in middleware | Custom role extraction logic | Read `user.app_metadata.role` from `getUser()` result | Supabase auth already populates `app_metadata`; hand-rolling risks the `user_metadata` mistake |
| Auth callback handler | Custom code exchange | Standard Supabase `exchangeCodeForSession` pattern | Handles PKCE, state parameter, nonce — all security-critical |
| Mobile sidebar toggle | Custom drawer component | shadcn sidebar-08 block handles responsive behavior | Already built and tested; Claude's discretion for exact mobile behavior |

**Key insight:** The Supabase + Next.js 16 SSR auth pattern has many security-critical edge cases (cookie refresh, JWT validation, PKCE). Every deviation from the official `@supabase/ssr` pattern is a potential security hole. Follow the official pattern exactly.

---

## Common Pitfalls

### Pitfall 1: RLS Enabled With No Policies (Silent Empty Results)

**What goes wrong:** Table has RLS on but no policies written. All queries return empty arrays — no error, no warning. Dashboard renders empty. Very hard to debug.

**Why it happens:** Developer enables RLS as a security step, then moves on to writing app code before writing policies.

**How to avoid:** Write RLS + all policies in the same migration block. Never commit a migration that enables RLS without policies.

**Warning signs:** Supabase dashboard shows data but the app shows nothing. SQL Editor returns rows but the JS client returns empty arrays.

### Pitfall 2: getSession() in Server Code

**What goes wrong:** `getSession()` reads the JWT cookie without revalidating it with the Supabase Auth server. A crafted/forged cookie can impersonate an admin.

**How to avoid:** Use `getUser()` everywhere in server code. Zero exceptions. Run `grep -r "getSession" app/` before each commit — must return zero results in server files.

### Pitfall 3: Middleware Not Returning supabaseResponse

**What goes wrong:** If `proxy.ts` returns `NextResponse.next()` instead of `supabaseResponse`, the refreshed cookies are not sent to the browser. User gets logged out randomly (when token expires and refresh is discarded).

**How to avoid:** Always return `supabaseResponse` from middleware, not a new `NextResponse.next()`. The cookie setAll in the Supabase client writes to `supabaseResponse` — returning a different response loses those cookies.

### Pitfall 4: Seller Username Login Confusion

**What goes wrong:** Sellers log in with a username, but Supabase auth uses email as the primary identifier. If the mapping between seller username and Supabase user email is not defined clearly, the login page "Vartotojo vardas" field won't work correctly.

**How to avoid:** Define the admin's seller account creation pattern in Plan 01-01. Recommended: admin creates seller accounts with email set to `{username}@pceuropa.lt` (or a real email if available). The login-03 form's "Vartotojo vardas" field accepts either format. Document this convention in `lib/strings.ts` or a comment in the admin create-user Server Action (Phase 2).

**For Phase 1:** This only affects testing. Create one test admin account (email/password) in the Supabase dashboard for verification. Seller account creation comes in Phase 2.

### Pitfall 5: Admin Summary Cards Fetching Real Data in Phase 1

**What goes wrong:** Admin home page (summary cards: total tenants, submissions this month, total revenue) tries to query `tenants` and `revenue_reports` — but no tenant records exist yet in Phase 1. Query returns zero/null, card renders "0" or errors.

**How to avoid:** Phase 1 admin home renders placeholder/static summary cards. Real data queries are wired in Phase 2 (tenant count) and Phase 3 (revenue totals). Note this explicitly in the component with a `// TODO Phase 2: wire real data` comment.

### Pitfall 6: Seller Home Page Has Nowhere to Go

**What goes wrong:** Seller home page at `/seller` needs to land on the revenue submission form — but the form doesn't exist until Phase 3. Phase 1 renders an empty seller home.

**How to avoid:** Phase 1 seller home renders a clear placeholder: "Apyvarta bus prieinama netrukus" (Revenue coming soon) or simply a shell layout. Or: seller home redirects to `/seller/revenue` which renders a placeholder. Either approach is fine — the key is it must not error.

---

## Code Examples

### Environment Variables (required)

```bash
# .env.local — never commit to git
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Server-only — NO NEXT_PUBLIC_ prefix
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Not needed in Phase 1 but set correctly from start
```

### Logout Server Action

```typescript
// actions/auth.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
```

### Role Helper

```typescript
// lib/auth/get-role.ts
import { createClient } from '@/lib/supabase/server'

export async function getRole(): Promise<'admin' | 'seller' | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return (user.app_metadata?.role as 'admin' | 'seller') ?? null
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact for Phase 1 |
|--------------|------------------|--------------|-------------------|
| `middleware.ts` | `proxy.ts` | Next.js 16 | Rename the file — same code, different filename |
| `@supabase/auth-helpers-nextjs` | `@supabase/ssr` | 2024 | auth-helpers is deprecated; will break on Next.js 16 |
| `getSession()` server-side | `getUser()` server-side | Supabase 2024 security advisory | getSession reads cookie without JWT validation |
| `tailwind.config.js` | CSS-first config in `globals.css` | Tailwind v4 | Nova preset scaffolds this automatically; no manual tailwind config needed |
| `middleware.ts` for all auth | middleware + Server Component double-check | CVE-2025-29927 (2025) | Defense-in-depth required |

**Deprecated/outdated:**
- `@supabase/auth-helpers-nextjs`: Officially abandoned, does not support Next.js 16 async cookies or `proxy.ts`. Do not install it.
- `tailwindcss-animate`: Replaced by `tw-animate-css` in Tailwind v4 / shadcn 3.8.5. Nova preset handles this.
- `middleware.ts` filename: Deprecated in Next.js 16. Use `proxy.ts`.

---

## Open Questions

1. **Seller "username" to Supabase email mapping convention**
   - What we know: Supabase auth uses email as the primary identifier; sellers log in with a username field
   - What's unclear: Exact convention for how admin sets the seller's Supabase email when creating their account (Phase 2)
   - Recommendation: Decide in Plan 01-02 (login page implementation) and document in `lib/strings.ts`. Suggested pattern: `{username}@pceuropa.lt` as the Supabase email. Sellers type their username in the "Vartotojo vardas" field on login; the login form appends `@pceuropa.lt` before calling `signInWithPassword`. Alternatively, just use the seller's real email if they have one — simpler and avoids the suffix hack.

2. **proxy.ts filename — confirmed in Next.js 16?**
   - What we know: STATE.md decisions say "proxy.ts"; ARCHITECTURE.md diagram still says "middleware.ts"
   - What's unclear: The official Next.js 16 release blog should be the authoritative source. The STACK.md cites the Next.js 16 blog (HIGH confidence) and states `proxy.ts` is the current filename.
   - Recommendation: Use `proxy.ts`. If the scaffold generates `middleware.ts`, rename it. This is LOW risk — the file content is identical.

3. **Admin account creation for Phase 1 testing**
   - What we know: Admin creates sellers (Phase 2); the first admin account must exist before Phase 1 can be verified
   - What's unclear: How is the initial admin account created? (Supabase dashboard, migration seed, or admin SDK)
   - Recommendation: Create the initial admin account manually in the Supabase dashboard, then set `app_metadata: { role: "admin" }` via the dashboard user editor or via a Supabase SQL migration: `UPDATE auth.users SET raw_app_meta_data = '{"role": "admin"}'::jsonb WHERE email = 'admin@pceuropa.lt';`

---

## Sources

### Primary (HIGH confidence)

- `.planning/research/STACK.md` — full stack with versions, verified against official release pages (Next.js 16 blog, TypeScript blog, npm, shadcn changelog)
- `.planning/research/ARCHITECTURE.md` — project structure, component responsibilities, data flow, RLS policy patterns (sourced from Supabase official docs)
- `.planning/research/PITFALLS.md` — all critical security pitfalls with official source citations (Supabase docs, CVE-2025-29927, Supabase auth-js issue #898)
- `.planning/research/SUMMARY.md` — executive synthesis of all research domains
- [Supabase SSR docs](https://supabase.com/docs/guides/auth/server-side/nextjs) — `@supabase/ssr` pattern, `getUser()` vs `getSession()` guidance
- [Supabase Row Level Security docs](https://supabase.com/docs/guides/database/postgres/row-level-security) — RLS enable + policy patterns
- [Supabase Custom Claims & RBAC docs](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac) — `app_metadata` vs `user_metadata`
- [CVE-2025-29927](https://projectdiscovery.io/blog/nextjs-middleware-authorization-bypass) — Next.js middleware bypass via `x-middleware-subrequest` header

### Secondary (MEDIUM confidence)

- Next.js 16 `proxy.ts` rename — cited in STACK.md as sourced from Next.js 16 blog + community migration guides

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versions confirmed via official release pages in prior project research
- Architecture: HIGH — patterns sourced from Supabase official docs and Next.js official docs
- Pitfalls: HIGH — all critical pitfalls sourced from official Supabase docs, public CVEs, and official GitHub issues
- Phase-specific patterns (login-03, sidebar-08): MEDIUM — shadcn blocks are documented but the exact integration with the auth flow requires implementation-time verification

**Research date:** 2026-02-25
**Valid until:** 2026-03-25 (Supabase SSR and Next.js are relatively stable; re-check if `@supabase/ssr` 0.9.0 reaches stable before planning)
