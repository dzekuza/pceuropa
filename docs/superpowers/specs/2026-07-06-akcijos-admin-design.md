# Akcijos (Promos) Admin CRUD — Design

## Problem

`/akcijos` (public marketing page) renders promo cards from a hardcoded array in
`lib/promo-data.ts` (`PROMO_ITEMS`). There is no database table, no server actions, and no
admin UI — updating a promo means editing source and redeploying. Admins need to create/edit
akcijos from `/admin/articles`, the same way they already manage articles.

## Data model

New migration creates a `promos` table, modeled on `articles`:

```sql
create table public.promos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  image text,
  starts_at date not null,
  ends_at date not null,
  category text not null check (category in ('stores', 'services', 'food')),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS: public can read only published rows; admin mutations go through the
-- service-role client (actions/promos.ts), same pattern as articles.
alter table public.promos enable row level security;
create policy "Public can read published promos" on public.promos
  for select using (published = true);
```

Constraint: `ends_at >= starts_at` enforced in the zod schema (not a DB constraint, to match
how article validation lives in `lib/validations/`).

The migration also seeds the 10 existing `PROMO_ITEMS` rows (`published = true`) so the public
page shows the same content immediately after cutover, with no manual re-entry.

`slug` becomes the `/akcijos/[slug]` route segment — auto-generated from `title` on create,
same slugify behavior as `article-form.tsx`.

`image` reuses the existing Supabase Storage `marketing-assets` bucket and the
`compressImageFile` upload helper already used by `article-form.tsx`.

## Validation

`lib/validations/promo.ts`:

```ts
export const PROMO_CATEGORIES = ['stores', 'services', 'food'] as const
export type PromoCategory = (typeof PROMO_CATEGORIES)[number]

export const promoFormSchema = z.object({
  title: z.string().min(3, 'Pavadinimas per trumpas'),
  slug: z.string().min(3, 'Nuoroda per trumpa').regex(/^[a-z0-9-]+$/, '...'),
  image: z.string().nullable().default(null),
  starts_at: z.string(), // ISO date
  ends_at: z.string(),
  category: z.enum(PROMO_CATEGORIES),
  published: z.boolean().default(false),
}).refine((v) => v.ends_at >= v.starts_at, {
  message: 'Pabaigos data turi būti po pradžios datos',
  path: ['ends_at'],
})
```

## Server actions

`actions/promos.ts` (`'use server'`), mirroring `actions/articles.ts` exactly:

- `createPromo(values: PromoFormValues)`
- `updatePromo(id: string, values: PromoFormValues)`
- `deletePromo(id: string)`
- `togglePromoPublished(id: string, published: boolean)`

Each action re-checks `user.app_metadata?.role === 'admin'` via the existing admin-client
helper (defense-in-depth per CVE-2025-29927), then uses `createAdminClient()` (service role)
for the mutation. Calls `revalidatePath('/admin/articles')`, `revalidatePath('/akcijos')`, and
`revalidatePath('/akcijos/[slug]', 'page')` (or the specific slug on update/delete) afterward.

## Admin UI

`/admin/articles/page.tsx` gains a shadcn `Tabs` switcher: **"Straipsniai"** (current content,
unchanged) and **"Akcijos"** (new). Tab state is a URL search param (`?tab=akcijos`) so it's
linkable/bookmarkable, not local-only state.

New components under `components/promos/`, each a close port of its `components/articles/`
counterpart:

- `promo-form.tsx` — react-hook-form + `zodResolver(promoFormSchema)`. Fields: title, slug
  (auto-derived, editable), image upload, category `<Select>`, `starts_at`/`ends_at` date
  pickers (shadcn `Calendar` + `Popover`, consistent with any existing date-picker usage in the
  codebase), published switch. No rich-text body — promos have no long-form content today.
- `promo-columns.tsx` — image thumbnail, title, category badge, date range, published switch,
  actions (edit + delete dialog). No "featured" column (promos have no featured concept).
- `promos-table.tsx` — same DataGrid/TanStack Table wrapper as `articles-table.tsx`, row click
  navigates to edit.
- `delete-promo-dialog.tsx` — AlertDialog wrapping `deletePromo`.

New routes:
- `/admin/articles/akcijos/new` → `<PromoForm />` (create)
- `/admin/articles/akcijos/[id]/edit` → `<PromoForm promo={promo} />` (edit), 404 if missing

Both are thin Server Components with the same `getUser()` + role-check guard as the articles
routes.

## Public page changes

`app/(marketing)/akcijos/page.tsx` and `[slug]/page.tsx` switch from importing `PROMO_ITEMS` to
querying `promos` (`published = true`) via the standard Supabase server client.
`generateStaticParams` in `[slug]/page.tsx` queries slugs instead of mapping the static array.

The `date` display string (`"Nuo DD.MM.YYYY iki DD.MM.YYYY"`) is computed at render time from
`starts_at`/`ends_at` — a small formatter co-located with the public promo components, not a
stored column.

`components/marketing/promo-card.tsx`'s `PromoItem` type is updated to match the new shape
(`starts_at`/`ends_at` instead of a raw `date` string; `image` may be `null`). `AkcijosGrid`
and the `AkcijosGridBlock` Puck block are updated only insofar as their prop types change — the
filter/search copy fields stay Puck-editable as-is.

`lib/promo-data.ts` is deleted once the migration seed covers its content — it has no other
consumers.

## Strings

Add `ADMIN_PROMOS_STRINGS` to `lib/strings.ts`, mirroring the shape of `ARTICLES_STRINGS`
(page title, new/edit button labels, column headers, delete dialog copy, form field labels,
validation messages already covered by zod but display labels need translation).

## Out of scope

- Rich-text/long-form content on promo detail pages (matches current static behavior).
- Featured/highlighted promos (articles-only concept, not present in current promo data).
- Any change to the Puck-editable copy fields on `AkcijosGridBlock` beyond type updates.

## Follow-up after this change

- `npx supabase gen types typescript --linked > types/database.ts` after the migration is
  applied, per project convention.
