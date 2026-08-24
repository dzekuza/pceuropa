# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # dev server
pnpm build        # production build
pnpm lint         # ESLint
npx supabase gen types typescript --linked > types/database.ts  # after schema changes
```

No automated test suite exists in this repo (no test script in package.json).

`pnpm build`/`pnpm lint` may fail locally with `ERR_PNPM_IGNORED_BUILDS` (an interactive build-script approval gate). If so, run `npx next build` / `npx eslint .` directly instead — this is a local pnpm gate, not a real build/lint failure, and doesn't affect deploys.

## Architecture

Three parts: `app/[locale]/(marketing)/` (public storefront, bilingual LT/EN, Figma design), `app/(dashboard)/` (shadcn Nova, roles: `admin` | `seller`, Lithuanian-only), and shared API routes (`app/api/`, `app/actions/`).

### i18n (next-intl)

The storefront is bilingual; the dashboard is not (internal tooling stays Lithuanian-only).

- Routing: LT is the default locale, unprefixed at `/`; EN is prefixed at `/en/...` (`localePrefix: 'as-needed'` in `i18n/routing.ts`). Only `app/[locale]/(marketing)/*` is locale-routed — `(dashboard)`, `/login`, `/auth/*`, `/api/*` live outside `[locale]` and are never prefixed.
- Static UI strings live in `messages/lt.json` / `messages/en.json`, consumed via `getTranslations` (Server Components) / `useTranslations` (Client Components). `lib/strings.ts` is dashboard/admin-only now — storefront strings do not belong there.
- **Always import `Link` from `@/i18n/navigation`, never `next/link`, in any marketing component** — the locale-aware `Link` auto-prefixes hrefs so navigation stays on the current locale. Same for `useRouter`/`usePathname` if needed.
- `app/layout.tsx` keeps `<html lang="lt">` static (not server-resolved) to preserve static/ISR rendering across the dashboard and default-locale pages; `components/html-lang-sync.tsx` corrects `lang` client-side inside the `[locale]` tree.
- CMS content (`puck_pages.data`) is nested per locale as `{ lt: {...}, en: {...} }`, not flat — any direct query against this table must account for that shape (see `lib/page-content.ts` for the canonical read helpers). `page_sections` has a `locale` column instead.
- `getPuckBlockProps` / `getPuckBannerSlides` / `getPageContent` (in `lib/page-content.ts`) take an explicit `locale` argument (default `'lt'`) — every call site in a locale-aware page must pass the current locale explicitly, or it silently falls back to Lithuanian.
- Dynamic content tables (`articles`, `promos`, `tenants`, `faq_items`) have nullable `_en` sibling columns (`title_en`, `description_en`, etc.). Render pattern: `locale === 'en' ? (row.field_en || row.field) : row.field` — always fall back to the LT column when EN is empty, since admins may not have translated everything.
- Admin editors (tenant/article/promo/FAQ forms, the puck page-builder editor) have an LT/EN tab to manage translations per record. `/admin/translations` is a bulk review page for the DB-backed content.

## Non-obvious constraints

- `proxy.ts` exports `proxy`, not `middleware` — Next.js 16 rename. Do not change the export name. It also composes `next-intl`'s locale middleware for the marketing tree while running the existing auth/gate/subdomain logic unchanged on raw pathnames (dashboard/login/api routes are never locale-prefixed).
- Always `supabase.auth.getUser()`, never `getSession()` — validates JWT server-side (CVE-2025-29927).
- Every admin Server Component calls `getUser()` independently — middleware alone is not the auth guard.
- `lib/supabase/admin.ts` uses `SUPABASE_SERVICE_ROLE_KEY` — server-side only, never expose to client.
- React Compiler is enabled (`reactCompiler: true`) — avoid patterns that defeat memoization.
- Roles are in `user.app_metadata.role` (`'admin'` | `'seller'`). Sellers log in as `{username}@pceuropa.lt`.
- Migrations in `supabase/migrations/` — never edit applied migrations, always create new ones.
- `components/ui/` — shadcn primitives only. Check here before building anything from scratch.
