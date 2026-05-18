# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server (Next.js 16)
pnpm build        # Production build
pnpm lint         # ESLint check
```

Regenerate Supabase types after any schema change:
```bash
npx supabase gen types typescript --linked > types/database.ts
```

## What This Is

PC EUROPA shopping center platform with two distinct parts:

1. **Marketing landing page** — `app/(marketing)/` — custom Figma design, Lithuanian public-facing site
2. **Tenant dashboard** — `app/(dashboard)/` — shadcn Nova preset, two roles: `admin` and `seller`

## Architecture

### Route Groups

- `app/(marketing)/` — public landing page, no auth
- `app/(dashboard)/admin/` — admin-only: tenants CRUD, analytics, FAQ management
- `app/(dashboard)/seller/` — seller-only: revenue submission, analytics, FAQ read
- `app/login/` — auth entry point
- `app/api/admin/impersonate/` — admin can sign in as a tenant (generates magic link)
- `app/auth/callback/` and `app/auth/impersonate/callback/` — Supabase OAuth callbacks

### Auth & Middleware

**`proxy.ts`** is the Next.js 16 middleware (exports `proxy`, not `middleware`). It handles JWT validation, role-based redirects, and session refresh. Always returns `supabaseResponse` (not `NextResponse.next()`) so refreshed cookies propagate.

**Defense-in-depth**: every admin Server Component independently calls `supabase.auth.getUser()` — middleware alone is not the auth guard (CVE-2025-29927: middleware can be bypassed with `x-middleware-subrequest` header).

Always use `getUser()`, never `getSession()` — `getUser()` validates the JWT against Supabase Auth server.

### Supabase Clients

- `lib/supabase/server.ts` — Server Components, Server Actions, Route Handlers
- `lib/supabase/admin.ts` — Admin operations only (uses `SUPABASE_SERVICE_ROLE_KEY`, server-side only)
- `lib/supabase/client.ts` — Client Components

### Roles

Stored in `user.app_metadata.role` — values are `'admin'` or `'seller'`. Sellers authenticate with `{username}@pceuropa.lt` email format (the domain suffix is defined in `lib/strings.ts` as `SELLER_USERNAME_DOMAIN`).

### UI Strings

All Lithuanian UI text lives in `lib/strings.ts`. Do not scatter string literals in components.

### Component Structure

- `components/ui/` — shadcn primitives
- `components/marketing/` — landing page sections (hero, nav, news, partner logos, etc.)
- `components/marketing/ui/` — marketing-specific primitives (`PillButton`, typography, arrow icon)
- `components/dashboard/` — dashboard shell (sidebar, header, impersonation banner)
- `components/analytics/`, `components/tenants/`, `components/faq/`, `components/revenue/` — feature components

### Fonts

Four fonts are loaded in `app/layout.tsx` and their CSS variables are applied to `<body>`:
- `--font-geist-sans`, `--font-geist-mono` — dashboard (Geist)
- `--font-jakarta` (Plus Jakarta Sans), `--font-montserrat` (Montserrat) — marketing

### Database

Migrations live in `supabase/migrations/`. Never edit applied migrations — always create new ones. Types are in `types/database.ts` (hand-maintained placeholder; regenerate from linked project when possible).

Key tables: `tenants`, `revenue_submissions`, `faq_entries`. RLS is on every table.

## Key Constraints

- All UI text must be Lithuanian — use constants from `lib/strings.ts`
- The `proxy.ts` export name must stay `proxy` — Next.js 16 renamed this from `middleware`
- `SUPABASE_SERVICE_ROLE_KEY` is server-only — never expose to client bundles
- React Compiler is enabled (`reactCompiler: true` in `next.config.ts`)
