---
tags: [meta, session-log]
updated: 2026-11-10
---

# Session log

Append-only record of **what each working session changed and where it left the
project**. Newest first. Keep entries short (3–6 lines). Notable user-facing or
architectural changes also go in [[changelog]] / [[decisions-log]]; the live
snapshot lives in [[status]].

Entry format:

```
## YYYY-MM-DD HH:MM — one-line summary
- **Changed:** files / areas touched and why
- **Status:** what works now, what is half-done
- **Next:** the first thing to do next session
```

## 2026-11-10 — vault initialised

- **Changed:** project brain scaffolded (vault, shims, hooks).
- **Status:** skeleton only — architecture notes and catalogs still empty.
- **Next:** fill [[status]] and the architecture notes from the real codebase.

## 2026-11-10 19:05 — parking rules PDF card + custom-page view link fix
- **Changed:** `parkavimas/page.tsx` + `messages/{lt,en}.json` (rules PDF card, URL from `STORAGE_PUBLIC_BASE`); `custom-page-card.tsx` + `lib/strings.ts` (`PUBLIC_SITE_ORIGIN`, so "view" opens pceuropa.lt, not the nuomininkai subdomain); `custom-page-form.tsx` slug hint now shows the full https://pceuropa.lt/puslapiai/{slug} URL, clickable once published; `proxy.ts` 308-redirects every storefront path on nuomininkai.pceuropa.lt to https://pceuropa.lt (dashboard/login/auth/api/assets stay). `PUBLIC_SITE_ORIGIN` lives in `lib/constants.ts`.
- **Status:** eslint + tsc pass; not checked in a browser — local `pnpm dev` 500s on every page (Next picks `~/package-lock.json` as workspace root, can't resolve tailwindcss). VPS disk at 95%.
- **Next:** commit + deploy, check /parkavimas on prod; fix `turbopack.root`; free VPS disk.
