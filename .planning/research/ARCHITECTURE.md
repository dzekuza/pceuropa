# Architecture Research

**Domain:** Tenant Management Dashboard (Next.js App Router + Supabase)
**Researched:** 2026-02-25
**Confidence:** HIGH (Supabase official docs + Next.js official docs verified patterns)

---

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Browser (Client)                            │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐    │
│  │  Landing     │  │  Auth Pages  │  │  Dashboard (RSC + CC)  │    │
│  │  Page (RSC)  │  │  /auth/*     │  │  /dashboard/*          │    │
│  └──────┬───────┘  └──────┬───────┘  └───────────┬────────────┘    │
└─────────┼─────────────────┼──────────────────────┼─────────────────┘
          │                 │                      │
┌─────────┼─────────────────┼──────────────────────┼─────────────────┐
│         │           Next.js Edge                 │                  │
│         │         ┌───────────────────┐          │                  │
│         │         │    middleware.ts   │          │                  │
│         │         │  - JWT validation  │          │                  │
│         │         │  - Token refresh   │          │                  │
│         │         │  - Role redirect   │          │                  │
│         │         └────────┬──────────┘          │                  │
└─────────┼──────────────────┼─────────────────────┼─────────────────┘
          │                  │                      │
┌─────────┼──────────────────┼─────────────────────┼─────────────────┐
│         │           Next.js Server                │                  │
│  ┌──────┴──────┐  ┌────────┴──────┐  ┌───────────┴──────────────┐  │
│  │  Server     │  │  Server       │  │  Server Actions           │  │
│  │  Components │  │  Components   │  │  (mutations / form posts) │  │
│  │  (public)   │  │  (dashboard)  │  │                           │  │
│  └──────┬──────┘  └──────┬────────┘  └───────────┬──────────────┘  │
│         │                │                        │                  │
│         └────────────────┴────────────────────────┘                 │
│                               │                                      │
│                    ┌──────────┴──────────┐                          │
│                    │  Supabase SSR Client │                          │
│                    │  (createServerClient)│                          │
│                    └──────────┬──────────┘                          │
└───────────────────────────────┼─────────────────────────────────────┘
                                │
┌───────────────────────────────┼─────────────────────────────────────┐
│                         Supabase                                     │
│  ┌─────────────┐  ┌──────────┴───────┐  ┌────────────────────────┐ │
│  │  Supabase   │  │  PostgreSQL       │  │  Storage               │ │
│  │  Auth       │  │  + RLS Policies   │  │  (if needed later)     │ │
│  │             │  │                   │  │                        │ │
│  │  auth.users │  │  tenants          │  │                        │ │
│  │  app_meta   │  │  revenue_reports  │  │                        │ │
│  │  (role)     │  │  faq_items        │  │                        │ │
│  └─────────────┘  └───────────────────┘  └────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|----------------|-------------------|
| `middleware.ts` | JWT validation, token refresh, role-based redirect (admin vs seller) | Supabase Auth, Next.js routing |
| Server Components (RSC) | Data fetching, page rendering, auth-gated layout | Supabase server client, child components |
| Client Components (CC) | Interactive UI (forms, charts, modals) | Server Actions, local state |
| Server Actions | Form submissions, mutations (create/update/delete tenant, submit revenue) | Supabase server client, revalidatePath |
| Route Handlers (`/api/*`) | Not needed for this project — Server Actions cover mutations | — |
| Supabase server client | Authenticated DB queries on the server, respects RLS | PostgreSQL + RLS |
| Supabase browser client | Client-side auth state, session listening | Supabase Auth |
| RLS Policies | Row-level gatekeeping — admin sees all, sellers see only their own | PostgreSQL, auth.jwt() |

---

## Recommended Project Structure

```
pceuropa/
├── app/
│   ├── (landing)/               # Public landing page (route group, no /landing/ in URL)
│   │   ├── page.tsx             # Landing page (from Figma design)
│   │   └── layout.tsx           # Landing layout (no dashboard nav)
│   │
│   ├── (dashboard)/             # Authenticated area (route group)
│   │   ├── layout.tsx           # Dashboard shell: sidebar nav, auth guard
│   │   ├── admin/               # Admin-only routes
│   │   │   ├── tenants/         # Tenant CRUD
│   │   │   │   ├── page.tsx     # Tenant list
│   │   │   │   ├── new/page.tsx # Create tenant form
│   │   │   │   └── [id]/page.tsx# Edit tenant
│   │   │   ├── revenue/         # Revenue overview (all tenants)
│   │   │   │   └── page.tsx
│   │   │   ├── analytics/       # Charts, trends
│   │   │   │   └── page.tsx
│   │   │   └── faq/             # FAQ management
│   │   │       └── page.tsx
│   │   └── seller/              # Seller-only routes
│   │       ├── revenue/         # Submit monthly revenue
│   │       │   └── page.tsx
│   │       └── faq/             # View FAQ
│   │           └── page.tsx
│   │
│   ├── auth/                    # Auth flows (outside route groups)
│   │   ├── login/page.tsx
│   │   └── callback/route.ts    # OAuth/magic link callback
│   │
│   └── layout.tsx               # Root layout
│
├── components/
│   ├── ui/                      # shadcn primitives (auto-generated)
│   ├── dashboard/               # Dashboard-specific shared components
│   │   ├── sidebar.tsx
│   │   ├── tenant-table.tsx
│   │   ├── revenue-chart.tsx
│   │   └── revenue-form.tsx
│   └── landing/                 # Landing page components (from Figma)
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts            # createBrowserClient (Client Components)
│   │   └── server.ts            # createServerClient (Server Components / Actions)
│   ├── auth/
│   │   └── get-role.ts          # Helper: extract role from JWT claims
│   └── utils.ts                 # cn(), formatters, etc.
│
├── actions/                     # Server Actions (mutations)
│   ├── tenants.ts               # createTenant, updateTenant, deleteTenant
│   ├── revenue.ts               # submitRevenue
│   └── faq.ts                   # createFaq, updateFaq, deleteFaq
│
├── types/
│   └── database.ts              # Generated Supabase types (supabase gen types)
│
└── middleware.ts                # JWT validation + role-based redirect
```

### Structure Rationale

- **`(landing)/` and `(dashboard)/` route groups:** Prevents URL pollution while allowing completely separate layouts. Landing uses no dashboard navigation; dashboard uses a sidebar. The parentheses keep "landing" and "dashboard" out of the URL path.
- **`admin/` and `seller/` sub-routes inside `(dashboard)/`:** Explicit separation of admin and seller pages. Middleware enforces access before the route even renders — no client-side role checks needed in components.
- **`lib/supabase/client.ts` and `server.ts`:** Supabase requires two distinct clients because the browser and server environments handle cookies differently. This split is the official Supabase recommendation for App Router.
- **`actions/`:** All mutations go through Server Actions instead of API routes. Simpler DX, automatic CSRF protection via Next.js, and co-locatable with form components.
- **`types/database.ts`:** Generated from the Supabase schema (`supabase gen types typescript --linked`). Ensures type safety across all DB queries without manual interface maintenance.

---

## Architectural Patterns

### Pattern 1: Middleware-First Auth Guard

**What:** `middleware.ts` runs on every request before any component renders. It calls `supabase.auth.getClaims()` to validate the JWT cryptographically, refreshes the token if expired, and redirects unauthenticated or wrong-role users before rendering.

**When to use:** Always — this is the security boundary. Never rely solely on component-level auth checks.

**Trade-offs:** Edge Runtime constraints (no Node.js APIs); keep middleware thin (validation only, no DB queries).

**Example:**
```typescript
// middleware.ts
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

  // IMPORTANT: use getClaims(), not getSession() — getClaims() validates JWT signature
  const { data: { claims } } = await supabase.auth.getClaims()

  const { pathname } = request.nextUrl

  // Redirect unauthenticated users trying to access dashboard
  if (!claims && pathname.startsWith('/admin') || pathname.startsWith('/seller')) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Redirect sellers trying to access admin routes
  const role = claims?.app_metadata?.role
  if (role === 'seller' && pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/seller/revenue', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

---

### Pattern 2: Role via app_metadata (NOT user_metadata)

**What:** User roles (`admin` / `seller`) are stored in `app_metadata`, which is server-only writeable — users cannot modify it via client SDKs. Roles are read in middleware, Server Components, and RLS policies via `auth.jwt() -> 'app_metadata' ->> 'role'`.

**When to use:** Any time you need role-based access control. This is the secure approach — `user_metadata` is writable by the end user and unsafe for authorization decisions.

**Trade-offs:** Roles are set server-side only (via Supabase Admin SDK or Dashboard). If role changes, user must re-login for new JWT claims (or you force a token refresh).

**Example — setting role at user creation (Server Action):**
```typescript
// actions/tenants.ts
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // service_role bypasses RLS
)

export async function createTenant(formData: FormData) {
  // 1. Create auth user
  const { data: { user } } = await supabaseAdmin.auth.admin.createUser({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    app_metadata: { role: 'seller' }, // role in app_metadata — secure
  })

  // 2. Insert tenant record linked to auth user
  await supabaseAdmin.from('tenants').insert({
    user_id: user!.id,
    store_name: formData.get('store_name'),
    // ... other fields
  })
}
```

**Example — RLS policy using app_metadata role:**
```sql
-- Admins see all tenants
CREATE POLICY "Admins read all tenants"
ON public.tenants FOR SELECT
TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- Sellers see only their own tenant record
CREATE POLICY "Sellers read own tenant"
ON public.tenants FOR SELECT
TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'seller'
  AND auth.uid() = user_id
);
```

---

### Pattern 3: Server Components for Data Fetching, Server Actions for Mutations

**What:** Pages and layouts are React Server Components that fetch data directly from Supabase using the server client. All mutations (create, update, delete) go through Server Actions — async functions marked `'use server'` that run on the server, never exposed as API endpoints.

**When to use:** Default approach for all pages. Only drop to Client Components when interactivity is needed (controlled forms, charts that need browser APIs, real-time updates).

**Trade-offs:** Server Components cannot use React hooks or browser APIs. Client Components cannot directly access server resources. The boundary requires careful prop passing.

**Example — Server Component fetching tenants:**
```typescript
// app/(dashboard)/admin/tenants/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function TenantsPage() {
  const supabase = await createClient()
  const { data: tenants } = await supabase
    .from('tenants')
    .select('*')
    .order('store_name')
  // RLS automatically filters based on role — admin gets all, seller gets own

  return <TenantTable tenants={tenants ?? []} />
}
```

**Example — Server Action for revenue submission:**
```typescript
// actions/revenue.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitRevenue(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  await supabase.from('revenue_reports').insert({
    user_id: user!.id,
    month: formData.get('month'),
    amount_eur: Number(formData.get('amount')),
  })

  revalidatePath('/seller/revenue')
}
```

---

## Data Flow

### Authentication Flow

```
User visits /admin/* or /seller/*
      ↓
middleware.ts (Edge)
  → createServerClient with cookie adapter
  → supabase.auth.getClaims() [validates JWT signature]
  → claims.app_metadata.role extracted
      ↓ (unauthenticated)        ↓ (authenticated, correct role)
redirect → /auth/login      Next.js renders Server Component
                                  ↓
                          createServerClient (server)
                          → Supabase query (RLS-enforced)
                                  ↓
                          Data returned to component
                          → Rendered HTML streamed to browser
```

### Revenue Submission Flow (Seller)

```
Seller fills form (Client Component)
      ↓
form action → submitRevenue() Server Action
      ↓
createClient() [server] → auth.getUser() → verify session
      ↓
INSERT into revenue_reports (user_id = seller's uid)
      ↓
RLS: "seller can only insert own records" policy enforced by Postgres
      ↓
revalidatePath('/seller/revenue') → Next.js cache invalidated
      ↓
Page re-renders with new data
```

### Admin Tenant Management Flow

```
Admin opens /admin/tenants → Server Component
      ↓
createClient() [server, service_role for writes OR anon+RLS for reads]
      ↓
SELECT * FROM tenants (RLS: admin policy → all rows returned)
      ↓
TenantTable rendered with full list
      ↓
Admin clicks "Create" → navigates to /admin/tenants/new
      ↓
Form submits → createTenant() Server Action
      ↓
supabaseAdmin (service_role) → auth.admin.createUser()
      ↓
Insert into tenants table
      ↓
revalidatePath('/admin/tenants') → redirect
```

### Key Data Flows Summary

1. **Read (any role):** Browser request → middleware JWT check → Server Component → Supabase query (RLS scopes by role) → rendered HTML
2. **Write (seller):** Form → Server Action → Supabase insert (RLS enforces own-data only) → cache revalidation
3. **Admin write (tenant management):** Server Action → Supabase Admin SDK with service_role key → bypasses RLS for privileged operations → cache revalidation
4. **Auth state in client:** Browser client subscribes to `onAuthStateChange` for session expiry handling; all auth decisions on server use `getClaims()` not `getSession()`

---

## Database Schema (Recommended)

```sql
-- Tenants (created by admin, one per seller account)
CREATE TABLE public.tenants (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  store_name  text NOT NULL,           -- Parduotuvė
  operator    text,                    -- Operatorius
  company_code text,                   -- Įm. kodas
  category    text,                    -- Kategorija
  space_m2    numeric,                 -- Patalpos m²
  rent_eur    numeric,                 -- Nuomos kaina EUR
  created_at  timestamptz DEFAULT now()
);

-- Monthly revenue reports (submitted by sellers)
CREATE TABLE public.revenue_reports (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id   uuid REFERENCES public.tenants(id),
  month       date NOT NULL,           -- First day of month (2025-01-01 = January)
  amount_eur  numeric NOT NULL,
  submitted_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, month)             -- One submission per tenant per month
);

-- FAQ entries (managed by admin)
CREATE TABLE public.faq_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question    text NOT NULL,
  answer      text NOT NULL,
  sort_order  integer DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);
```

---

## RLS Policy Summary

| Table | Policy | Who | Condition |
|-------|---------|-----|-----------|
| `tenants` | SELECT all | Admin | `app_metadata.role = 'admin'` |
| `tenants` | SELECT own | Seller | `app_metadata.role = 'seller' AND user_id = auth.uid()` |
| `tenants` | INSERT/UPDATE/DELETE | Admin | `app_metadata.role = 'admin'` (or service_role bypasses) |
| `revenue_reports` | SELECT all | Admin | `app_metadata.role = 'admin'` |
| `revenue_reports` | SELECT own | Seller | `user_id = auth.uid()` |
| `revenue_reports` | INSERT own | Seller | `user_id = auth.uid()` |
| `revenue_reports` | UPDATE own current month | Seller | `user_id = auth.uid() AND month = date_trunc('month', now())` |
| `faq_items` | SELECT | All authenticated | `true` |
| `faq_items` | INSERT/UPDATE/DELETE | Admin | `app_metadata.role = 'admin'` |

---

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-50 tenants (current scope) | Single Supabase project, free tier, no caching layer needed |
| 50-500 tenants | Add `select` column lists (avoid `SELECT *`), add indexes on `user_id` and `month` columns |
| 500+ tenants | Consider Supabase connection pooling (PgBouncer), cache analytics queries with `unstable_cache`, paginate tenant lists |

### Scaling Priorities

1. **First bottleneck:** Analytics queries (aggregating all revenue data). Fix: computed columns or materialized views for totals/monthly sums.
2. **Second bottleneck:** Tenant list rendering if list grows large. Fix: server-side pagination with cursor-based navigation.

---

## Anti-Patterns

### Anti-Pattern 1: Checking Roles in Client Components

**What people do:** `if (user.user_metadata.role === 'admin')` in a React component to show/hide admin UI.
**Why it's wrong:** Client-side role checks are bypassed by any user with browser dev tools. `user_metadata` is also writable by the user. This creates a false security boundary.
**Do this instead:** Enforce role access in middleware (redirects unauthenticated/wrong-role users) and via RLS (database enforces data access). Client-side role checks are only for UX (showing/hiding buttons), never for security.

---

### Anti-Pattern 2: Using getSession() on the Server

**What people do:** `const { data: { session } } = await supabase.auth.getSession()` in Server Components or middleware.
**Why it's wrong:** `getSession()` reads the token from the cookie without cryptographic verification. A tampered cookie could bypass auth checks.
**Do this instead:** Use `supabase.auth.getClaims()` on the server, which validates the JWT signature against Supabase's public keys. This is the official Supabase recommendation as of 2025.

---

### Anti-Pattern 3: Admin Operations with Anon Key

**What people do:** Use the anon Supabase client (with `NEXT_PUBLIC_SUPABASE_ANON_KEY`) for admin operations like creating users, bypassing RLS, or accessing all tenant data without writing RLS policies.
**Why it's wrong:** The anon key respects RLS policies. For privileged operations (user creation, admin reads without RLS), the service_role key is required. Service role key must NEVER be exposed to the browser — keep it server-side only.
**Do this instead:** Create a separate `supabaseAdmin` client using `SUPABASE_SERVICE_ROLE_KEY` in Server Actions only. Never import it in files that could be bundled client-side.

---

### Anti-Pattern 4: Single Supabase Client for Both Browser and Server

**What people do:** Create one Supabase client in a shared file and import it everywhere.
**Why it's wrong:** Browser and server handle cookies differently. The browser client uses `localStorage` or browser cookies. The server client must read cookies from the incoming request and write refreshed cookies to the response. Using the wrong client causes session loss, stale auth state, or hydration errors.
**Do this instead:** Maintain `lib/supabase/client.ts` (for Client Components) and `lib/supabase/server.ts` (for Server Components, Server Actions, Route Handlers) as separate files.

---

## Build Order (Dependencies Between Components)

```
Phase 1: Foundation (everything else depends on this)
  ├── Supabase project setup (auth config, tables, RLS policies)
  ├── lib/supabase/client.ts + server.ts
  ├── middleware.ts (auth guard + role redirect)
  └── types/database.ts (generated schema types)

Phase 2: Auth Shell
  ├── /auth/login page (email/password login form)
  ├── /auth/callback route handler
  └── (dashboard)/layout.tsx (sidebar shell + auth-aware nav)

Phase 3: Admin Core — Tenant Management
  ├── tenants table + RLS policies
  ├── /admin/tenants page (list) — read path
  ├── /admin/tenants/new page (create form) — write path
  ├── actions/tenants.ts (createTenant, updateTenant, deleteTenant)
  └── /admin/tenants/[id] page (edit form)

Phase 4: Seller Core — Revenue Submission
  ├── revenue_reports table + RLS policies
  ├── /seller/revenue page (submit form + past submissions)
  └── actions/revenue.ts (submitRevenue)

Phase 5: Admin Revenue Views
  ├── /admin/revenue page (all tenants, all months)
  └── /admin/analytics page (charts: totals, trends, per-tenant)
      Note: Depends on Phase 3 (tenant data) + Phase 4 (revenue data)

Phase 6: FAQ
  ├── faq_items table + RLS policies
  ├── /admin/faq page (create/edit/delete)
  ├── actions/faq.ts (createFaq, updateFaq, deleteFaq)
  └── /seller/faq page (read-only view)

Phase 7: Landing Page
  ├── (landing)/page.tsx (Figma design implementation)
  └── No Supabase dependency — purely presentational
      Note: Can be built in parallel with any phase above
```

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Supabase Auth | Server client via `@supabase/ssr` | Two clients: browser + server |
| Supabase DB (PostgreSQL) | Supabase JS client with RLS | service_role key for admin mutations |
| Vercel | Next.js deployment, Edge Runtime for middleware | Set env vars in Vercel dashboard |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Server Component ↔ Client Component | Props (serializable data only) | No functions, no class instances |
| Client Component ↔ Server Action | `action` prop or `startTransition` | CSRF protected by Next.js automatically |
| Middleware ↔ Server Component | Cookies (set by middleware, read by server client) | Must return `supabaseResponse` from middleware to propagate cookies |
| Admin mutations ↔ Supabase | service_role client (bypasses RLS) | Only in Server Actions, never client-exposed |

---

## Sources

- Supabase: Setting up Server-Side Auth for Next.js — https://supabase.com/docs/guides/auth/server-side/nextjs (HIGH confidence — official docs)
- Supabase: Custom Claims & RBAC — https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac (HIGH confidence — official docs)
- Supabase: Row Level Security — https://supabase.com/docs/guides/database/postgres/row-level-security (HIGH confidence — official docs)
- Supabase RLS references user_metadata (security warning) — https://supabase.github.io/splinter/0015_rls_references_user_metadata/ (HIGH confidence — official Supabase linter)
- MakerKit Next.js + Supabase Architecture — https://makerkit.dev/docs/next-supabase/architecture/architecture (MEDIUM confidence — established community resource)
- Next.js Project Structure — https://nextjs.org/docs/app/getting-started/project-structure (HIGH confidence — official docs)

---

*Architecture research for: PC EUROPA tenant management dashboard (Next.js App Router + Supabase)*
*Researched: 2026-02-25*
