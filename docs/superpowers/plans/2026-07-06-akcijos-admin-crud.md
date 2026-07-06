# Akcijos (Promos) Admin CRUD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let admins create, edit, publish, and delete "akcijos" (promo) entries from `/admin/articles`, replacing the hardcoded `PROMO_ITEMS` array with a real `promos` Supabase table.

**Architecture:** A new `promos` table + `actions/promos.ts` server actions, mirroring the existing `articles`/`actions/articles.ts` pattern exactly (same admin-role-check-then-service-role-client shape, same RLS policy shape). Admin UI adds a shadcn `Tabs` switcher to the existing `/admin/articles` page ("Straipsniai" / "Akcijos"), each tab showing its own DataGrid table with New/Edit/Delete. The public `/akcijos` and `/akcijos/[slug]` pages switch from importing the static array to querying the DB.

**Tech Stack:** Next.js 15 App Router, TypeScript, Supabase (Postgres + `@supabase/ssr`), react-hook-form + zod, TanStack Table + `components/reui/data-grid/*`, shadcn/ui (`new-york` style, Radix via the consolidated `radix-ui` package).

## Global Constraints

- TypeScript strict mode, no `any` — use `unknown` for dynamic types.
- Every admin Server Component independently calls `supabase.auth.getUser()` (never `getSession()`) and checks `user.app_metadata?.role === 'admin'` — middleware alone is not the auth guard (CVE-2025-29927 defense-in-depth).
- Never edit an already-applied migration file — always add a new one.
- All Lithuanian UI strings live in `lib/strings.ts` — never scatter literals in components.
- Tailwind CSS only, no `style={{}}`, no hardcoded hex/pixel values outside tokens.
- Named exports over default exports (except Next.js pages/layouts).
- `components/ui/` — check for an existing shadcn primitive before building one from scratch. This plan adds `tabs.tsx` because it does not exist yet.
- **No test framework exists in this repo** (no vitest/jest/playwright, no `*.test.ts` files, and the `articles` feature this mirrors has none either). Verification steps in this plan use `pnpm lint`, `pnpm build` (typecheck), and a manual dev-server checklist instead of automated tests — do not introduce a new test framework as part of this feature.
- Commits: Conventional Commits, short and imperative (`feat: add promos table`, not `Added promos table`).

---

### Task 1: `promos` table migration + seed data

**Files:**
- Create: `supabase/migrations/20260706000002_create_promos_table.sql`

**Interfaces:**
- Produces: table `public.promos` with columns `id uuid pk`, `title text`, `slug text unique`, `image text nullable`, `starts_at date`, `ends_at date`, `category text` (`'stores'|'services'|'food'`), `published boolean`, `created_at timestamptz`, `updated_at timestamptz`. RLS: public `select` where `published = true`.

- [ ] **Step 1: Write the migration file**

```sql
-- supabase/migrations/20260706000002_create_promos_table.sql
create table if not exists public.promos (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  slug         text not null unique,
  image        text,
  starts_at    date not null,
  ends_at      date not null,
  category     text not null default 'stores'
               check (category in ('stores', 'services', 'food')),
  published    boolean not null default false,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- RLS: public can only read published promos
alter table public.promos enable row level security;

create policy "Public can read published promos"
  on public.promos
  for select
  using (published = true);

-- Admin full access via service role (bypasses RLS automatically)

-- Seed existing static PROMO_ITEMS (lib/promo-data.ts) so the public /akcijos
-- page shows the same content immediately after cutover.
insert into public.promos (title, slug, image, starts_at, ends_at, category, published)
values
  ('Papildoma nuolaida Rieker!', 'rieker',
   'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/news-1.jpg',
   '2026-03-25', '2026-03-29', 'stores', true),
  ('Kvepia pavasariu', 'pavasaris',
   'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/news-2.jpg',
   '2026-03-25', '2026-03-29', 'stores', true),
  ('Samsung naujienos', 'samsung',
   'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/news-3.jpg',
   '2026-03-25', '2026-03-29', 'stores', true),
  ('Vision Express akcija', 'vision-express',
   'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/news-4.jpg',
   '2026-03-25', '2026-03-29', 'services', true),
  ('Nauja kolekcija Lindex', 'lindex',
   'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/news-1.jpg',
   '2026-04-01', '2026-04-14', 'stores', true),
  ('Vasaros išpardavimas', 'vasara',
   'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/news-2.jpg',
   '2026-06-01', '2026-06-30', 'stores', true),
  ('Sporto prekių nuolaidos', 'sportas',
   'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/news-3.jpg',
   '2026-05-15', '2026-05-31', 'services', true),
  ('Caffeine kavos diena', 'caffeine',
   'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/news-4.jpg',
   '2026-06-10', '2026-06-10', 'food', true),
  ('IKI maisto akcija', 'iki',
   'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/news-1.jpg',
   '2026-06-05', '2026-06-11', 'food', true),
  ('Miyako sushi akcija', 'miyako',
   'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/news-2.jpg',
   '2026-06-01', '2026-06-07', 'food', true)
on conflict (slug) do nothing;
```

- [ ] **Step 2: Apply the migration to the linked Supabase project**

Run: `mcp__supabase__apply_migration` (or `supabase db push` if working from the Supabase CLI locally) with the file above. Confirm no errors.

- [ ] **Step 3: Regenerate TypeScript types**

Run: `npx supabase gen types typescript --linked > types/database.ts`

Verify the diff includes a new `promos` entry in the `Tables` interface (Row/Insert/Update matching the columns above) and nothing else changed. If codegen isn't available in this environment (no linked project / no network), skip to Task 2 and add the type block manually instead — do not leave `types/database.ts` stale either way.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260706000002_create_promos_table.sql types/database.ts
git commit -m "feat: add promos table with seeded akcijos data"
```

---

### Task 2: `Promo` type alias (manual fallback if codegen wasn't run)

**Files:**
- Modify: `types/database.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `export type Promo = Database['public']['Tables']['promos']['Row']` — used by every later task.

- [ ] **Step 1: Confirm the generated `promos` Row type exists**

Open `types/database.ts` and search for `promos:`. If Task 1 Step 3 ran successfully, the `Tables` interface already has a `promos` block shaped like this (Row/Insert/Update) — skip to Step 3:

