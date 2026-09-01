---
tags: [architecture]
updated: 2026-09-01
---

# Environment Variables

## Rules

- Secrets are **server-only** — never `NEXT_PUBLIC_`.
- Never hardcode URLs or keys in source.
- `.env.example` must exist and stay in sync with the table below.
- Never log or print an env var value.
- The `.env*` files are edited by the project owner, not by agents — an agent
  states what to add; the owner adds it.

## Variables

| Name | Scope | Required | Purpose |
|------|-------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | client (build) | yes | Supabase origin. Also drives `STORAGE_PUBLIC_BASE`, the CSP host, and `images.remotePatterns` in `next.config.ts`. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client (build) | yes | Public API key. |
| `SUPABASE_SERVICE_ROLE_KEY` | server | yes | `lib/supabase/admin.ts` only — never reaches the client. |
| `MAINTENANCE_PASSWORD` | server | when the gate is on | Unlocks the coming-soon gate (`actions/site-lock.ts`). **Unset means nobody can unlock it** — the form rejects every password. |
| `MODERAN_API_TOKEN` | server | for turnover sync | `app/api/admin/moderan/sync-turnover/route.ts`. |
| `MODERAN_DOMAIN_ID` | server | for turnover sync | ditto |
| `MODERAN_PROPERTYSET_ID` | server | for turnover sync | ditto |
| `GOOGLE_GENERATIVE_AI_API_KEY` | server | for AI features | Read implicitly by `@ai-sdk/google` — grepping for `process.env.` will **not** find it. |
| `CLOUDFLARE_API_TOKEN` | server (Caddy) | yes on the VPS | DNS-01 ACME challenges. Needs `Zone → DNS → Edit`. |
| `NEXT_PUBLIC_ENABLE_REACT_GRAB` | client (build) | no | Dev-only overlay. |

`NEXT_PUBLIC_GA_MEASUREMENT_ID` appears in source but is unused — the GA id is a
constant in `lib/constants.ts`.

## Where they live

On the VPS (`/opt/pceuropa-app/`):

- **`.env`** — only `NEXT_PUBLIC_*`. Read by `docker compose` for build-arg
  interpolation and by `Dockerfile` at build time. Changing one **requires a rebuild**;
  the values are baked into the client bundle.
- **`.env.production`** — server-side secrets, mounted via `env_file`. A container
  recreate is enough (`docker compose up -d --force-recreate app`); no rebuild.

There is no single source of truth outside the running box. After the 2026-09-01
migration, `MODERAN_*`, `MAINTENANCE_PASSWORD`, and `GOOGLE_GENERATIVE_AI_API_KEY` were
all silently missing until someone tried the features. **Audit every `process.env.`
reference against the target environment before a cutover** — and remember SDKs that
read keys implicitly won't show up in that grep.

## Related

[[self-hosted-infrastructure]] · [[tech-stack]]
