---
phase: 01-foundation
plan: 02
subsystem: auth
tags: [nextjs, supabase, ssr, shadcn, jwt, middleware, sidebar, lithuanian]

# Dependency graph
requires:
  - phase: 01-01
    provides: Supabase project linked, migration applied, admin user created, types/database.ts generated
provides:
  - Next.js app with shadcn Nova preset bootstrapped
  - Supabase browser and server clients (split pattern)
  - proxy.ts middleware with JWT validation, role redirect, session refresh
  - Login page with Lithuanian labels, admin email + seller username support
  - Dashboard shell with role-aware sidebar (AppSidebar + Header)
  - Admin home page with placeholder summary cards
  - Seller home page with placeholder message
  - Lithuanian string constants (AUTH_STRINGS, ADMIN_NAV_ITEMS, SELLER_NAV_ITEMS)
affects:
  - 02-tenants
  - 03-revenue
  - 04-analytics
  - all future phases (dashboard shell is the container for all feature UI)

# Tech tracking
tech-stack:
  added:
    - "@supabase/supabase-js"
    - "@supabase/ssr"
    - "shadcn/ui (Nova preset)"
    - "lucide-react"
    - "next 15 / react 19"
  patterns:
    - "Browser/server Supabase client split — client.ts for Client Components, server.ts for Server Components"
    - "proxy.ts (not middleware.ts) — Next.js 16 middleware filename"
    - "getUser() everywhere server-side — never getSession() (CVE-2025-29927 defense)"
    - "Defense-in-depth auth — proxy.ts + each page independently verifies getUser()"
    - "Role in app_metadata — sellers cannot self-escalate via user_metadata"
    - "Seller username-to-email mapping — append @pceuropa.lt before Supabase signInWithPassword"
    - "Lithuanian string constants in lib/strings.ts — single source of truth for all UI labels"

key-files:
  created:
    - "proxy.ts - JWT validation middleware, role redirect, session refresh, returns supabaseResponse"
    - "lib/supabase/client.ts - createBrowserClient wrapper for Client Components"
    - "lib/supabase/server.ts - createServerClient wrapper with cookie adapter for Server Components"
    - "lib/auth/get-role.ts - getRole() reads app_metadata.role via getUser()"
    - "lib/strings.ts - Lithuanian UI string constants (AUTH_STRINGS, ADMIN_NAV_ITEMS, SELLER_NAV_ITEMS)"
    - "actions/auth.ts - logout() Server Action"
    - "app/auth/callback/route.ts - OAuth code exchange route"
    - "app/auth/login/page.tsx - Login page with shadcn login-03, Lithuanian labels"
    - "app/(dashboard)/layout.tsx - Dashboard shell, role-aware sidebar, defense-in-depth getUser()"
    - "app/(dashboard)/admin/page.tsx - Admin home with placeholder summary cards"
    - "app/(dashboard)/seller/page.tsx - Seller home with placeholder message"
    - "components/dashboard/app-sidebar.tsx - Role-aware sidebar with navItems prop, lucide icons"
    - "components/dashboard/header.tsx - Breadcrumb + user dropdown with logout"
  modified: []

key-decisions:
  - "proxy.ts filename (not middleware.ts) — required for Next.js 16 compatibility"
  - "Seller username login — append @pceuropa.lt on client before calling signInWithPassword, keeping Supabase auth model clean"
  - "getUser() in every Server Component page — defense-in-depth, proxy.ts alone is insufficient per CVE-2025-29927"
  - "shadcn login-03 block as login page base — consistent with Nova preset, avoids custom form from scratch"

patterns-established:
  - "Pattern: lib/supabase/client.ts vs server.ts — never import server client in Client Components"
  - "Pattern: all Lithuanian strings in lib/strings.ts — never hardcode UI labels inline"
  - "Pattern: role check in every protected Server Component page — not just middleware"
  - "Pattern: supabaseResponse returned from proxy.ts — not NextResponse.next(), ensures cookie refresh propagates"

