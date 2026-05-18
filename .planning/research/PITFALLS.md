# Pitfalls Research

**Domain:** Next.js + Supabase tenant management dashboard (admin/seller roles, RLS, revenue reporting)
**Researched:** 2026-02-25
**Confidence:** HIGH (primary findings verified against official Supabase docs and known CVEs)

---

## Critical Pitfalls

### Pitfall 1: RLS Disabled on New Tables (The Silent Data Exposure)

**What goes wrong:**
Every new Supabase table has RLS disabled by default. If you create a table via SQL editor or migration and forget `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`, every row is publicly readable and writable through the Supabase API. The anon key is enough to read all tenant revenue data, all tenant PII, everything.

In January 2025, 170+ production apps built with Lovable had exposed databases — 83% due to RLS misconfiguration. This is the most common and most catastrophic mistake in Supabase projects.

**Why it happens:**
Developers prototype quickly, create tables, test that data reads work — and it does work, without RLS, which is the problem. The happy path during dev confirms that nothing is wrong.

**How to avoid:**
- Enable RLS immediately when creating each table, before writing any application code that touches it
- Never ship a table without a `ENABLE ROW LEVEL SECURITY` statement in its migration
- Add a Supabase linter check (Dashboard > Database > Linter) before every deployment — it flags tables with RLS off
- For this project: `tenants`, `revenue_reports`, `faq_entries` must all have RLS enabled from day one

**Warning signs:**
- You can query a table from the browser console using the anon key and get back rows without being logged in
- Supabase dashboard shows a security warning in the Auth > Policies section for a table

**Phase to address:**
Database schema setup phase — RLS must be enabled on every table before any application code is written.

---

### Pitfall 2: RLS Enabled With No Policies (The Silent Empty Result)

**What goes wrong:**
You enable RLS on a table but forget to write policies. Now every query returns zero rows and no error. Your dashboard renders empty, your seller sees no data, and there is no error message — just silence. This is extraordinarily hard to debug because empty results are valid JSON.

**Why it happens:**
Developers enable RLS as a security step, then move on to building features. They assume "enabled = secure and working." The policy writing step is skipped or deferred.

**How to avoid:**
- Write at minimum a SELECT policy immediately after enabling RLS — before testing any queries
- Use a policy checklist per table: SELECT, INSERT, UPDATE, DELETE — deliberately decide each one
- For this project:
  - `tenants`: Admin can SELECT/INSERT/UPDATE/DELETE all; Seller can SELECT own row only
  - `revenue_reports`: Admin can SELECT all; Seller can SELECT/INSERT own reports only (no UPDATE/DELETE)
  - `faq_entries`: Admin full CRUD; Seller SELECT only

**Warning signs:**
- Queries return empty arrays when you expect data, with no error
- The Supabase Dashboard > Table Editor shows data but your app shows none
- SQL Editor shows rows but client SDK returns empty

**Phase to address:**
Database schema setup phase, alongside RLS enabling. Policy writing is not optional or deferrable.

---

### Pitfall 3: Testing RLS in SQL Editor (Superuser Bypass)

**What goes wrong:**
The Supabase SQL Editor runs as the `postgres` superuser, which bypasses all RLS policies entirely. You write a policy, test your query in the SQL editor, see the correct rows, and assume your policy works. In production, users see nothing (or everything).

**Why it happens:**
The SQL editor is the natural place to test database queries during development. There is no obvious warning that you are bypassing RLS.

**How to avoid:**
- Test RLS policies exclusively through the Supabase client SDK with actual authenticated users
- Use the RLS policy simulator in Supabase Dashboard (Auth > Policies > Simulate) to test policies with specific user UUIDs
- Create two test accounts (one Admin, one Seller) and verify each can only see what they should

**Warning signs:**
- You have never logged in as a Seller user and checked what data comes back
- All your RLS testing has been done in the Supabase dashboard or SQL editor

**Phase to address:**
Database schema setup phase, and again at the auth/roles integration phase. RLS validation requires real authenticated sessions.

---

### Pitfall 4: Using `getSession()` Instead of `getUser()` in Server Code

**What goes wrong:**
`supabase.auth.getSession()` reads the session directly from the cookie without revalidating it with the Supabase Auth server. A manipulated or forged cookie can fool `getSession()`. An attacker can craft a JWT that passes format and expiry checks and impersonate another user — including an admin — on the server side.