```ts
      promos: {
        Row: {
          category: 'stores' | 'services' | 'food'
          created_at: string | null
          ends_at: string
          id: string
          image: string | null
          published: boolean
          slug: string
          starts_at: string
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: 'stores' | 'services' | 'food'
          created_at?: string | null
          ends_at: string
          id?: string
          image?: string | null
          published?: boolean
          slug: string
          starts_at: string
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: 'stores' | 'services' | 'food'
          created_at?: string | null
          ends_at?: string
          id?: string
          image?: string | null
          published?: boolean
          slug?: string
          starts_at?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
```

- [ ] **Step 2: If codegen did NOT run, add the block above manually**

Insert it into the `Tables` interface alongside the existing `articles` block (same nesting level, comma-separated sibling key).

- [ ] **Step 3: Add the `Promo` type alias**

Find the line `export type Article = Database['public']['Tables']['articles']['Row']` and add directly after it:

```ts
export type Promo = Database['public']['Tables']['promos']['Row']
```

- [ ] **Step 4: Typecheck**

Run: `pnpm build` (or `npx tsc --noEmit` if faster) — expect no new type errors.

- [ ] **Step 5: Commit**

```bash
git add types/database.ts
git commit -m "feat: add Promo type alias"
```

(Skip this commit if Task 1's commit already included the same content — don't create an empty commit.)

---

### Task 3: Promo validation schema

**Files:**
- Create: `lib/validations/promo.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `PROMO_CATEGORIES` (`readonly ['stores', 'services', 'food']`), `PromoCategory` type, `promoFormSchema` (zod), `PromoFormValues` type — consumed by `actions/promos.ts` and `components/promos/promo-form.tsx`.

- [ ] **Step 1: Write the schema**

```ts
// lib/validations/promo.ts
import { z } from 'zod'

export const PROMO_CATEGORIES = ['stores', 'services', 'food'] as const
export type PromoCategory = (typeof PROMO_CATEGORIES)[number]

export const promoFormSchema = z
  .object({
    title: z.string().min(3, 'Pavadinimas per trumpas'),
    slug: z.string().min(3, 'Nuoroda per trumpa').regex(/^[a-z0-9-]+$/, 'Tik mažosios raidės, skaičiai ir brūkšneliai'),
    image: z.string().nullable().default(null),
    starts_at: z.string().min(1, 'Nurodykite pradžios datą'),
    ends_at: z.string().min(1, 'Nurodykite pabaigos datą'),
    category: z.enum(PROMO_CATEGORIES),
    published: z.boolean().default(false),
  })
  .refine((v) => v.ends_at >= v.starts_at, {
    message: 'Pabaigos data turi būti po pradžios datos',
    path: ['ends_at'],
  })

export type PromoFormValues = z.infer<typeof promoFormSchema>
```

- [ ] **Step 2: Typecheck**

Run: `pnpm build`
Expected: no new errors (file has no consumers yet, so this only confirms the file itself compiles).

- [ ] **Step 3: Commit**

```bash
git add lib/validations/promo.ts
git commit -m "feat: add promo form validation schema"
```

---

### Task 4: Promo server actions

**Files:**
- Create: `actions/promos.ts`

**Interfaces:**
- Consumes: `PromoFormValues` from `lib/validations/promo.ts` (Task 3), `Promo` from `types/database.ts` (Task 2), `createClient` from `lib/supabase/server.ts`, `createAdminClient` from `lib/supabase/admin.ts` (both already exist).
- Produces: `createPromo(data)`, `updatePromo(id, data)`, `deletePromo(id)`, `togglePromoPublished(id, published)` — each returning `{ data: Promo } | { error: string }` (or `{ success: true } | { error: string }` for delete) — consumed by `components/promos/promo-form.tsx`, `promos-table.tsx`, `delete-promo-dialog.tsx` in later tasks.

- [ ] **Step 1: Write the actions**

```ts
'use server'
// actions/promos.ts — Server Actions for promos CRUD
// Defense-in-depth: each action verifies admin role independently (CVE-2025-29927)
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { PromoFormValues } from '@/lib/validations/promo'
import type { Promo } from '@/types/database'

async function getAdminClient() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== 'admin') return null
  // Use service role client so mutations bypass RLS (no admin INSERT/UPDATE/DELETE policies)
  return createAdminClient()
}

export async function createPromo(
  data: PromoFormValues
): Promise<{ data: Promo } | { error: string }> {
  const supabase = await getAdminClient()
  if (!supabase) return { error: 'Neturite teisės atlikti šį veiksmą' }

  const { data: created, error } = await supabase
    .from('promos')
    .insert({
      title: data.title,
      slug: data.slug,
      image: data.image,
      starts_at: data.starts_at,
      ends_at: data.ends_at,
      category: data.category,
      published: data.published,
    })
    .select()
    .single()

  if (error || !created) return { error: 'Nepavyko sukurti akcijos' }

  revalidatePath('/admin/articles')
  revalidatePath('/akcijos')
  return { data: created as Promo }
}

