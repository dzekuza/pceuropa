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

## Hosting

Self-hosted on a VPS (`176.223.138.9`, Ubuntu 24.04) since 2026-09-01 — **not Vercel, not Supabase Cloud**. See [[self-hosted-infrastructure]] for the full picture.

- `/opt/pceuropa-app` — this repo, plus `Dockerfile`, `docker-compose.yml`, `Caddyfile`. Caddy terminates TLS and reverse-proxies the app.
- `/opt/supabase-stack` — self-hosted Supabase (Postgres, GoTrue, PostgREST, Storage, imgproxy, Envoy gateway). Its data and uploaded files live in `volumes/`.
- Deploy = `rsync` the repo up, `docker compose build app`, `docker compose up -d --force-recreate app`. ~13 min on one vCPU.
- Server-side env lives in `/opt/pceuropa-app/.env.production`; build-time (`NEXT_PUBLIC_*`) in `.env`. Changing a `NEXT_PUBLIC_*` needs a rebuild, not just a restart.

## Non-obvious constraints

- **Never hardcode a Supabase URL.** Storage URLs come from `STORAGE_PUBLIC_BASE` (`lib/utils/supabase-image.ts`), derived from `NEXT_PUBLIC_SUPABASE_URL`. Content authored in the DB or in `messages/*.json` stores absolute URLs and can't interpolate env vars, so `toStorageUrl()` rewrites any legacy `*.supabase.co` origin at render time — call it for non-image links too (e.g. PDF hrefs).
- Any route outside `app/[locale]/` must be added to `isLocaleExempt` in `proxy.ts`, or next-intl rewrites it into the locale tree and it 404s. This bit `/under-construction` once.
- `docker-compose.yml` gives Caddy a `supabase.pceuropa.lt` network alias so SSR reaches Supabase over the Docker network instead of hairpinning out via the public IP.
- Caddy uses **DNS-01** ACME challenges (`acme_dns cloudflare`), and runs a custom image built from `Dockerfile.caddy` — the stock image lacks the Cloudflare DNS module. HTTP-01/TLS-ALPN would break if a hostname is ever put behind Cloudflare's proxy.
- Public Storage objects get `Cache-Control: public, max-age=31536000` from Caddy. storage-api serves `no-cache` regardless of the object's metadata, which made browsers re-download ~8.7 MB of images on every page view.
- `proxy.ts` exports `proxy`, not `middleware` — Next.js 16 rename. Do not change the export name. It also composes `next-intl`'s locale middleware for the marketing tree while running the existing auth/gate/subdomain logic unchanged on raw pathnames (dashboard/login/api routes are never locale-prefixed).
- Always `supabase.auth.getUser()`, never `getSession()` — validates JWT server-side (CVE-2025-29927).
- Every admin Server Component calls `getUser()` independently — middleware alone is not the auth guard.
- `lib/supabase/admin.ts` uses `SUPABASE_SERVICE_ROLE_KEY` — server-side only, never expose to client.
- React Compiler is enabled (`reactCompiler: true`) — avoid patterns that defeat memoization.
- Roles are in `user.app_metadata.role` (`'admin'` | `'seller'`). Sellers log in as `{username}@pceuropa.lt`.
- Migrations in `supabase/migrations/` — never edit applied migrations, always create new ones.
- `components/ui/` — shadcn primitives only. Check here before building anything from scratch.