This is a documented security vulnerability (discussed in Supabase auth-js issue #898 and the official SSR auth guide).

**Why it happens:**
`getSession()` is faster (no network call). Tutorials written before 2024 often use `getSession()` for server-side auth checks. Copying old examples or official docs that haven't been updated leads directly to this mistake.

**How to avoid:**
- In middleware and all server components/route handlers: use `supabase.auth.getUser()` exclusively
- `getSession()` is only safe on the client side where the local session is sufficient
- The official Supabase SSR guide for Next.js (2025) explicitly states: "Never trust `getSession()` inside server code"
- For this project: the admin middleware that gates the entire `/dashboard/admin/*` subtree must use `getUser()`

**Warning signs:**
- Any server-side auth check using `const { data: { session } } = await supabase.auth.getSession()`
- Middleware that checks `session?.user` instead of calling `getUser()`

**Phase to address:**
Auth and middleware setup phase — this must be in place before any protected routes are created.

---

### Pitfall 5: Storing Role in `user_metadata` Instead of `app_metadata`

**What goes wrong:**
`user_metadata` can be modified by the authenticated user themselves via the client SDK (`supabase.auth.updateUser()`). If you store `role: "admin"` in `user_metadata`, any seller can call `updateUser({ data: { role: "admin" } })` and escalate their own privileges. Your RLS policies that read `auth.jwt() -> 'user_metadata' -> 'role'` are now completely bypassed.

**Why it happens:**
`user_metadata` is easier to update and most tutorials demonstrate it for storing user preferences. Developers conflate "user data" with "role data."

**How to avoid:**
- Store role in `app_metadata` (not `user_metadata`) — this field requires admin/service_role to modify
- Or store role in a separate `profiles` table with strict RLS (Seller cannot UPDATE their own role column)
- For RLS policies that reference role: use `auth.jwt() -> 'app_metadata' -> 'role'` or join to the profiles table
- To set `app_metadata`, use the service role key server-side: `supabase.auth.admin.updateUserById(userId, { app_metadata: { role: 'admin' } })`

**Warning signs:**
- Role stored via `supabase.auth.updateUser({ data: { role: '...' } })` from the client
- RLS policies referencing `auth.jwt() -> 'user_metadata'` for security-critical checks

**Phase to address:**
Auth and roles setup phase — the role assignment mechanism must be correct before any RLS policies are written.

---

### Pitfall 6: Exposing the Service Role Key (`SUPABASE_SERVICE_ROLE_KEY`) to the Client

**What goes wrong:**
The service role key bypasses all RLS entirely. If it is exposed to the browser — via a `NEXT_PUBLIC_` prefixed environment variable or bundled into client code — any user can make requests that bypass all security policies, read all tenant data, modify anything, and delete anything.

**Why it happens:**
Developers need the service role key for admin operations (creating users, setting `app_metadata`). They create a Supabase client with it and forget to check where that client is instantiated.

**How to avoid:**
- Never prefix the service role key with `NEXT_PUBLIC_` — it will be embedded in the JavaScript bundle
- The service role client must only be instantiated in: Next.js Route Handlers (`app/api/`), Server Actions, and Supabase Edge Functions
- Use two separate client factory functions: `createClient()` for user-context operations (uses anon key + user cookie), `createAdminClient()` for admin operations (uses service role, no session, `persistSession: false`)
- Audit: `grep -r "SERVICE_ROLE" .env* --include="*.js" --include="*.ts"` — the key must never appear in any file that is not `.env.local` or a server-only module

**Warning signs:**
- `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` appears anywhere in your codebase
- The service role client is created inside a component file or a file without `"use server"`
- Network tab in browser DevTools shows requests with full-bypass responses

**Phase to address:**
Auth and roles setup phase — the two-client pattern must be established before any admin user management features are built.

---

### Pitfall 7: Admin Creates Users Directly from the Client (Auth Admin API Misuse)

**What goes wrong:**
`supabase.auth.admin.createUser()` and `supabase.auth.admin.updateUserById()` are admin-only Auth API methods that require the service role key. If called from a client component or a poorly structured server action that leaks the service role key, you expose the key. Separately, creating users via `createUser()` with `email_confirm: true` skips the email flow entirely — which is intentional for admin-provisioned accounts in this project, but can cause issues if the pattern is mixed with invite flows.

**Why it happens:**
The admin CRUD requirement for this project (Admin creates tenant accounts with username/password) requires server-side user creation. Developers sometimes implement this client-side for simplicity.

**How to avoid:**
- All user creation must go through a Next.js Route Handler (e.g., `POST /api/admin/users`) or Server Action with `"use server"` directive
- The route handler uses the admin Supabase client (service role) exclusively
- Protect the route itself with an admin role check before executing any user management operations — an unauthenticated request to `/api/admin/users` must return 401

**Warning signs:**
- Any component file imports or calls `supabase.auth.admin.*`
- The admin user creation endpoint has no role check before executing

**Phase to address:**
Admin user management feature phase — establish the server action pattern before building the tenant CRUD UI.

---

### Pitfall 8: Missing `ON DELETE CASCADE` Between `profiles` and `auth.users`

**What goes wrong:**
If your `profiles` or `tenants` table has a foreign key to `auth.users(id)` without `ON DELETE CASCADE`, deleting a user via Supabase Auth Admin API fails with a foreign key constraint violation. The user gets stuck — they exist in `auth.users` but your application treats them as deleted. Alternatively, orphaned rows accumulate in your `profiles` table for users that no longer exist in auth.

**Why it happens:**
Developers create the foreign key but omit the cascade option, or the Supabase table editor creates the FK without cascade by default. The mistake is invisible until a delete operation is attempted.

**How to avoid:**
```sql
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'seller',
  -- other columns
);
```
- Always specify `ON DELETE CASCADE` for any table that references `auth.users(id)`
- Test user deletion during schema setup, not after building the full admin UI

**Warning signs:**
- Admin attempts to delete a tenant and gets a 500 error or Supabase dashboard error
- The `profiles` table has rows where `id` no longer exists in `auth.users`

**Phase to address:**
Database schema setup phase — correct the cascade behavior in the migration, before any user management UI is built.

---

### Pitfall 9: JWT Role Claims Not Updating After Role Change

**What goes wrong:**
If role is stored in JWT claims (`app_metadata`), the claim is embedded in the JWT at login time. If an admin changes a seller's role, the seller's current session still has the old role in their JWT. They retain (or lose) access until they log out and log back in — which may be hours later.

**Why it happens:**
Developers correctly store role in `app_metadata` for RLS but don't account for JWT TTL (default 1 hour in Supabase). Role change is applied to the database but the in-flight JWT is not invalidated.

**How to avoid:**
- For this project's scale (small number of tenants, admin-managed), the acceptable solution is: after admin changes a role, the seller is logged out programmatically via `supabase.auth.admin.signOut(userId, 'others')` to force session invalidation
- Alternatively, store role in the `profiles` table and read it via a database join in RLS policies (not JWT) — this is more reliable for role changes but requires an additional SELECT in every RLS policy (which needs indexing)
- Document the behavior: "Role changes take effect on next login" if session invalidation is not implemented

**Warning signs:**
- A seller whose role was changed can still access admin routes until their JWT expires
- No mechanism exists to force logout after role changes

**Phase to address:**
Auth and roles setup phase — decide the role storage strategy (JWT claims vs. database join) before writing RLS policies.

---

### Pitfall 10: Next.js Middleware as the Only Auth Guard (CVE-2025-29927)

**What goes wrong:**
CVE-2025-29927 (disclosed 2025) demonstrated that Next.js middleware can be bypassed by setting the `x-middleware-subrequest` header. If middleware is your only layer of route protection, an attacker can bypass it and access protected pages directly.

Beyond the CVE: Next.js middleware runs at the edge and is a good first line of defense, but it cannot be the only guard. Server components and route handlers must independently verify authentication.

**Why it happens:**
Middleware-only protection feels sufficient — it runs before every request, so why check again in the page? This is a common architectural shortcut in tutorial-style apps.

**How to avoid:**
- Defense in depth: middleware redirects unauthenticated users (fast, UX-focused), but every server component that renders sensitive data calls `getUser()` and checks role independently
- Every admin API Route Handler checks for admin role before executing — do not trust that middleware already filtered unauthorized requests
- For this project: `app/(dashboard)/admin/` pages must verify admin role in the page's server component, not just in middleware

**Warning signs:**
- Server components inside protected routes do not call `getUser()` — they assume the user is authenticated because middleware passed them through
- Route handlers have no role check: `if (user.role !== 'admin') return 401`

**Phase to address:**
Auth and middleware setup phase — establish the layered auth pattern from the start.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skip `ON DELETE CASCADE` on profiles FK | Simpler migration | Admin delete breaks with FK constraint error | Never — add cascade from day one |
| Use `getSession()` server-side for speed | Fewer network calls | Security vulnerability — session can be forged | Never in server code |
| Store role in `user_metadata` | Easier to update | Any user can self-escalate privileges | Never for security-sensitive roles |
| Single Supabase client for both user and admin ops | Less code | Service role key used in user context, or user JWT leaks into admin context | Never |
| No RLS on FAQ table ("it's public anyway") | Less policy code | Admin writes are unprotected — seller can create/edit FAQ | Only if table is genuinely public read-only with no writes from users |
| Inline role check logic in components | Faster to build | Logic drift — one component gets updated, others don't | Never — centralize role checks |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Supabase Auth + Next.js SSR | Using `@supabase/auth-helpers-nextjs` (deprecated) | Use `@supabase/ssr` package — the current SSR package as of 2024+ |
| Supabase + Next.js middleware | Cookie refresh not handled in middleware | Follow official SSR guide: middleware must call `supabase.auth.getUser()` which refreshes cookies via the SSR client's cookie setter |
| Supabase Admin API + Server Actions | Admin client created without `persistSession: false` | `createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })` |
| Vercel deployment + Supabase env vars | Wrong variable names (`PUBLIC_SUPABASE_URL` instead of `NEXT_PUBLIC_SUPABASE_URL`) | Use exactly `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`; service role key must NOT be `NEXT_PUBLIC_` |
| shadcn components + Server Components | Placing interactive shadcn components (Dialog, DropdownMenu) in Server Components | Components with `useState`/event handlers must be in `"use client"` files — wrap in a client component |
| Supabase Auth + Next.js Link prefetching | Prefetch requests fire before auth cookies are set after login | Redirect post-login to a simple page with no `<Link>` prefetching; let cookies settle |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| No index on `user_id` column referenced in RLS policies | Queries slow as tenant count grows; sequential table scans | `CREATE INDEX ON revenue_reports(user_id);` — index every column used in RLS `USING` clauses | Noticeable at ~1,000+ revenue report rows |
| No index on `tenant_id` in revenue_reports | Admin "all revenue" queries do full table scans | `CREATE INDEX ON revenue_reports(tenant_id, month);` | ~500+ rows |
| Fetching all revenue history for analytics on every render | Admin analytics page slow to load | Use server-side aggregation SQL (`SUM`, `GROUP BY month`) — never pull raw rows to the client for charting | Any scale |
| N+1 queries in tenant list with revenue | Rendering each tenant row triggers a separate revenue query | Join or use a Postgres view that pre-aggregates per-tenant revenue | 20+ tenants |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` in env | Full database bypass exposed in browser JS bundle | Never prefix service role key with `NEXT_PUBLIC_`; audit with `grep` before deployment |
| RLS policy reads `auth.jwt() -> 'user_metadata' -> 'role'` | Any user can set their own role via `updateUser()` | Use `app_metadata` or profiles table with restricted UPDATE policy |
| Seller can UPDATE their own `profiles` row freely | Seller modifies their company code, rent price, category | RLS UPDATE policy on profiles: sellers can only update columns that are not admin-managed (if any) |
| Admin route handler has no server-side role check | Seller calls `/api/admin/users` directly, bypassing middleware | Every Route Handler checks `user.app_metadata.role === 'admin'` before executing |
| Revenue report allows INSERT for any month, no uniqueness | Seller submits same month twice, data is corrupted | `UNIQUE(seller_id, year, month)` constraint on `revenue_reports` table |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No unique constraint on monthly revenue + no UI guard | Seller submits January revenue twice; both rows saved; admin sees double | DB: `UNIQUE(seller_id, year, month)`; UI: check if report exists before showing submit form; show existing submission with edit option |
| Lithuanian UI but form validation errors in English | Sellers confused by English error messages | All `zod` schema messages and form error strings must be in Lithuanian from day one |
| Admin creates tenant with temporary password but no forced change | Sellers log in with admin-set password and never change it | On first login detection (custom `first_login` flag in profiles), prompt for password change |
| Analytics page has no loading state for slow DB queries | Admin sees blank charts with no indication of loading | Wrap each chart section in `<Suspense>` with a skeleton fallback |
| No confirmation on admin delete tenant | Fat-finger delete removes a tenant and all their revenue history | Confirmation dialog (shadcn AlertDialog) required before any destructive action |

---

## "Looks Done But Isn't" Checklist

- [ ] **RLS enabled:** Every table shows green in Supabase Dashboard > Database > Linter — not just the ones you remember
- [ ] **Seller data isolation:** Log in as a Seller and confirm you cannot read another seller's revenue reports via the API (test with Supabase JS client in browser console)
- [ ] **Admin escalation prevention:** Call `supabase.auth.updateUser({ data: { role: 'admin' } })` as a Seller — confirm it does not grant admin access
- [ ] **Service role key isolation:** `grep -r "SUPABASE_SERVICE_ROLE_KEY" --include="*.tsx" --include="*.ts"` — key must only appear in server-only files
- [ ] **Duplicate revenue report prevention:** Submit revenue for the same month twice as a Seller — confirm the second submission fails with a clear error
- [ ] **Admin route protection:** Call a protected admin API endpoint without being logged in — confirm 401, not 500 or data
- [ ] **Cascade delete:** Delete a test user via Admin dashboard — confirm their profile row and revenue reports are also deleted (no orphaned rows)
- [ ] **Role change takes effect:** Change a Seller's role — confirm their current session is invalidated and they cannot access seller-only routes after the change

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| RLS not enabled, data exposed in production | HIGH | Enable RLS immediately; audit Supabase logs for unauthorized access; notify affected tenants per GDPR obligations |
| Wrong role storage (user_metadata) already in production | MEDIUM | Write a migration to copy roles to app_metadata via service role; update all RLS policies; force all users to re-login |
| Service role key leaked via NEXT_PUBLIC | HIGH | Rotate the key immediately in Supabase Dashboard > Project Settings > API; update all environment variables in Vercel; redeploy |
| Orphaned profiles rows (missing cascade) | LOW | Retroactively add cascade constraint via migration; clean up orphaned rows with a one-time SQL script |
| Duplicate revenue reports in database | MEDIUM | Add UNIQUE constraint (will fail if duplicates exist); deduplicate by keeping latest INSERT per (seller_id, year, month); then add constraint |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| RLS disabled on new tables | Database schema setup | Supabase Linter: all tables pass security checks |
| RLS enabled without policies | Database schema setup | Query each table as anon/seller/admin — confirm correct visibility |
| Testing RLS with SQL editor (superuser bypass) | Database schema setup | All RLS tests done via JS client with real sessions |
| `getSession()` used server-side | Auth and middleware setup | `grep -r "getSession" app/` — zero results in server components and middleware |
| Role in `user_metadata` | Auth and roles setup | Seller cannot self-escalate via `updateUser()` |
| Service role key exposed to client | Auth and roles setup | `grep -r "SERVICE_ROLE" --include="*.tsx"` returns no results |
| Admin API calls from client | Admin user management feature | Network tab shows admin user ops hitting `/api/admin/` Route Handlers |
| Missing `ON DELETE CASCADE` | Database schema setup | Delete test user — no FK constraint error; profiles row gone |
| JWT claims stale after role change | Auth and roles setup | Change role; old session is invalidated; new session has correct role |
| Middleware as only auth guard | Auth and middleware setup | Bypass middleware with `x-middleware-subrequest` header — server component still rejects unauthorized access |
| Duplicate revenue submissions | Revenue reporting feature | Submit same month twice — second fails with unique constraint error |

---

## Sources

- [Supabase Row Level Security Docs](https://supabase.com/docs/guides/database/postgres/row-level-security) — HIGH confidence
- [Supabase RLS Performance and Best Practices](https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv) — HIGH confidence
- [Setting up Server-Side Auth for Next.js | Supabase Docs](https://supabase.com/docs/guides/auth/server-side/nextjs) — HIGH confidence (getUser vs getSession guidance)
- [Custom Claims & RBAC | Supabase Docs](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac) — HIGH confidence
- [Supabase Auth Admin API | createUser](https://supabase.com/docs/reference/javascript/auth-admin-createuser) — HIGH confidence
- [Hardening the Data API | Supabase Docs](https://supabase.com/docs/guides/database/hardening-data-api) — HIGH confidence
- [CVE-2025-29927: Next.js Middleware Authorization Bypass](https://projectdiscovery.io/blog/nextjs-middleware-authorization-bypass) — HIGH confidence (public CVE)
- [Common mistakes with the Next.js App Router | Vercel Blog](https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them) — HIGH confidence (official Vercel)
- [Supabase User Management | Managing User Data](https://supabase.com/docs/guides/auth/managing-user-data) — HIGH confidence
- [DesignRevision: Supabase RLS Complete Guide 2026](https://designrevision.com/blog/supabase-row-level-security) — MEDIUM confidence (community)
- [Supabase auth-js issue #898: getSession security risk](https://github.com/supabase/auth-js/issues/898) — HIGH confidence (official repo)
- [Supabase Discussion #28983: getUser() vs getSession() performance and security](https://github.com/orgs/supabase/discussions/28983) — HIGH confidence (official repo discussion)
- [Leanware: Best Practices for Supabase](https://www.leanware.co/insights/supabase-best-practices) — MEDIUM confidence (community, verified against official docs)

---

*Pitfalls research for: Next.js + Supabase tenant management dashboard (PC EUROPA)*
*Researched: 2026-02-25*