export async function updatePromo(
  id: string,
  data: PromoFormValues
): Promise<{ data: Promo } | { error: string }> {
  const supabase = await getAdminClient()
  if (!supabase) return { error: 'Neturite teisės atlikti šį veiksmą' }

  const { data: updated, error } = await supabase
    .from('promos')
    .update({
      title: data.title,
      slug: data.slug,
      image: data.image,
      starts_at: data.starts_at,
      ends_at: data.ends_at,
      category: data.category,
      published: data.published,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error || !updated) return { error: 'Nepavyko atnaujinti akcijos' }

  revalidatePath('/admin/articles')
  revalidatePath('/akcijos')
  revalidatePath(`/akcijos/${data.slug}`)
  return { data: updated as Promo }
}

export async function deletePromo(
  id: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await getAdminClient()
  if (!supabase) return { error: 'Neturite teisės atlikti šį veiksmą' }

  const { error } = await supabase.from('promos').delete().eq('id', id)
  if (error) return { error: 'Nepavyko ištrinti akcijos' }

  revalidatePath('/admin/articles')
  revalidatePath('/akcijos')
  return { success: true }
}

export async function togglePromoPublished(
  id: string,
  published: boolean
): Promise<{ data: Promo } | { error: string }> {
  const supabase = await getAdminClient()
  if (!supabase) return { error: 'Neturite teisės atlikti šį veiksmą' }

  const { data: updated, error } = await supabase
    .from('promos')
    .update({ published, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error || !updated) return { error: 'Nepavyko pakeisti būsenos' }

  revalidatePath('/admin/articles')
  revalidatePath('/akcijos')
  return { data: updated as Promo }
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm build`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add actions/promos.ts
git commit -m "feat: add promos server actions"
```

---

### Task 5: `Tabs` shadcn primitive

**Files:**
- Create: `components/ui/tabs.tsx`

**Interfaces:**
- Produces: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` — consumed by `app/(dashboard)/admin/articles/page.tsx` (Task 12).

`components/ui/tabs.tsx` does not exist in this repo yet. The `radix-ui` consolidated package (already a dependency, used identically by `components/ui/switch.tsx`) includes the `Tabs` primitive, so no new dependency is needed.

- [ ] **Step 1: Write the component**

```tsx
// components/ui/tabs.tsx
"use client"

import * as React from "react"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
```

- [ ] **Step 2: Typecheck**

Run: `pnpm build`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add components/ui/tabs.tsx
git commit -m "feat: add shadcn tabs component"
```

---

### Task 6: Admin strings for promos

**Files:**
- Modify: `lib/strings.ts`

**Interfaces:**
- Produces: `ADMIN_PROMOS_STRINGS` — consumed by every `components/promos/*` file and the admin routes in later tasks.

- [ ] **Step 1: Add the strings block**

Find the closing `} as const` of `ARTICLES_STRINGS` in `lib/strings.ts` and add directly after it:

```ts
export const ADMIN_PROMOS_STRINGS = {
  pageTitle: 'Akcijos',
  pageDescription: 'Kurkite ir valdykite akcijas bei pasiūlymus',
  newButton: 'Nauja akcija',
  editTitle: 'Redaguoti akciją',
  newTitle: 'Nauja akcija',
  saveDraft: 'Išsaugoti juodraštį',
  publish: 'Publikuoti',
  titlePlaceholder: 'Akcijos pavadinimas',
  slugLabel: 'Nuoroda (URL)',
  categoryLabel: 'Kategorija',
  categoryStores: 'Parduotuvės',
  categoryServices: 'Paslaugos',
  categoryFood: 'Restoranai / Kavinės',
  startsAtLabel: 'Pradžios data',
  endsAtLabel: 'Pabaigos data',
  imageLabel: 'Nuotrauka',
  uploadImage: 'Įkelti nuotrauką',
  removeImage: 'Pašalinti',
  deleteConfirmTitle: 'Ištrinti akciją?',
  deleteConfirmDesc: 'Šis veiksmas negrįžtamas. Akcija bus ištrinta visam laikui.',
  deleteConfirm: 'Ištrinti',
  deleteCancel: 'Atšaukti',
  colImage: '',
  colTitle: 'Pavadinimas',
  colCategory: 'Kategorija',
  colDates: 'Laikotarpis',
  colPublished: 'Publikuota',
  colActions: 'Veiksmai',
  errorSave: 'Nepavyko išsaugoti akcijos',
  errorDelete: 'Nepavyko ištrinti akcijos',
  emptyState: 'Akcijų kol kas nėra.',
  statusPublished: 'Publikuota',
  statusDraft: 'Juodraštis',
  tabArticles: 'Straipsniai',
  tabPromos: 'Akcijos',
} as const
```

- [ ] **Step 2: Typecheck**

Run: `pnpm build`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add lib/strings.ts
git commit -m "feat: add admin promos strings"
```

---

### Task 7: `DeletePromoDialog`

**Files:**
- Create: `components/promos/delete-promo-dialog.tsx`

**Interfaces:**
- Consumes: `deletePromo` from `actions/promos.ts` (Task 4), `ADMIN_PROMOS_STRINGS` from `lib/strings.ts` (Task 6).
- Produces: `DeletePromoDialog({ id, onSuccess }: { id: string; onSuccess: (id: string) => void })` — consumed by `promo-columns.tsx` (Task 8).

- [ ] **Step 1: Write the component**

```tsx
// components/promos/delete-promo-dialog.tsx
'use client'

import { useState, useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { deletePromo } from '@/actions/promos'
import { ADMIN_PROMOS_STRINGS } from '@/lib/strings'

interface DeletePromoDialogProps {
  id: string
  onSuccess: (id: string) => void
}

export function DeletePromoDialog({ id, onSuccess }: DeletePromoDialogProps) {
  const [open, setOpen] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleConfirm() {
    startTransition(async () => {
      const result = await deletePromo(id)
      if ('success' in result) {
        onSuccess(id)
        setOpen(false)
      } else {
        setErrorMsg(result.error)
      }
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setErrorMsg(null) }}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{ADMIN_PROMOS_STRINGS.deleteConfirmTitle}</AlertDialogTitle>
          <AlertDialogDescription>{ADMIN_PROMOS_STRINGS.deleteConfirmDesc}</AlertDialogDescription>
        </AlertDialogHeader>
        {errorMsg && (
          <p className="text-sm text-destructive px-6 pb-2">{errorMsg}</p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>{ADMIN_PROMOS_STRINGS.deleteCancel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {ADMIN_PROMOS_STRINGS.deleteConfirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm build`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add components/promos/delete-promo-dialog.tsx
git commit -m "feat: add delete promo confirmation dialog"
```

---

### Task 8: `getPromoColumns`

**Files:**
- Create: `components/promos/promo-columns.tsx`

**Interfaces:**
- Consumes: `Promo` from `types/database.ts`, `ADMIN_PROMOS_STRINGS` from `lib/strings.ts`, `DeletePromoDialog` from Task 7, `resizeSupabaseImage` from `lib/utils/supabase-image.ts` (already exists per repo).
- Produces: `getPromoColumns(onTogglePublished, onEdit, onDelete, pending): ColumnDef<Promo>[]` — consumed by `promos-table.tsx` (Task 9).

- [ ] **Step 1: Write the columns**

```tsx
// components/promos/promo-columns.tsx
'use client'
import type { ColumnDef } from '@tanstack/react-table'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { DataGridColumnHeader } from '@/components/reui/data-grid/data-grid-column-header'
import { DeletePromoDialog } from './delete-promo-dialog'
import type { Promo } from '@/types/database'
import { ADMIN_PROMOS_STRINGS } from '@/lib/strings'
import { resizeSupabaseImage } from '@/lib/utils/supabase-image'

const CATEGORY_LABEL: Record<Promo['category'], string> = {
  stores: ADMIN_PROMOS_STRINGS.categoryStores,
  services: ADMIN_PROMOS_STRINGS.categoryServices,
  food: ADMIN_PROMOS_STRINGS.categoryFood,
}

const CATEGORY_VARIANT: Record<Promo['category'], 'default' | 'secondary' | 'outline'> = {
  stores: 'default',
  services: 'secondary',
  food: 'outline',
}

function formatDateRange(startsAt: string, endsAt: string): string {
  const fmt = (d: string) => new Date(d).toLocaleDateString('lt-LT')
  return `${fmt(startsAt)} – ${fmt(endsAt)}`
}

export function getPromoColumns(
  onTogglePublished: (promo: Promo) => void,
  onEdit: (promo: Promo) => void,
  onDelete: (id: string) => void,
  pending: boolean,
): ColumnDef<Promo>[] {
  return [
    {
      id: 'image',
      accessorKey: 'image',
      header: ({ column }) => <DataGridColumnHeader title="" column={column} />,
      cell: ({ row }) => {
        const src = row.getValue<string | null>('image')
        return src ? (
          <img src={resizeSupabaseImage(src, { width: 80, height: 80 })} alt="" loading="lazy" className="h-10 w-10 rounded object-cover" />
        ) : (
          <div className="h-10 w-10 rounded bg-muted" />
        )
      },
      size: 48,
      enableSorting: false,
    },
    {
      id: 'title',
      accessorKey: 'title',
      header: ({ column }) => (
        <DataGridColumnHeader title={ADMIN_PROMOS_STRINGS.colTitle} column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue('title')}</span>
      ),
    },
    {
      id: 'category',
      accessorKey: 'category',
      header: ({ column }) => (
        <DataGridColumnHeader title={ADMIN_PROMOS_STRINGS.colCategory} column={column} />
      ),
      cell: ({ row }) => {
        const cat = row.getValue<Promo['category']>('category')
        return <Badge variant={CATEGORY_VARIANT[cat]}>{CATEGORY_LABEL[cat]}</Badge>
      },
      size: 160,
    },
    {
      id: 'dates',
      header: ({ column }) => (
        <DataGridColumnHeader title={ADMIN_PROMOS_STRINGS.colDates} column={column} />
      ),
      cell: ({ row }) => {
        const promo = row.original
        return (
          <span className="text-sm text-muted-foreground">
            {formatDateRange(promo.starts_at, promo.ends_at)}
          </span>
        )
      },
      size: 176,
      enableSorting: false,
    },
    {
      id: 'published',
      accessorKey: 'published',
      header: ({ column }) => (
        <DataGridColumnHeader title={ADMIN_PROMOS_STRINGS.colPublished} column={column} />
      ),
      cell: ({ row }) => {
        const promo = row.original
        return (
          <Switch
            checked={promo.published}
            disabled={pending}
            onCheckedChange={() => { onTogglePublished(promo) }}
            onClick={(e) => e.stopPropagation()}
          />
        )
      },
      size: 128,
      enableSorting: false,
    },
    {
      id: 'actions',
      header: ({ column }) => (
        <DataGridColumnHeader title={ADMIN_PROMOS_STRINGS.colActions} column={column} />
      ),
      cell: ({ row }) => {
        const promo = row.original
        return (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" onClick={() => onEdit(promo)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <DeletePromoDialog id={promo.id} onSuccess={onDelete} />
          </div>
        )
      },
      size: 96,
      enableSorting: false,
    },
  ]
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm build`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add components/promos/promo-columns.tsx
git commit -m "feat: add promo table columns"
```

---

### Task 9: `PromosTable`

**Files:**
- Create: `components/promos/promos-table.tsx`

**Interfaces:**
- Consumes: `togglePromoPublished` from `actions/promos.ts` (Task 4), `getPromoColumns` from Task 8, `Promo` from `types/database.ts`, `ADMIN_PROMOS_STRINGS` from `lib/strings.ts`.
- Produces: `PromosTable({ data }: { data: Promo[] })` — consumed by `app/(dashboard)/admin/articles/page.tsx` (Task 12).

- [ ] **Step 1: Write the table**

```tsx
// components/promos/promos-table.tsx
'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  type SortingState,
  type PaginationState,
} from '@tanstack/react-table'
import { DataGrid } from '@/components/reui/data-grid/data-grid'
import { DataGridTable } from '@/components/reui/data-grid/data-grid-table'
import { DataGridPagination } from '@/components/reui/data-grid/data-grid-pagination'
import { Card, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { togglePromoPublished } from '@/actions/promos'
import { getPromoColumns } from './promo-columns'
import { ADMIN_PROMOS_STRINGS } from '@/lib/strings'
import type { Promo } from '@/types/database'

interface PromosTableProps {
  data: Promo[]
}

export function PromosTable({ data: initialData }: PromosTableProps) {
  const [promos, setPromos] = useState<Promo[]>(initialData)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  function handlePublishedToggle(promo: Promo) {
    const newVal = !promo.published
    setPromos((prev) =>
      prev.map((p) => (p.id === promo.id ? { ...p, published: newVal } : p))
    )
    startTransition(async () => {
      const result = await togglePromoPublished(promo.id, newVal)
      if ('error' in result) {
        setPromos((prev) =>
          prev.map((p) => (p.id === promo.id ? { ...p, published: promo.published } : p))
        )
      }
    })
  }

  function handleDeleteSuccess(id: string) {
    setPromos((prev) => prev.filter((p) => p.id !== id))
  }

  const columns = useMemo(
    () =>
      getPromoColumns(
        handlePublishedToggle,
        (promo) => router.push(`/admin/articles/akcijos/${promo.id}/edit`),
        handleDeleteSuccess,
        pending,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pending],
  )

  const table = useReactTable({
    data: promos,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <DataGrid
      table={table}
      recordCount={promos.length}
      onRowClick={(row) => router.push(`/admin/articles/akcijos/${row.id}/edit`)}
    >
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between px-4 py-3">
          <CardTitle className="text-lg">{ADMIN_PROMOS_STRINGS.pageTitle}</CardTitle>
        </CardHeader>

        <div className="w-full overflow-x-auto border-y">
          <DataGridTable />
        </div>

        <CardFooter className="flex items-center justify-between px-4 py-3 bg-transparent border-none">
          <DataGridPagination />
        </CardFooter>
      </Card>
    </DataGrid>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm build`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add components/promos/promos-table.tsx
git commit -m "feat: add promos data grid table"
```

---

### Task 10: `PromoForm`

**Files:**
- Create: `components/promos/promo-form.tsx`

**Interfaces:**
- Consumes: `promoFormSchema`, `PROMO_CATEGORIES`, `PromoFormValues` from `lib/validations/promo.ts` (Task 3), `createPromo`/`updatePromo` from `actions/promos.ts` (Task 4), `ADMIN_PROMOS_STRINGS` from `lib/strings.ts` (Task 6), `compressImageFile`/`imageExtension` from `lib/image-compression.ts` (existing), `slugify` from `lib/slugify.ts` (existing), `Promo` from `types/database.ts`.
- Produces: `PromoForm({ promo }?: { promo?: Promo })` — consumed by the `new`/`[id]/edit` admin routes (Task 11).

- [ ] **Step 1: Write the form**

```tsx
// components/promos/promo-form.tsx
'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Image as ImageIcon, Loader2 } from 'lucide-react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { compressImageFile, imageExtension } from '@/lib/image-compression'
import { createPromo, updatePromo } from '@/actions/promos'
import {
  promoFormSchema,
  PROMO_CATEGORIES,
  type PromoFormValues,
} from '@/lib/validations/promo'
import { slugify } from '@/lib/slugify'
import { ADMIN_PROMOS_STRINGS } from '@/lib/strings'
import type { Promo } from '@/types/database'

const CATEGORY_LABEL: Record<(typeof PROMO_CATEGORIES)[number], string> = {
  stores: ADMIN_PROMOS_STRINGS.categoryStores,
  services: ADMIN_PROMOS_STRINGS.categoryServices,
  food: ADMIN_PROMOS_STRINGS.categoryFood,
}

interface PromoFormProps {
  promo?: Promo
}

export function PromoForm({ promo }: PromoFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [imagePreview, setImagePreview] = useState<string | null>(
    promo?.image ?? null
  )
  const [uploadingImage, setUploadingImage] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PromoFormValues>({
    resolver: zodResolver(promoFormSchema) as Resolver<PromoFormValues>,
    defaultValues: {
      title: promo?.title ?? '',
      slug: promo?.slug ?? '',
      image: promo?.image ?? null,
      starts_at: promo?.starts_at ?? '',
      ends_at: promo?.ends_at ?? '',
      category: promo?.category ?? 'stores',
      published: promo?.published ?? false,
    },
  })

  const title = watch('title')

  // Auto-generate slug from title only when creating a new promo
  useEffect(() => {
    if (!promo && title) {
      setValue('slug', slugify(title))
    }
  }, [title, promo, setValue])

  async function uploadImage(file: File) {
    setUploadingImage(true)
    const compressed = await compressImageFile(file)
    const supabase = createClient()
    const path = `akcijos/${Date.now()}.${imageExtension(compressed)}`
    const { error } = await supabase.storage
      .from('marketing-assets')
      .upload(path, compressed, { contentType: compressed.type })
    if (error) {
      setUploadingImage(false)
      return
    }
    const { data } = supabase.storage
      .from('marketing-assets')
      .getPublicUrl(path)
    setValue('image', data.publicUrl)
    setImagePreview(data.publicUrl)
    setUploadingImage(false)
  }

  function onSave(published: boolean) {
    setValue('published', published)
    setSaveError(null)
    handleSubmit(
      (data) => {
        startTransition(async () => {
          const payload = { ...data, published }
          const result = promo
            ? await updatePromo(promo.id, payload)
            : await createPromo(payload)
          if ('error' in result) {
            setSaveError(result.error)
            return
          }
          router.push('/admin/articles?tab=akcijos')
        })
      },
      () => setSaveError(ADMIN_PROMOS_STRINGS.errorSave)
    )()
  }

  return (
    <div className="flex flex-col gap-0 min-h-screen -mx-4 -mt-4 -mb-20 md:-mb-4">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-background border-b px-6 py-3 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/admin/articles?tab=akcijos')}
          type="button"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Input
          {...register('title')}
          placeholder={ADMIN_PROMOS_STRINGS.titlePlaceholder}
          className="flex-1 text-lg font-semibold border-0 shadow-none focus-visible:ring-0 px-0"
        />
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => onSave(false)}
          type="button"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : ADMIN_PROMOS_STRINGS.saveDraft}
        </Button>
        <Button
          size="sm"
          disabled={isPending}
          onClick={() => onSave(true)}
          type="button"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : ADMIN_PROMOS_STRINGS.publish}
        </Button>
      </div>

      <div className="flex flex-1 gap-0">
        {/* Main column */}
        <div className="flex-1 px-6 py-6 flex flex-col gap-5 max-w-xl">
          {saveError && (
            <p className="text-sm text-destructive">{saveError}</p>
          )}

          <div className="flex flex-col gap-2">
            <Label>{ADMIN_PROMOS_STRINGS.slugLabel}</Label>
            <Input {...register('slug')} />
            {errors.slug && (
              <p className="text-destructive text-xs">{errors.slug.message}</p>
            )}
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col gap-2 flex-1">
              <Label>{ADMIN_PROMOS_STRINGS.startsAtLabel}</Label>
              <Input type="date" {...register('starts_at')} />
              {errors.starts_at && (
                <p className="text-destructive text-xs">{errors.starts_at.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <Label>{ADMIN_PROMOS_STRINGS.endsAtLabel}</Label>
              <Input type="date" {...register('ends_at')} />
              {errors.ends_at && (
                <p className="text-destructive text-xs">{errors.ends_at.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-72 border-l px-4 py-4 flex flex-col gap-5">
          {/* Image */}
          <div className="flex flex-col gap-2">
            <Label>{ADMIN_PROMOS_STRINGS.imageLabel}</Label>
            {imagePreview ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt=""
                  className="w-full h-32 object-cover rounded-md"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-1 right-1 h-6 text-xs"
                  onClick={() => {
                    setImagePreview(null)
                    setValue('image', null)
                  }}
                  type="button"
                >
                  {ADMIN_PROMOS_STRINGS.removeImage}
                </Button>
              </div>
            ) : (
              <label
                className={`flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-md cursor-pointer text-muted-foreground transition-colors ${
                  isDragging ? 'border-primary bg-primary/5' : 'hover:bg-muted/40'
                }`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragEnter={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setIsDragging(false)
                  const f = e.dataTransfer.files?.[0]
                  if (f && f.type.startsWith('image/')) uploadImage(f)
                }}
              >
                {uploadingImage ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <ImageIcon className="h-5 w-5 mb-1" />
                    <span className="text-xs">{ADMIN_PROMOS_STRINGS.uploadImage}</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) uploadImage(f)
                  }}
                />
              </label>
            )}
          </div>

          {/* Category */}
          <div className="flex flex-col gap-2">
            <Label>{ADMIN_PROMOS_STRINGS.categoryLabel}</Label>
            <Select
              defaultValue={promo?.category ?? 'stores'}
              onValueChange={(v) =>
                setValue('category', v as PromoFormValues['category'])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROMO_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {CATEGORY_LABEL[cat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Published status badge */}
          <div className="text-sm text-muted-foreground">
            {watch('published') ? (
              <Badge variant="default">{ADMIN_PROMOS_STRINGS.statusPublished}</Badge>
            ) : (
              <Badge variant="secondary">{ADMIN_PROMOS_STRINGS.statusDraft}</Badge>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm build`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add components/promos/promo-form.tsx
git commit -m "feat: add promo create/edit form"
```

---

### Task 11: Admin promo routes (`new`, `[id]/edit`)

**Files:**
- Create: `app/(dashboard)/admin/articles/akcijos/new/page.tsx`
- Create: `app/(dashboard)/admin/articles/akcijos/[id]/edit/page.tsx`

**Interfaces:**
- Consumes: `PromoForm` from Task 10, `createClient` from `lib/supabase/server.ts` (existing).
- Produces: routes `/admin/articles/akcijos/new` and `/admin/articles/akcijos/[id]/edit`, linked from `PromosTable` (Task 9, already wired) and the "New" button added in Task 12.

- [ ] **Step 1: Write the "new" route**

```tsx
// app/(dashboard)/admin/articles/akcijos/new/page.tsx — New promo editor
// Server Component — Defense-in-depth auth check (middleware alone is not sufficient)
// CVE-2025-29927: middleware can be bypassed via x-middleware-subrequest header
export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PromoForm } from '@/components/promos/promo-form'

export default async function NewPromoPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== 'admin') redirect('/login')

  return <PromoForm />
}
```

- [ ] **Step 2: Write the "edit" route**

```tsx
// app/(dashboard)/admin/articles/akcijos/[id]/edit/page.tsx — Edit promo editor
// Server Component — Defense-in-depth auth check (middleware alone is not sufficient)
// CVE-2025-29927: middleware can be bypassed via x-middleware-subrequest header
export const dynamic = 'force-dynamic'

import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PromoForm } from '@/components/promos/promo-form'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPromoPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== 'admin') redirect('/login')

  const { data: promo } = await supabase
    .from('promos')
    .select('*')
    .eq('id', id)
    .single()

  if (!promo) notFound()

  return <PromoForm promo={promo} />
}
```

- [ ] **Step 3: Typecheck**

Run: `pnpm build`
Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add "app/(dashboard)/admin/articles/akcijos/new/page.tsx" "app/(dashboard)/admin/articles/akcijos/[id]/edit/page.tsx"
git commit -m "feat: add promo new/edit admin routes"
```

---

### Task 12: Tabs switcher on `/admin/articles`

**Files:**
- Modify: `app/(dashboard)/admin/articles/page.tsx`

**Interfaces:**
- Consumes: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` from `components/ui/tabs.tsx` (Task 5), `PromosTable` from Task 9, `ADMIN_PROMOS_STRINGS` from `lib/strings.ts` (Task 6). Existing `ArticlesTable`, `ARTICLES_STRINGS` stay as-is.
- Produces: `/admin/articles?tab=akcijos` deep link into the Akcijos tab, `/admin/articles/akcijos/new` "New" button when that tab is active.

- [ ] **Step 1: Rewrite the page**

Replace the full contents of `app/(dashboard)/admin/articles/page.tsx` with:

```tsx
// app/(dashboard)/admin/articles/page.tsx — Admin articles + akcijos list page
// Server Component — Defense-in-depth auth check (middleware alone is not sufficient)
// CVE-2025-29927: middleware can be bypassed via x-middleware-subrequest header
export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ArticlesTable } from '@/components/articles/articles-table'
import { PromosTable } from '@/components/promos/promos-table'
import { ARTICLES_STRINGS, ADMIN_PROMOS_STRINGS } from '@/lib/strings'

interface Props {
  searchParams: Promise<{ tab?: string }>
}

export default async function AdminArticlesPage({ searchParams }: Props) {
  const { tab } = await searchParams
  const activeTab = tab === 'akcijos' ? 'akcijos' : 'articles'

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.app_metadata?.role !== 'admin') {
    redirect('/login')
  }

  const [{ data: articles }, { data: promos }] = await Promise.all([
    supabase.from('articles').select('*').order('created_at', { ascending: false }),
    supabase.from('promos').select('*').order('created_at', { ascending: false }),
  ])

  return (
    <div className="flex flex-col gap-3">
      <Tabs defaultValue={activeTab}>
        <div className="flex items-start justify-between gap-4">
          <TabsList>
            <TabsTrigger value="articles" asChild>
              <Link href="/admin/articles?tab=articles">{ADMIN_PROMOS_STRINGS.tabArticles}</Link>
            </TabsTrigger>
            <TabsTrigger value="akcijos" asChild>
              <Link href="/admin/articles?tab=akcijos">{ADMIN_PROMOS_STRINGS.tabPromos}</Link>
            </TabsTrigger>
          </TabsList>
          <Button size="sm" asChild>
            {activeTab === 'akcijos' ? (
              <Link href="/admin/articles/akcijos/new">
                <Plus className="mr-2 h-4 w-4" />
                {ADMIN_PROMOS_STRINGS.newButton}
              </Link>
            ) : (
              <Link href="/admin/articles/new">
                <Plus className="mr-2 h-4 w-4" />
                {ARTICLES_STRINGS.newButton}
              </Link>
            )}
          </Button>
        </div>

        <TabsContent value="articles">
          <div className="mb-3">
            <h1 className="text-2xl font-bold">{ARTICLES_STRINGS.pageTitle}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{ARTICLES_STRINGS.pageDescription}</p>
          </div>
          <ArticlesTable data={articles ?? []} />
        </TabsContent>

        <TabsContent value="akcijos">
          <div className="mb-3">
            <h1 className="text-2xl font-bold">{ADMIN_PROMOS_STRINGS.pageTitle}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{ADMIN_PROMOS_STRINGS.pageDescription}</p>
          </div>
          <PromosTable data={promos ?? []} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

Note: Radix `Tabs` manages active-tab state client-side via `defaultValue`; combining it with plain `<Link>`s for navigation (rather than `onValueChange` + client state) keeps the page a Server Component while still making `?tab=akcijos` linkable/bookmarkable/shareable, per the design spec. `TabsTrigger asChild` delegates the interactive element to the `Link`.

- [ ] **Step 2: Typecheck**

Run: `pnpm build`
Expected: no new errors.

- [ ] **Step 3: Manual verification**

Run: `pnpm dev`, visit `/admin/articles` logged in as an admin user. Confirm:
- "Straipsniai" tab shows the existing articles table unchanged.
- "Akcijos" tab shows the 10 seeded promos (Task 1) with correct titles, categories, and date ranges.
- Clicking "Akcijos" tab updates the URL to `?tab=akcijos` and a page refresh keeps you on that tab.
- The "New" button next to the tabs switches its target link/label between "Naujas straipsnis" and "Nauja akcija" depending on the active tab.

- [ ] **Step 4: Commit**

```bash
git add "app/(dashboard)/admin/articles/page.tsx"
git commit -m "feat: add akcijos tab to admin articles page"
```

---

### Task 13: Public `/akcijos` pages read from the database

**Files:**
- Create: `lib/utils/format-promo-date.ts`
- Modify: `components/marketing/promo-card.tsx`
- Modify: `app/(marketing)/akcijos/page.tsx`
- Modify: `app/(marketing)/akcijos/[slug]/page.tsx`
- Modify: `lib/puck-config.tsx`
- Delete: `lib/promo-data.ts`

**Interfaces:**
- Produces: `formatPromoDateRange(startsAt: string, endsAt: string): string` (`"Nuo DD.MM.YYYY iki DD.MM.YYYY"`), an updated `PromoItem` type (`starts_at`/`ends_at` instead of `date`, `image: string | null`).
- Consumes: `Promo` from `types/database.ts` (Task 2).

- [ ] **Step 1: Write the date formatter**

```ts
// lib/utils/format-promo-date.ts
function formatLt(date: string): string {
  const [year, month, day] = date.split('-')
  return `${day}.${month}.${year}`
}

export function formatPromoDateRange(startsAt: string, endsAt: string): string {
  return `Nuo ${formatLt(startsAt)} iki ${formatLt(endsAt)}`
}
```

- [ ] **Step 2: Update `PromoItem` type in `promo-card.tsx`**

In `components/marketing/promo-card.tsx`, replace the `PromoItem` type and the date line:

```tsx
export type PromoItem = {
  id: string
  image: string | null
  title: string
  date: string
  href: string
  category: PromoCategory
}
```

(`date` stays a pre-formatted display string on `PromoItem` — the pages in Steps 3–4 compute it via `formatPromoDateRange` before constructing `PromoItem`s, so `PromoCard` itself needs no changes beyond the `image` nullability.)

Also update the `<img>` block to guard against a null image:

```tsx
      <div className="relative w-full h-[236px] rounded-[32px] lg:rounded-[40px] overflow-hidden shrink-0 bg-muted">
        {item.image && (
          <img
            src={item.image}
            alt={item.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 [transition-timing-function:var(--ease-out)]"
          />
        )}
      </div>
```

- [ ] **Step 3: Update `app/(marketing)/akcijos/page.tsx` to query the database**

Replace the full file with:

```tsx
import type { Metadata } from 'next'
import { Nav } from '@/components/marketing/nav'
import { Footer } from '@/components/marketing/footer'
import { AkcijosGrid } from '@/components/marketing/akcijos-grid'
import { PageBannerCarousel } from '@/components/marketing/page-banner-carousel'
import { AKCIJOS_STRINGS } from '@/lib/strings'
import { createClient } from '@/lib/supabase/server'
import { formatPromoDateRange } from '@/lib/utils/format-promo-date'
import { getPuckBannerSlides, getPuckBlockProps } from '@/lib/page-content'
import type { PromoItem } from '@/components/marketing/promo-card'

const DEFAULT_BANNER_SLIDES = [
  'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/banner-akcijos-1.jpg',
  'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/banner-akcijos-2.jpg',
]

const DEFAULT_GRID_COPY = {
  filterAllLabel: AKCIJOS_STRINGS.filterAll,
  filterStoresLabel: AKCIJOS_STRINGS.filterStores,
  filterServicesLabel: AKCIJOS_STRINGS.filterServices,
  filterFoodLabel: AKCIJOS_STRINGS.filterFood,
  searchPlaceholder: AKCIJOS_STRINGS.searchPlaceholder,
  loadMoreLabel: AKCIJOS_STRINGS.loadMore,
}

export const metadata: Metadata = {
  title: 'Akcijos ir Naujienos — PC Europa',
  description: AKCIJOS_STRINGS.pageDescription,
}

export default async function AkcijosPage() {
  const bannerSlides = await getPuckBannerSlides('akcijos', DEFAULT_BANNER_SLIDES)
  const gridCopy = await getPuckBlockProps('akcijos', 'AkcijosGridBlock', DEFAULT_GRID_COPY)

  const supabase = await createClient()
  const { data: promos } = await supabase
    .from('promos')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })

  const items: PromoItem[] = (promos ?? []).map((p) => ({
    id: p.slug,
    image: p.image,
    title: p.title,
    date: formatPromoDateRange(p.starts_at, p.ends_at),
    href: `/akcijos/${p.slug}`,
    category: p.category,
  }))

  return (
    <main className="bg-[#f7f7f5] flex flex-col items-center min-h-screen font-[family-name:var(--font-jakarta)]">
      <Nav />

      <h1 className="sr-only">{AKCIJOS_STRINGS.pageTitle}</h1>
      <PageBannerCarousel slides={bannerSlides} />

      {/* Promo grid with filters */}
      <section className="w-full max-w-[1332px] mx-auto px-4 py-8 md:py-10 lg:py-14">
        <AkcijosGrid items={items} {...gridCopy} />
      </section>

      <Footer />
    </main>
  )
}
```

- [ ] **Step 4: Update `app/(marketing)/akcijos/[slug]/page.tsx` to query the database**

Replace the full file with:

```tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Nav } from '@/components/marketing/nav'
import { Footer } from '@/components/marketing/footer'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatPromoDateRange } from '@/lib/utils/format-promo-date'
import { ArrowIcon } from '@/components/marketing/ui/arrow-icon'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const supabase = createAdminClient()
  const { data: promos } = await supabase.from('promos').select('slug').eq('published', true)
  return (promos ?? []).map((p) => ({ slug: p.slug }))
}

async function getPromo(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('promos')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()
  return data
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const item = await getPromo(slug)
  if (!item) return {}
  return {
    title: `${item.title} — PC Europa`,
    description: formatPromoDateRange(item.starts_at, item.ends_at),
  }
}

export default async function PromoDetailPage({ params }: Props) {
  const { slug } = await params
  const item = await getPromo(slug)
  if (!item) notFound()

  return (
    <main className="bg-[#f7f7f5] flex flex-col items-center min-h-screen font-[family-name:var(--font-jakarta)]">
      <Nav />

      <section className="w-full max-w-[1332px] mx-auto px-4 py-10 md:py-14 flex flex-col gap-8">
        <Link
          href="/akcijos"
          className="inline-flex items-center gap-2 text-sm text-[#575757] hover:text-black transition-colors w-fit"
        >
          <ArrowIcon className="size-4 rotate-180" />
          Visos akcijos
        </Link>

        <div className="relative w-full max-h-[480px] rounded-[32px] lg:rounded-[40px] overflow-hidden bg-muted">
          {item.image && (
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-[480px] object-cover"
            />
          )}
        </div>

        <div className="flex flex-col gap-3 max-w-2xl">
          <p className="text-[#575757] text-base">{formatPromoDateRange(item.starts_at, item.ends_at)}</p>
          <h1 className="font-bold text-[32px] leading-[40px] text-black">{item.title}</h1>
        </div>
      </section>

      <Footer />
    </main>
  )
}
```

- [ ] **Step 5: Detach `lib/puck-config.tsx` from `lib/promo-data.ts`**

In `lib/puck-config.tsx`, remove the line:

```ts
import { PROMO_ITEMS } from '@/lib/promo-data'
```

And change the `AkcijosGridBlock`'s `render`:

```ts
      render: (props) => <AkcijosGrid items={[]} {...props} />,
```

The Puck visual editor only edits `AkcijosGridBlock`'s copy fields (filter/search labels) — its live preview never needed real promo data, so an empty array is a safe, dependency-free replacement for the deleted static import.

- [ ] **Step 6: Delete the now-unused static data file**

```bash
rm lib/promo-data.ts
```

- [ ] **Step 7: Typecheck and lint**

Run: `pnpm build && pnpm lint`
Expected: no errors. If `pnpm build` reports an unused `PromoCategory`/`PromoItem` import anywhere, fix the import list at that call site (do not leave unused imports).

- [ ] **Step 8: Manual verification**

Run: `pnpm dev`, visit `/akcijos`. Confirm:
- All 10 seeded promos render with correct images, titles, and `"Nuo DD.MM.YYYY iki DD.MM.YYYY"` date strings.
- Category filters (Parduotuvės / Paslaugos / Restoranai...) still filter correctly.
- Clicking a promo card navigates to `/akcijos/[slug]` and renders the detail page correctly.
- Un-publishing a promo from `/admin/articles?tab=akcijos` (toggle the switch) makes it disappear from `/akcijos` after a refresh.

- [ ] **Step 9: Commit**

```bash
git add lib/utils/format-promo-date.ts components/marketing/promo-card.tsx \
  "app/(marketing)/akcijos/page.tsx" "app/(marketing)/akcijos/[slug]/page.tsx" \
  lib/puck-config.tsx
git rm lib/promo-data.ts
git commit -m "feat: read akcijos public pages from the promos table"
```

---

### Task 14: Final full-repo verification

**Files:** none (verification only).

- [ ] **Step 1: Full typecheck + lint**

Run: `pnpm build && pnpm lint`
Expected: both pass with no errors.

- [ ] **Step 2: End-to-end manual click-through**

With `pnpm dev` running and logged in as an admin:
1. Go to `/admin/articles`, confirm both tabs load.
2. On the Akcijos tab, click "Nauja akcija", fill in title/slug/dates/category/image, click "Publikuoti". Confirm redirect back to `/admin/articles?tab=akcijos` and the new row appears.
3. Click the new row to edit it, change the title, save as draft. Confirm the published switch reflects "Juodraštis" state and the public `/akcijos` page no longer shows it.
4. Delete the test promo via the trash icon + confirm dialog. Confirm it disappears from the table.
5. Confirm the pre-existing "Straipsniai" tab and its create/edit/delete flows are unaffected.

- [ ] **Step 3: Update project docs if needed**

If `pnpm build`/`pnpm lint` surfaced any repo-wide conventions this plan missed (e.g. an ESLint rule about image `alt` text), fix inline — do not defer.

No commit for this task (verification only, no file changes expected).
