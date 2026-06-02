# CLAUDE.md

## Commands

```bash
pnpm dev          # dev server
pnpm build        # production build
pnpm lint         # ESLint
npx supabase gen types typescript --linked > types/database.ts  # after schema changes
```

## Architecture

Two parts: `app/(marketing)/` (public, Lithuanian, Figma design) and `app/(dashboard)/` (shadcn Nova, roles: `admin` | `seller`).

## Non-obvious constraints

- `proxy.ts` exports `proxy`, not `middleware` — Next.js 16 rename. Do not change the export name.
- Always `supabase.auth.getUser()`, never `getSession()` — validates JWT server-side (CVE-2025-29927).
- Every admin Server Component calls `getUser()` independently — middleware alone is not the auth guard.
- `lib/supabase/admin.ts` uses `SUPABASE_SERVICE_ROLE_KEY` — server-side only, never expose to client.
- All Lithuanian UI strings live in `lib/strings.ts` — never scatter literals in components.
- React Compiler is enabled (`reactCompiler: true`) — avoid patterns that defeat memoization.
- Roles are in `user.app_metadata.role` (`'admin'` | `'seller'`). Sellers log in as `{username}@pceuropa.lt`.
- Migrations in `supabase/migrations/` — never edit applied migrations, always create new ones.
- `components/ui/` — shadcn primitives only. Check here before building anything from scratch.
