# Storage migration — Phase 4b notes

## Decision: local disk, not MinIO

**Local disk wins.** Total live storage is small — `marketing-assets` (63
files, 49 MB live) + `tenant-assets` (128 files, 67 MB live) = 191 objects,
~117 MB total per the pre-migration MANIFEST
(`~/backups/pceuropa/pre-migration-2026-08-02/MANIFEST.md`). That fits
trivially in the 25 GB disk with enormous headroom for years of growth at
this upload rate (a handful of tenant logos/gallery images and FAQ
attachments per admin action, not user-generated bulk uploads).

MinIO would cost real, non-refundable RAM on a 1.9 GB box: its server
process alone typically sits at 100–250 MB RSS at idle, before accounting
for its own internal caching and the extra Docker container overhead. That's
5–15% of total RAM spent permanently on a service whose entire value-add
(multi-node erasure coding, S3 API compatibility for external consumers,
lifecycle policies) is irrelevant here — nothing else talks S3 to this
project, and there's exactly one node. Running it would also add another
container to keep patched/monitored on a box that's already tight.

Local disk (via a Route Handler, not Next's static `public/` serving — see
below) needs no extra process, no extra RAM beyond what Next.js/sharp
already use per-request, and is trivially backed up with `rsync`/`tar` from
the volume-mounted directory. The only real cost is that it doesn't scale to
multi-node horizontal deployment without adding a shared filesystem or
object store later — not a concern for a single 1 vCPU VPS.

**Revisit this decision if**: the app moves to multi-instance deployment, or
total storage approaches a meaningful fraction of the 25 GB disk (it is
nowhere close today).

## Path convention

Files are **not** stored under `public/` — a volume mounted at build time
inside `public/uploads/` would need careful Docker-layer ordering to survive
image rebuilds, and reasoning about "does this path survive a redeploy" is
easier when the storage root is entirely outside the app's source tree.

- **Storage root**: `process.env.STORAGE_ROOT`, resolved in
  `lib/storage/local-storage.ts::getStorageRoot()`.
  - Local dev (unset): `<repo>/.data/uploads` (gitignored).
  - Production: set to a volume-mounted path outside the app directory, e.g.
    `/data/uploads`. **Phase 6's docker-compose should mount a named volume
    at exactly this path** and set `STORAGE_ROOT=/data/uploads` in the
    container's environment.
- **Layout**: `$STORAGE_ROOT/<bucket>/<key>`, where `bucket` is one of
  `marketing-assets`, `tenant-assets`, `faq-attachments` — carried over 1:1
  from the current Supabase Storage bucket names, and `key` is the same
  relative path Supabase Storage used (e.g. `logos/<uuid>.png`,
  `gallery/<uuid>.jpg`). This is deliberate: it's what lets
  `scripts/migrate-storage-to-local.sh` copy the backed-up objects straight
  across without any path rewriting.
- **Serving**: since files live outside `public/`, they aren't auto-served by
  Next's static file server. `app/api/storage/[bucket]/[...path]/route.ts`
  reads `$STORAGE_ROOT/<bucket>/<key>` and streams it back with the correct
  `Content-Type` and a long-lived immutable `Cache-Control` header. The same
  route accepts optional `width`/`height`/`quality`/`fit` query params and
  resizes on the fly with `sharp` — this is the replacement for Supabase's
  `render/image` transform endpoint.
- **Returned URLs**: `app/api/upload/route.ts` returns
  `{ url: "/api/storage/<bucket>/<key>" }` — a same-origin relative path, so
  no `next.config.ts` `images.remotePatterns` entry is needed for it (only
  needed for *foreign* origins).

## `resizeImage` — drop-in replacement for `resizeSupabaseImage`

`lib/storage/resize-image.ts` exports `resizeImage(url, { width, height,
quality, fit })` — **identical call signature** to the current
`resizeSupabaseImage` in `lib/utils/supabase-image.ts`. Phase 5 call sites
only need to swap the import (`resizeSupabaseImage` → `resizeImage`,
`@/lib/utils/supabase-image` → `@/lib/storage/resize-image`); no call-site
argument changes required.

Behavior parity:
- No-ops (returns the input unchanged) for any URL that isn't one of our own
  `/api/storage/...` URLs — same defensive behavior as the original (local
  assets, `blob:` previews mid-upload, other hosts pass through untouched).
