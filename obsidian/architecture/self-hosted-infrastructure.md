---
tags: [architecture, infrastructure, migration]
updated: 2026-09-01
---

# Self-Hosted Infrastructure

Everything moved off Vercel + Supabase Cloud onto one VPS on 2026-09-01. This note
covers the layout, the migration itself, and the traps found along the way.

Related: [[environment-variables]], [[system-overview]], [[tech-stack]]

## The box

| | |
|---|---|
| Host | `w6nl.l.dedikuoti.lt` — `176.223.138.9` |
| Provider | Interneto vizija (dedikuoti.lt), plan `Linux2_Backup_SSD` |
| Spec | 1 vCPU · 2 GB RAM · 25 GB SSD · 100 Mbps |
| OS | Ubuntu 24.04 |
| Access | SSH key only (`~/.ssh/pceuropa_vps_ed25519`), password auth disabled |
| Firewall | UFW — 22, 80, 443 only |
| Swap | 4 GB across two swapfiles; the box swaps hard during `next build` |

**The 1 vCPU is the main constraint.** A production build takes ~13 minutes and
saturates the core; the Docker build cache regrows ~2.4 GB each time, so run
`docker builder prune -af` after builds or the 25 GB disk fills.

## Layout

```
/opt/pceuropa-app     repo + Dockerfile, Dockerfile.caddy, docker-compose.yml, Caddyfile
                      .env            build-time NEXT_PUBLIC_* (compose interpolation)
                      .env.production server-side secrets (env_file)
/opt/supabase-stack   self-hosted Supabase (upstream docker/ tree)
                      volumes/db/data      Postgres data
                      volumes/storage      341 uploaded files
/opt/backups          nightly pg_dump, 7-day rotation (cron 03:00)
```

## Services

App and Caddy run as one compose project; Supabase as another.

- **Caddy** — TLS + reverse proxy for all hostnames. Custom image (`Dockerfile.caddy`)
  built with the Cloudflare DNS module so ACME can use DNS-01.
- **App** — Next.js standalone build, not published to the host; only Caddy reaches it.
- **Supabase** — 11 containers. `realtime` and `edge-functions` are unused by this app
  but left running; they cost ~40 MB combined, so trimming them isn't worth the
  dependency-graph surgery (the gateway `depends_on` studio being healthy).

### Hostnames

| Host | Serves |
|---|---|
| `pceuropa.lt` | 308 → `www` (www is canonical, matching the pre-migration setup) |
| `www.pceuropa.lt` | marketing site |
| `nuomininkai.pceuropa.lt` | dashboard — `proxy.ts` gates `/login` and dashboard routes on this exact prefix |
| `supabase.pceuropa.lt` | Supabase gateway (Envoy) |

## Migration record

Dumped from Supabase Cloud (`ybyyxcuvxuzrledbitky`) and restored. Row counts were
verified identical against production on both sides.

| | |
|---|---|
| `public` schema | 10 tables, 26 RLS policies, 2 functions |
| `auth.users` | 57 (55 seller accounts) |
| Storage | 2 buckets, 341 objects |

Passwords survived: GoTrue stores `$2a$` bcrypt hashes, which are portable between
instances. The JWT secret differs, so **every existing session was invalidated** —
users log in once more with unchanged passwords.

## Traps found (each cost real time)

1. **`auth.jwt()` missing.** The self-hosted Postgres image ships only `auth.uid()`,
   `auth.role()`, `auth.email()`. GoTrue creates `auth.jwt()` itself during its own
   migrations — pre-creating it as `supabase_admin` makes GoTrue fail with
   "must be owner of function jwt". Let GoTrue run first, or reassign ownership.
2. **`postgres` is not superuser here** — `supabase_admin` is. Data loads with
   `--disable-triggers` need the latter.
3. **Service schemas are built by their own services.** `storage.*` and the full
   `auth.users` column set only exist after those containers start against the new
   database. Restart them after wiping the DB volume, then load data.
4. **Version skew in `storage.objects`.** Cloud had `archived_at`, `is_delete_marker`,
   `is_versioned`, and `buckets.versioning_status`; the self-hosted storage-api didn't.
   Those columns had to be stripped from the dump.
5. **Absolute Supabase URLs are everywhere.** 44 hardcoded in source, 67 DB rows
   across 6 columns, plus 49 more in `tenants.gallery_images` — a `text[]`, which a
   scan filtered to `text`/`varchar`/`jsonb` silently misses. Cast **every** column to
   text when auditing. See `STORAGE_PUBLIC_BASE` / `toStorageUrl()`.
6. **Uploading via the Storage API drops cache metadata.** Objects landed with
   `Cache-Control: no-cache`, so browsers re-fetched ~8.7 MB per page view. Fixing
   `metadata.cacheControl` isn't enough — storage-api ignores it — so Caddy sets the
   header for `/storage/v1/{object,render/image}/public/*`.
7. **Let's Encrypt rate limits.** Caddy accumulated 5 failed validations per hostname
   while DNS still pointed at Vercel, then hit a 1-hour lockout at cutover — a brief
   TLS outage on `www` and `nuomininkai`. **Keep Caddy stopped until DNS points at the
   box**, or use DNS-01 from the start.

## DNS

Registrar **Telia** (`domains@telia.lt`); registry delegation still `ns1-4.teliahosting.lt`.
A Cloudflare zone exists in parity but is `pending` — delegation must be changed at the
registrar, **not** by adding NS records to the zone. Doing the latter caused a ~35 min
outage: resolvers followed the in-zone NS to a Cloudflare zone that was missing
`nuomininkai`, `supabase`, and `savitarna`, which then fell through to the wildcard.

`*.pceuropa.lt → 109.235.68.152` is the provider's shared host (it also runs mail).
The wildcard masks missing records — a missing subdomain resolves to the wrong server
instead of failing loudly.

If Cloudflare's proxy is ever enabled: SSL mode must be **Full (strict)**, and DKIM
CNAMEs (`s1`/`s2._domainkey`), `email`, and `emails` must stay DNS-only or mail breaks.

## Performance

A marketing page pulls **~116 images / 8.7 MB**. Supabase Cloud hid this behind
Cloudflare's edge; the VPS has no CDN. Browser caching is now correct, so repeat views
are fine, but first load is heavy. The real fix is app-side (lazy-load below-the-fold
images), not infrastructure.

## Known gaps

- Backups sit on the same disk as the database — no off-box copy.
- No CDN.
- `MODERAN_*` and `MAINTENANCE_PASSWORD` were missing after cutover and had to be added
  by hand; there is no single source of truth for env vars outside the running box.