requirements-completed: [AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, SHLL-01, SHLL-02, SHLL-03, SHLL-04, SHLL-05]

# Metrics
duration: ~45min
completed: 2026-02-25
---

# Phase 1 Plan 02: Auth Flow and Dashboard Shell Summary

**Supabase SSR auth (proxy.ts middleware + login page) with role-aware shadcn Nova dashboard shell, all UI in Lithuanian, supporting admin email and seller username login**

## Performance

- **Duration:** ~45 min
- **Started:** 2026-02-25
- **Completed:** 2026-02-25
- **Tasks:** 3 (2 auto + 1 checkpoint)
- **Files modified:** 13

## Accomplishments
- Complete Supabase SSR authentication: login → JWT validation via proxy.ts → role-based redirect → session persistence
- Role-aware dashboard shell: admin sees Nuomininkai/Analitika/DUK/Nustatymai, seller sees Apyvarta/DUK
- Seller username login via client-side @pceuropa.lt domain append before signInWithPassword call
- Defense-in-depth pattern: proxy.ts + each page independently calls getUser() (CVE-2025-29927 mitigation)
- All visible UI strings in Lithuanian, stored in lib/strings.ts constants file

## Task Commits

Each task was committed atomically:

1. **Task 1: Bootstrap Next.js with shadcn Nova, install dependencies, create Supabase clients and auth utilities** - `4633d3a` (feat)
2. **Task 2: Build login page and dashboard shell with role-aware sidebar** - `2c68e8d` (feat)
3. **Task 3: Verify complete auth flow and dashboard shell** - checkpoint approved (human-verify)

## Files Created/Modified
- `proxy.ts` - JWT validation middleware, redirects by role, returns supabaseResponse (not NextResponse.next())
- `lib/supabase/client.ts` - createBrowserClient wrapper for Client Components only
- `lib/supabase/server.ts` - createServerClient with Next.js cookies() adapter for Server Components
- `lib/auth/get-role.ts` - getRole() reads app_metadata.role via getUser()
- `lib/strings.ts` - Lithuanian UI string constants: AUTH_STRINGS, ADMIN_NAV_ITEMS, SELLER_NAV_ITEMS, SELLER_USERNAME_DOMAIN
- `actions/auth.ts` - logout() Server Action, redirects to /login after signOut()
- `app/auth/callback/route.ts` - Supabase auth code exchange, redirects to /admin
- `app/auth/login/page.tsx` - Login page (login-03 block), handles email and username, Lithuanian labels
- `app/(dashboard)/layout.tsx` - Server Component shell, getUser() defense-in-depth, role-aware sidebar
- `app/(dashboard)/admin/page.tsx` - Admin home, verifies admin role, placeholder summary cards
- `app/(dashboard)/seller/page.tsx` - Seller home, verifies seller role, placeholder message
- `components/dashboard/app-sidebar.tsx` - navItems prop, lucide icons, active route state, PC EUROPA branding
- `components/dashboard/header.tsx` - Breadcrumb + user dropdown with Atsijungti logout action

## Decisions Made
- proxy.ts filename (not middleware.ts) — required for Next.js 16 compatibility
- Seller username login handled client-side: if identifier has no '@', append '@pceuropa.lt' before signInWithPassword call
- getUser() called in every protected Server Component page, not just proxy.ts — defense-in-depth per CVE-2025-29927
- shadcn login-03 block used as login page base for consistency with Nova preset

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None — all tasks completed cleanly per plan specification.

## User Setup Required

None - no new external service configuration required beyond what was set up in Plan 01-01.

## Next Phase Readiness

- Auth foundation complete: login, session, role routing, dashboard shell all working
- Phase 2 (tenants) can build directly into the dashboard shell — admin/page.tsx is the entry point
- Phase 3 (revenue) seller/page.tsx is the entry point for the submission form
- Blocker: First-login password change flow still undecided — admin sets seller passwords; decide before Phase 1 ships whether to include a `first_login` flag + change prompt in v1 or defer to v1.x

---
*Phase: 01-foundation*
*Completed: 2026-02-25*