- For matching URLs, appends `width`/`height`/`quality`/`fit` as query params
  onto the same `/api/storage/<bucket>/<key>` URL (rather than swapping to a
  separate `render/image` prefix, since one route now serves both raw and
  resized variants).

## Upload validation (`app/api/upload/route.ts`)

This used to live in Supabase Storage bucket policies; there's no Storage
layer providing it anymore, so it's now enforced server-side in the route
handler, sourced directly from the 6 current upload components' `accept`
lists / `MIME_TO_EXT` maps:

- **Allowed image types** (all buckets): `image/jpeg`, `image/png`,
  `image/webp`, `image/gif`, `image/avif` — the union of
  `components/admin/image-upload-field.tsx`'s `MIME_TO_EXT` map (the most
  permissive of the six) with the plain `accept="image/*"` inputs in
  `article-form.tsx`, `tenant-import-dialog.tsx`, `tenant-form-sheet.tsx`,
  and `promo-form.tsx`.
- **`faq-attachments` bucket only**: additionally allows `application/pdf`,
  matching `faq-form-dialog.tsx`'s `ACCEPTED` list (the only component that
  accepts non-image attachments).
- **Max size**: 10 MB, matching the explicit `MAX_SIZE` check already present
  in `faq-form-dialog.tsx` and `image-upload-field.tsx` (the only two
  components that enforce a limit client-side today; applied uniformly here
  since server-side validation is now the only enforcement point regardless
  of whether a given call site checked size client-side before).
- Object keys are generated server-side (`crypto.randomUUID()` + extension)
  from the validated MIME type, not trusted from the client, other than an
  optional `folder` segment (e.g. `logos`, `gallery`) which is validated
  against path traversal (`lib/storage/local-storage.ts::isSafeObjectKey`).

`components/tenants/tenant-import-dialog.tsx`'s `.csv`/`.xlsx`/`.xls` input
is parsed client-side with the `xlsx` package and never uploaded to Storage —
out of scope for this route.

## `next.config.ts` changes and why `connect-src` was NOT fully cleared

Per the task, the Supabase host was removed from `img-src` and from
`images.remotePatterns` — both existed solely to render Supabase Storage
object/render-image URLs, which are no longer produced once Phase 5/6 land.

**`connect-src`'s Supabase entries were deliberately left in place.** This
repo is still live on Supabase for Auth and Postgres/PostgREST access
(`lib/supabase/client.ts`, `lib/supabase/server.ts`) — unrelated to Storage
and out of scope for this storage-only phase. The browser's `supabase-js`
client still makes direct `fetch`/`WebSocket` calls to
`https://ybyyxcuvxuzrledbitky.supabase.co` for login, session refresh, and
every `.from(table).select()`/`.insert()` call from Client Components.
Removing `connect-src`'s Supabase entry now would break login and every
client-side data fetch on the live site — a regression far outside this
phase's scope ("do not touch Supabase"). That entry should be removed only
once a later phase migrates Auth/Postgres off Supabase entirely.

**Caveat on rollout timing**: `article.cover_image` and tenant
logo/gallery URLs in the live DB are *still* full Supabase Storage URLs
until Phase 6's DB cutover runs (`scripts/migrate-storage-to-local.sh` only
copies files; rewriting DB rows is explicitly a Phase 6 task, not done
here). Since `img-src` no longer allows the Supabase host, deploying this
`next.config.ts` change **before** Phase 6's DB cutover would break
rendering of existing Supabase-hosted images (CSP block) and
`next/image`'s `article.cover_image` usage in
`app/(marketing)/naujienos/[slug]/page.tsx` (no matching `remotePatterns`
entry). **Deploy this config change together with Phase 6's cutover, not
earlier.**

## What Phase 5/6 still need to do (not done here)

- Swap the 6 components' `supabase.storage.from(...).upload(...)` /
  `.getPublicUrl(...)` calls for `POST /api/upload` (`multipart/form-data`
  with `file`, `bucket`, optional `folder` fields) and use the returned
  `url` directly.
- Swap `resizeSupabaseImage` imports to `resizeImage` (Phase 5).
- Run `scripts/migrate-storage-to-local.sh` once, then rewrite existing DB
  rows' stored URLs from Supabase Storage URLs to `/api/storage/<bucket>/<key>`
  (Phase 6 cutover — not performed here, and not run against production by
  this phase).
- Add a docker-compose volume mount for `STORAGE_ROOT` (e.g. `/data/uploads`)
  so uploads persist across container recreation.
