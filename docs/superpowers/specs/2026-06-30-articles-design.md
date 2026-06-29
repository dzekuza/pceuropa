# Articles Feature Design

## Overview

Two deliverables:
1. Admin articles management page — write, edit, publish, and feature articles via a Tiptap WYSIWYG editor
2. Public `/naujienos` page — displays published articles fetched from Supabase; each article links to `/naujienos/[slug]`

---

## Database Schema

Table: `articles`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, `gen_random_uuid()` |
| `title` | `text NOT NULL` | |
| `slug` | `text NOT NULL UNIQUE` | Auto-generated from title on create, editable |
| `content` | `text NOT NULL DEFAULT ''` | Tiptap HTML output |
| `cover_image` | `text` | Supabase Storage URL, nullable |
| `category` | `text NOT NULL DEFAULT 'Naujiena'` | Enum: `'Naujiena'` \| `'Akcija'` \| `'Renginys'` |
| `featured` | `boolean NOT NULL DEFAULT false` | |
| `published` | `boolean NOT NULL DEFAULT false` | |
| `published_at` | `timestamptz` | Set to `now()` when `published` flips true for the first time |
| `created_at` | `timestamptz DEFAULT now()` | |
| `updated_at` | `timestamptz DEFAULT now()` | |

**RLS:**
- Public `SELECT`: `WHERE published = true`
- All mutations (INSERT, UPDATE, DELETE): admin service role only (via Server Actions using `lib/supabase/admin.ts`)

**Migration file:** `supabase/migrations/YYYYMMDDHHMMSS_create_articles_table.sql`

---

## Admin UI

### `/admin/articles` — List Page

Server Component with defense-in-depth auth check (`getUser()` + `role === 'admin'`).

- Page header: "Straipsniai" title + "Naujas straipsnis" button
- Table columns: cover thumbnail (40×40), title, category badge, featured toggle (star icon, optimistic), published toggle (switch, optimistic), created date, edit link, delete button
- Delete shows `AlertDialog` confirm before executing
- "Naujas straipsnis" added to `ADMIN_NAV_ITEMS` in `lib/strings.ts` with `Newspaper` icon, href `/admin/articles`

### `/admin/articles/new` and `/admin/articles/[id]/edit` — Editor Page

Full-page layout (no dialog). Server Component loads article by id for edit; new page starts empty.

**Layout:**
- Top bar: back chevron to `/admin/articles`, large title `<Input>`, "Išsaugoti juodraštį" + "Publikuoti" buttons
- Main area (2/3): Tiptap editor with toolbar — Bold, Italic, H2, H3, BulletList, OrderedList, Blockquote, Link, Image upload to Supabase Storage
- Right sidebar (1/3): Cover image upload (drag-and-drop), Category `<Select>`, Featured `<Checkbox>`, Slug `<Input>` (auto-filled, editable), Published status indicator

**Save logic:**
- "Išsaugoti juodraštį" → upserts with `published: false`
- "Publikuoti" → upserts with `published: true`; sets `published_at` to `now()` if not already set
- Both use a Server Action in `app/(dashboard)/admin/articles/actions.ts`
- Slug auto-generated client-side from title (Lithuanian-safe slugify: lowercase, replace spaces with `-`, strip diacritics)

---

## Public Pages

### `/naujienos` — Article List

Replaces current static `PROMO_ITEMS` implementation.

- Fetches `articles` WHERE `published = true` ORDER BY `published_at DESC`
- Featured section (top): articles WHERE `featured = true` — larger card, "Rekomenduojama" badge, max 3 shown
- Main grid: all published articles, 3-col desktop / 2-col tablet / 1-col mobile
- Article card: cover image, category badge, title, excerpt (first 120 chars of text stripped from HTML), formatted date
- Empty state: Lithuanian text ("Kol kas straipsnių nėra. Grįžkite netrukus.")
- Banner carousel stays unchanged (Puck CMS)

### `/naujienos/[slug]` — Article Detail

New dynamic route.

- Fetches single article by slug WHERE `published = true`
- 404 if not found or unpublished
- Layout: `Nav` + `Footer` (same as other marketing pages)
- Cover image full-width hero
- Title, category badge, date
- Content rendered via `dangerouslySetInnerHTML` — sanitized server-side with `isomorphic-dompurify` before render

---

## New Files

```
supabase/migrations/*_create_articles_table.sql
app/(dashboard)/admin/articles/page.tsx
app/(dashboard)/admin/articles/new/page.tsx
app/(dashboard)/admin/articles/[id]/edit/page.tsx
app/(dashboard)/admin/articles/actions.ts
app/(marketing)/naujienos/[slug]/page.tsx
components/articles/articles-table.tsx
components/articles/article-form.tsx          ← Tiptap editor + sidebar
components/articles/article-card.tsx
components/articles/articles-grid.tsx
components/articles/delete-article-dialog.tsx
```

## Modified Files

```
lib/strings.ts                  ← ADMIN_NAV_ITEMS + NAUJIENOS_STRINGS update + ARTICLES_STRINGS
types/database.ts               ← Article, ArticleInsert, ArticleUpdate types
app/(marketing)/naujienos/page.tsx  ← Replace static data with DB fetch
```

## Dependencies

- `@tiptap/react` + `@tiptap/starter-kit` + `@tiptap/extension-image` + `@tiptap/extension-link`
- `isomorphic-dompurify` (server-side HTML sanitization)
