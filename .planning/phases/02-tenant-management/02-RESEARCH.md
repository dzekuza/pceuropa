# Phase 2: Tenant Management - Research

**Researched:** 2026-02-25
**Domain:** Admin CRUD UI (data table, drawer form, delete confirm) + Supabase admin user creation + auto-calculated metrics display
**Confidence:** HIGH — all critical findings drawn from official shadcn/ui docs, Supabase official docs, and Next.js official docs.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Tenant list layout**
- Data table with sortable columns (not cards or simple list)
- Visible columns: Parduotuve, Operatorius, Kategorija, Plotas (m2), Nuomos kaina (EUR)
- Clicking a row navigates to that tenant's detail page
- Three-dot actions menu at end of each row for quick edit/delete
- Expect 30-100 tenants — needs category filter and possibly pagination

**Create/edit forms**
- Side panel / drawer that slides in from the right (list stays visible behind)
- Same form layout for both create and edit (pre-filled when editing)
- Admin manually sets username + password when creating a tenant (shares credentials with seller out-of-band)
- Category (Kategorija) field is a fixed dropdown with predefined options (not free text)
- Fields: username, password, operator, company code (Im. kodas), store name (Parduotuve), category (Kategorija), space m2 (Patalpos), rent price EUR (Nuomos kaina)

**Revenue detail table**
- Tenant detail page has info header (store name, operator, category, space m2, rent) above the revenue table
- 12-month table always shows all months (Sausis-Gruodis)
- Auto-calculated columns (P.K, Apyvarta/m2, Efektyvumas) have subtle background tint to distinguish from entered data
- Efektyvumas (%) uses green/yellow/red color coding to indicate performance at a glance
- Months with no submitted data show zeros (0.00 for EUR, 0 for counts), dashes for calculated fields
- Vidurkis (average) row at the bottom
- Year selector to view different years

### Claude's Discretion
- Exact category list for the dropdown (derive from common shopping center tenant types)
- Efektyvumas color thresholds (what % is green vs yellow vs red)
- Table sorting defaults and available sort options
- Delete confirmation dialog style (modal vs inline)
- Pagination vs infinite scroll for the tenant list
- Validation error display style on forms
- Loading states and skeleton patterns

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TNNT-01 | Admin can view a list of all tenants with key info (store name, operator, category, space m², rent price) | shadcn DataTable + TanStack Table; server component fetches from `tenants` table via anon client (admin RLS policy); columns defined as `ColumnDef<Tenant>[]` |
| TNNT-02 | Admin can add a new tenant with fields: username, password, operator, company code, store name, category, space m², rent price | shadcn Sheet (side=right) + react-hook-form + zod; Server Action calls `supabase.auth.admin.createUser()` with service role client to create Supabase user with `app_metadata.role='seller'`, then inserts into `tenants` table with `user_id`; `revalidatePath('/admin/tenants')` refreshes list |
| TNNT-03 | Admin can edit any tenant's details | Same Sheet/form as TNNT-02, pre-filled via `defaultValues`; Server Action calls `supabase.from('tenants').update()` + `revalidatePath`; username/password edit handled via `supabase.auth.admin.updateUserById()` |
| TNNT-04 | Admin can remove a tenant (with confirmation) | shadcn AlertDialog for confirmation; Server Action calls `supabase.from('tenants').delete()` (CASCADE deletes auth user due to FK); `revalidatePath`; three-dot menu in table row triggers AlertDialog |
| TNNT-05 | Admin can view a single tenant detail page with yearly revenue breakdown table | Route `/admin/tenants/[id]`; server component fetches tenant + revenue_reports for year; plain HTML table with calculated columns; year selector via URL search param |
| TDTL-01 | Single tenant page shows yearly table with columns: Mėnuo, Nuomuojamas plotas (m²), Pirkimų sk., Apyvarta (EUR), P.K (EUR/m²), Apyvarta (EUR/m²), Efektyvumas (%) | Static HTML `<table>` with shadcn styling; columns built from 12-month data array; calculated columns computed in server component before render |
| TDTL-02 | Table shows all 12 months (Sausis–Gruodis) with data or zeros | Generate all 12 month slots server-side (Jan–Dec); merge with revenue_reports data for the year; missing months show zeros/dashes |
| TDTL-03 | P.K (EUR/m²) is auto-calculated: Nuomos kaina ÷ plotas | Pure math: `rent_eur / space_m2`; constant for all months (doesn't change per month); no user input |
| TDTL-04 | Apyvarta (EUR/m²) is auto-calculated: Apyvarta ÷ plotas | Per-month calc: `amount_eur / space_m2`; zero if no revenue submitted |
| TDTL-05 | Efektyvumas (%) is auto-calculated: (Apyvarta ÷ total monthly rent) × 100 | Per-month calc: `(amount_eur / rent_eur) * 100`; displayed with color badge (green/yellow/red) |
| TDTL-06 | Vidurkis (average) row at the bottom of the table | Compute averages server-side from the 12-month array; render as a `<tfoot>` row |
| TDTL-07 | Year selector to view different years | `<select>` or shadcn Select component; year change navigates to same route with `?year=YYYY`; server component reads `searchParams.year` |
</phase_requirements>

---

## Summary

Phase 2 builds on the auth + database foundation from Phase 1 to deliver the full tenant management surface. It has three distinct technical areas: (1) the tenant list page — a server-rendered data table with client-side sorting, category filtering, and three-dot row actions; (2) the create/edit side panel — a shadcn Sheet component containing a react-hook-form + zod form that calls Server Actions for CRUD and Supabase admin API for auth user management; and (3) the tenant detail page — a static server-rendered table with auto-calculated metrics, year selector, and color-coded efficiency display.

The most technically novel aspect of this phase is the seller account creation flow. When admin creates a tenant, two writes happen atomically in sequence: first, `supabase.auth.admin.createUser()` (service role client) creates the Supabase auth user with `app_metadata.role='seller'` and `email_confirm: true`; second, a `tenants` table row is inserted with the returned `user.id` as `user_id`. The service role admin client (`createClient` from `@supabase/supabase-js` with `SUPABASE_SERVICE_ROLE_KEY`) must be a separate singleton — never the SSR client from Phase 1. If the auth user is created but the tenants insert fails, orphaned auth users must be cleaned up.

The auto-calculated columns in the detail table (P.K, Apyvarta/m², Efektyvumas) are pure server-side math — never stored in the database and never entered by the admin. They are computed from `tenants.rent_eur`, `tenants.space_m2`, and `revenue_reports.amount_eur` fields that already exist in the Phase 1 schema. The 12-month table slots are generated in the server component by iterating months 1–12 and merging with whatever revenue data exists for the year.

**Primary recommendation:** Use shadcn Sheet (side="right") for create/edit, shadcn DataTable + TanStack Table for the list, shadcn AlertDialog for delete confirmation, and react-hook-form + zod for all form state. All mutations go through Server Actions with `revalidatePath`. Keep the admin service role client in a dedicated `lib/supabase/admin.ts` (server-only, never `NEXT_PUBLIC_`).

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@tanstack/react-table` | ^8.x | Data table state (sorting, filtering, pagination) | Official shadcn DataTable dependency; headless, composable |
| `react-hook-form` | ^7.x | Form state management | Official shadcn Form dependency; minimal re-renders, TypeScript-first |
| `zod` | ^3.x | Schema validation | Official shadcn Form dependency with zodResolver; used with react-hook-form |
| `@hookform/resolvers` | ^3.x | Bridges zod → react-hook-form | Required adapter for zodResolver |
| shadcn `Sheet` | bundled with shadcn | Slide-in side panel (right-side drawer) | Built on Radix Dialog; handles focus trap, close on Escape, accessibility |
| shadcn `AlertDialog` | bundled with shadcn | Delete confirmation modal | Blocks accidental deletion; built on Radix AlertDialog |
| shadcn `DataTable` | pattern from shadcn docs | Tenant list table | Headless TanStack Table + shadcn Table primitives |
| shadcn `Form` | bundled with shadcn | Accessible form fields with validation | Wraps react-hook-form; `FormMessage` auto-displays zod errors |
| shadcn `Select` | bundled with shadcn | Category dropdown | Radix-based; works with react-hook-form `Controller` pattern |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `lucide-react` | already installed (Phase 1) | `MoreHorizontal` icon for three-dot menu, `ChevronUp/Down` for sort | Already installed via Nova preset |
| shadcn `DropdownMenu` | already installed (Phase 1) | Three-dot row actions menu (Edit / Delete) | Paired with `MoreHorizontal` icon in actions column |
| shadcn `Badge` | add if not installed | Color-coded Efektyvumas display | Green/yellow/red semantic color variants |
| shadcn `Card` | already installed (Phase 1) | Tenant info header on detail page | Consistent with admin home summary cards |
| `@supabase/supabase-js` | already installed (Phase 1) | Service role admin client (`createClient`) | Needed for `auth.admin.createUser()` — separate from SSR client |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| shadcn Sheet | Custom drawer | Sheet is already in shadcn ecosystem, handles focus management, escape key, backdrop; no reason to build custom |
| react-hook-form + zod | Server Action-only with FormData | react-hook-form gives instant client-side validation feedback; important for a form with 8 fields including password |
| AlertDialog for delete | Inline confirm (e.g., button turns red) | AlertDialog is explicit, accessible, and the shadcn standard; inline confirm is easy to miss-click |
| TanStack Table client sorting | Server-side sorted queries | 30-100 tenants fits in one query; client-side sort is simpler and avoids extra round-trips for this scale |

**Installation (new packages for Phase 2 — others already present from Phase 1):**
```bash
npx shadcn@latest add data-table
npm install @tanstack/react-table
npx shadcn@latest add form
npm install react-hook-form @hookform/resolvers zod
npx shadcn@latest add sheet
npx shadcn@latest add alert-dialog
npx shadcn@latest add select
npx shadcn@latest add badge
```

---

## Architecture Patterns

### Recommended Project Structure (Phase 2 additions)

```
app/
└── (dashboard)/
    └── admin/
        ├── tenants/
        │   ├── page.tsx              # Tenant list — Server Component, fetches all tenants
        │   └── [id]/
        │       └── page.tsx          # Tenant detail — Server Component, fetches tenant + revenue
        └── page.tsx                  # Admin home (Phase 1 — wire real tenant count here)

actions/
└── tenants.ts                        # Server Actions: createTenant, updateTenant, deleteTenant

lib/
└── supabase/
    ├── client.ts                     # Phase 1 browser client (unchanged)
    ├── server.ts                     # Phase 1 server client (unchanged)
    └── admin.ts                      # NEW: service role admin client for auth.admin.*

components/
└── tenants/
    ├── tenants-table.tsx             # Client Component — DataTable with TanStack
    ├── tenant-columns.tsx            # Column definitions including actions column
    ├── tenant-form-sheet.tsx         # Client Component — Sheet + react-hook-form for create/edit
    ├── delete-tenant-dialog.tsx      # Client Component — AlertDialog for delete confirmation
    └── tenant-detail-table.tsx       # Server Component — 12-month revenue table
```

### Pattern 1: Service Role Admin Client (lib/supabase/admin.ts)

**What:** A separate Supabase client created with the service role key. Used only in Server Actions to call `auth.admin.*` methods. Never imported in Client Components.

**Critical rules:**
- Use `createClient` from `@supabase/supabase-js` (not `@supabase/ssr`)
- Disable `persistSession`, `autoRefreshToken`, `detectSessionInUrl`
- `SUPABASE_SERVICE_ROLE_KEY` must NOT have `NEXT_PUBLIC_` prefix (set in Phase 1)
- This file must never be imported in Client Components (no `'use client'` boundary crossing)

```typescript
// lib/supabase/admin.ts — SERVER ONLY, never import in Client Components
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // No NEXT_PUBLIC_ prefix
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  )
}
```

### Pattern 2: Tenant CRUD Server Actions (actions/tenants.ts)

**What:** Server Actions for create, update, delete. Each action verifies the caller is admin (defense-in-depth), performs the operation, and calls `revalidatePath` to refresh the tenant list.

**Create tenant flow (two-step write):**
1. Call `adminClient.auth.admin.createUser()` with `email_confirm: true` and `app_metadata: { role: 'seller' }`
2. If step 1 succeeds, insert into `tenants` table with `user_id` from step 1
3. If step 2 fails, call `adminClient.auth.admin.deleteUser(user.id)` to clean up orphaned auth user

```typescript
// actions/tenants.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createTenant(formData: {
  username: string
  password: string
  store_name: string
  operator: string
  company_code: string
  category: string
  space_m2: number
  rent_eur: number
}) {
  // Defense-in-depth: verify admin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== 'admin') {
    redirect('/login')
  }

  const adminClient = createAdminClient()

  // Step 1: Create Supabase auth user for seller
  // Username is stored as email: username@pceuropa.lt (matches Phase 1 login convention)
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: `${formData.username}@pceuropa.lt`,
    password: formData.password,
    email_confirm: true,  // No email confirmation flow — admin manages credentials
    app_metadata: { role: 'seller' },
  })

  if (authError || !authData.user) {
    return { error: authError?.message ?? 'Nepavyko sukurti vartotojo' }
  }

  // Step 2: Insert tenant record
  const { error: tenantError } = await supabase
    .from('tenants')
    .insert({
      user_id: authData.user.id,
      store_name: formData.store_name,
      operator: formData.operator,
      company_code: formData.company_code,
      category: formData.category,
      space_m2: formData.space_m2,
      rent_eur: formData.rent_eur,
    })

  if (tenantError) {
    // Cleanup orphaned auth user
    await adminClient.auth.admin.deleteUser(authData.user.id)
    return { error: 'Nepavyko išsaugoti nuomininko duomenų' }
  }

  revalidatePath('/admin/tenants')
  return { success: true }
}

export async function updateTenant(
  tenantId: string,
  formData: Partial<{
    store_name: string
    operator: string
    company_code: string
    category: string
    space_m2: number
    rent_eur: number
  }>
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== 'admin') redirect('/login')

  const { error } = await supabase
    .from('tenants')
    .update(formData)
    .eq('id', tenantId)

  if (error) return { error: error.message }

  revalidatePath('/admin/tenants')
  return { success: true }
}

export async function deleteTenant(tenantId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== 'admin') redirect('/login')

  // Fetch tenant to get user_id for auth user cleanup
  const { data: tenant } = await supabase
    .from('tenants')
    .select('user_id')
    .eq('id', tenantId)
    .single()

  const { error } = await supabase
    .from('tenants')
    .delete()
    .eq('id', tenantId)

  if (error) return { error: error.message }

  // Delete auth user (CASCADE on FK would also work, but explicit is safer)
  if (tenant?.user_id) {
    const adminClient = createAdminClient()
    await adminClient.auth.admin.deleteUser(tenant.user_id)
  }

  revalidatePath('/admin/tenants')
  return { success: true }
}
```

### Pattern 3: DataTable with TanStack Table + Three-Dot Row Actions

**What:** The tenant list page is a Server Component that fetches tenants and passes them to a Client Component `TenantsTable`. Columns are defined in a separate file. The actions column uses a `DropdownMenu` with `MoreHorizontal` icon.

**Key structure:** `page.tsx` (Server Component) → fetches data → renders `<TenantsTable>` (Client Component).

```typescript
// app/(dashboard)/admin/tenants/page.tsx — Server Component
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TenantsTable } from '@/components/tenants/tenants-table'
import { columns } from '@/components/tenants/tenant-columns'

export default async function TenantsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== 'admin') redirect('/login')

  const { data: tenants } = await supabase
    .from('tenants')
    .select('*')
    .order('store_name')

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Nuomininkai</h1>
        {/* Add button triggers Sheet — handled in TenantsTable */}
      </div>
      <TenantsTable columns={columns} data={tenants ?? []} />
    </div>
  )
}
```

```typescript
// components/tenants/tenant-columns.tsx — Client Component
'use client'
import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import type { Database } from '@/types/database'

type Tenant = Database['public']['Tables']['tenants']['Row']

export const columns: ColumnDef<Tenant>[] = [
  {
    accessorKey: 'store_name',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Parduotuvė <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: 'operator',
    header: 'Operatorius',
  },
  {
    accessorKey: 'category',
    header: 'Kategorija',
  },
  {
    accessorKey: 'space_m2',
    header: 'Plotas (m²)',
  },
  {
    accessorKey: 'rent_eur',
    header: 'Nuomos kaina (EUR)',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('rent_eur'))
      return <div>{amount.toFixed(2)}</div>
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const tenant = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Atidaryti meniu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => { /* trigger edit sheet */ }}>
              Redaguoti
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => { /* trigger delete dialog */ }}
              className="text-destructive"
            >
              Ištrinti
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
```

### Pattern 4: Tenant Form Sheet (Sheet + react-hook-form + zod)

**What:** A `Sheet` sliding in from the right, containing an 8-field form. Same component handles both create (empty) and edit (pre-filled). Opened by "Add" button and by "Edit" in the row actions menu. Uses `useTransition` to show pending state during Server Action submission.

```typescript
// components/tenants/tenant-form-sheet.tsx
'use client'
import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createTenant, updateTenant } from '@/actions/tenants'
import { TENANT_CATEGORIES } from '@/lib/strings'

const tenantSchema = z.object({
  username: z.string().min(3, 'Vartotojo vardas per trumpas'),
  password: z.string().min(6, 'Slaptažodis per trumpas'),
  store_name: z.string().min(1, 'Privalomas laukas'),
  operator: z.string().optional(),
  company_code: z.string().optional(),
  category: z.string().min(1, 'Pasirinkite kategoriją'),
  space_m2: z.coerce.number().positive('Turi būti teigiamas skaičius'),
  rent_eur: z.coerce.number().positive('Turi būti teigiamas skaičius'),
})

type TenantFormValues = z.infer<typeof tenantSchema>

interface TenantFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenant?: TenantFormValues & { id: string } | null
}

export function TenantFormSheet({ open, onOpenChange, tenant }: TenantFormSheetProps) {
  const [isPending, startTransition] = useTransition()
  const isEditing = !!tenant

  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema),
    defaultValues: tenant ?? {
      username: '', password: '', store_name: '', operator: '',
      company_code: '', category: '', space_m2: 0, rent_eur: 0,
    },
  })

  function onSubmit(values: TenantFormValues) {
    startTransition(async () => {
      const result = isEditing
        ? await updateTenant(tenant!.id, values)
        : await createTenant(values)
      if (result.success) {
        onOpenChange(false)
        form.reset()
      }
      // TODO: display result.error in form if present
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Redaguoti nuomininką' : 'Naujas nuomininkas'}</SheetTitle>
          <SheetDescription>
            {isEditing ? 'Keiskite nuomininko duomenis' : 'Užpildykite naujojo nuomininko duomenis'}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
            <FormField control={form.control} name="username" render={({ field }) => (
              <FormItem>
                <FormLabel>Vartotojo vardas</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            {/* ... remaining fields following same pattern ... */}
            <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem>
                <FormLabel>Kategorija</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Pasirinkite" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TENANT_CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saugoma...' : isEditing ? 'Išsaugoti' : 'Sukurti'}
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
```

### Pattern 5: Tenant Detail Page — 12-Month Revenue Table

**What:** A Server Component at `/admin/tenants/[id]` that fetches the tenant record and all revenue_reports for the selected year. Generates all 12 month slots, merges with submitted data, computes calculated columns, renders as a styled HTML table.

**Year selector:** A `<select>` with years (current year ± 2). Changing year navigates to `?year=YYYY`. Server component reads `searchParams.year` to filter revenue queries.

```typescript
// app/(dashboard)/admin/tenants/[id]/page.tsx — Server Component
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const MONTHS_LT = ['Sausis','Vasaris','Kovas','Balandis','Gegužė','Birželis',
                   'Liepa','Rugpjūtis','Rugsėjis','Spalis','Lapkritis','Gruodis']

export default async function TenantDetailPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { year?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== 'admin') redirect('/login')

  const year = parseInt(searchParams.year ?? String(new Date().getFullYear()))

  const [{ data: tenant }, { data: reports }] = await Promise.all([
    supabase.from('tenants').select('*').eq('id', params.id).single(),
    supabase.from('revenue_reports')
      .select('*')
      .eq('tenant_id', params.id)
      .gte('month', `${year}-01-01`)
      .lte('month', `${year}-12-31`),
  ])

  if (!tenant) redirect('/admin/tenants')

  // Build 12-month table data
  const tableRows = Array.from({ length: 12 }, (_, i) => {
    const monthDate = `${year}-${String(i + 1).padStart(2, '0')}-01`
    const report = reports?.find(r => r.month === monthDate)

    const amount = report?.amount_eur ?? 0
    const txCount = report?.tx_count ?? 0
    const hasData = !!report

    const pk = tenant.rent_eur && tenant.space_m2
      ? tenant.rent_eur / tenant.space_m2
      : null
    const apyvartaM2 = hasData && tenant.space_m2
      ? amount / tenant.space_m2
      : null
    const efektyvumas = hasData && tenant.rent_eur
      ? (amount / tenant.rent_eur) * 100
      : null

    return {
      month: MONTHS_LT[i],
      space_m2: tenant.space_m2,
      tx_count: hasData ? txCount : 0,
      amount_eur: hasData ? amount : 0,
      pk,                // null = show dash if no tenant data
      apyvarta_m2: apyvartaM2,
      efektyvumas,
    }
  })

  // Compute averages (only months with data)
  const dataMonths = tableRows.filter(r => r.amount_eur > 0)
  const avgRow = {
    amount_eur: dataMonths.length
      ? dataMonths.reduce((s, r) => s + r.amount_eur, 0) / dataMonths.length
      : 0,
    // ... other averages
  }

  return (
    <div className="p-6">
      {/* Tenant info header */}
      {/* Year selector */}
      {/* Revenue table */}
    </div>
  )
}
```

### Pattern 6: Efektyvumas Color Coding (Claude's Discretion)

**What:** Efektyvumas (%) displays as a colored badge. Thresholds recommended:
- Green: ≥ 100% (revenue covers rent fully)
- Yellow: 70–99% (partial coverage)
- Red: < 70% (poor performance)

```typescript
function efektyvumasBadge(pct: number | null) {
  if (pct === null) return <span className="text-muted-foreground">—</span>
  const variant =
    pct >= 100 ? 'bg-green-100 text-green-800' :
    pct >= 70  ? 'bg-yellow-100 text-yellow-800' :
                 'bg-red-100 text-red-800'
  return <span className={`px-2 py-0.5 rounded text-sm font-medium ${variant}`}>{pct.toFixed(1)}%</span>
}
```

### Pattern 7: Category List (Claude's Discretion)

Derived from common Lithuanian shopping center tenant categories. Add to `lib/strings.ts`:

```typescript
export const TENANT_CATEGORIES = [
  'Mada ir apranga',
  'Maistas ir restoranai',
  'Elektronika',
  'Sportas ir laisvalaikis',
  'Grožis ir sveikata',
  'Namų apyvoka',
  'Žaislai ir vaikų prekės',
  'Juvelyrika ir aksesuarai',
  'Paslaugos',
  'Kita',
] as const
```

### Anti-Patterns to Avoid

- **Calling `auth.admin.*` from the SSR client:** The SSR client uses the anon key — it does not have admin privileges. `auth.admin.createUser()` requires the service role client from `lib/supabase/admin.ts`.
- **Using `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`:** Exposes the key to the browser. Must be `SUPABASE_SERVICE_ROLE_KEY` (no `NEXT_PUBLIC_` prefix).
- **Skipping orphan cleanup:** If tenant insert fails after auth user creation, the auth user must be deleted explicitly. CASCADE FK handles the reverse (tenant delete → auth user remains unless explicitly deleted).
- **Storing calculated fields (P.K, Apyvarta/m², Efektyvumas) in the database:** These are pure math from existing columns. Never add columns for them; compute at render time.
- **Mixing create/edit form state in the columns file:** Columns are a static array — row actions should call state-lifting callbacks to the parent `TenantsTable` component which manages the `selectedTenant` + `sheetOpen` state.
- **Forgetting `revalidatePath` after mutations:** Without it, the tenant list shows stale data after create/update/delete. Always call `revalidatePath('/admin/tenants')` at the end of each successful Server Action.
- **Using `router.refresh()` instead of `revalidatePath` in Server Actions:** `router.refresh()` is a Client Component API; `revalidatePath` is the Server Action equivalent. They have different scopes — use `revalidatePath` in `'use server'` actions.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Side panel for forms | Custom drawer with CSS transforms | shadcn `Sheet` | Handles focus trap, Escape key, ARIA attributes, backdrop, open/close animation |
| Form validation with errors | Manual state + conditional renders | react-hook-form + zod + shadcn `Form` | `FormMessage` auto-wires zod errors to fields; handles touched/dirty/error states |
| Delete confirmation | Button state machine (first click = confirm state) | shadcn `AlertDialog` | Accessible blocking dialog; prevents accidental deletion; already in shadcn ecosystem |
| Table sorting/filtering | Manual array sort + filter functions | TanStack Table `getSortedRowModel`, `getFilteredRowModel` | Handles multi-column sort, filter debouncing, pagination state — complex edge cases |
| Auth user creation | Custom auth solution | `supabase.auth.admin.createUser()` | Service role API handles password hashing, email normalization, session setup |
| Computed metric display | Database columns for P.K/Efektyvumas | Pure JS math at render | No database bloat; always consistent; Phase 3 revenue writes don't need to update calculated columns |

**Key insight:** The Sheet + react-hook-form + zod stack is the standard shadcn admin form pattern. Every component in it is already wired together by shadcn's Form component — building any part from scratch would duplicate accessibility work that's already done.

---

## Common Pitfalls

### Pitfall 1: Auth User Created but Tenant Insert Fails (Orphaned User)

**What goes wrong:** Admin creates tenant. Supabase auth user is created successfully (step 1), but the `tenants` insert fails (step 2 — e.g., DB constraint, timeout). The auth user now exists but has no corresponding `tenants` row. The seller login will authenticate but the app will find no tenant data.

**Why it happens:** Two writes in sequence without a transaction. Supabase does not support cross-service transactions (auth + database).

**How to avoid:** In the Server Action, if step 2 fails, explicitly call `adminClient.auth.admin.deleteUser(authData.user.id)` before returning the error. Document this cleanup in a code comment.

**Warning signs:** Seller can log in but sees no tenant data; auth.users table has users with no corresponding tenants row.

### Pitfall 2: Edit Form Closes But Data Doesn't Refresh

**What goes wrong:** Admin edits a tenant, form closes, but the list still shows old data. Looks like the action didn't work even though it did.

**Why it happens:** `revalidatePath` was not called in the Server Action, or was called with the wrong path.

**How to avoid:** Always call `revalidatePath('/admin/tenants')` at the end of all successful mutations. Also call it in delete actions. If the detail page is open, also call `revalidatePath('/admin/tenants/[id]', 'page')`.

### Pitfall 3: Sheet State Management — Selected Tenant Not Cleared

**What goes wrong:** Admin opens Sheet for "Edit Tenant A", closes it. Then opens Sheet for "Add new tenant". The form still shows Tenant A's data because `selectedTenant` was not reset.

**Why it happens:** The `TenantsTable` component tracks `selectedTenant` state. When Sheet closes (via cancel or success), `selectedTenant` must be reset to `null`.

**How to avoid:** In `onOpenChange(false)` handler, set `selectedTenant` to `null` and call `form.reset()`. These are two separate state resets — missing either one causes stale form data.

### Pitfall 4: Category Filter with TanStack Table

**What goes wrong:** Admin filters by category but TanStack Table filters on the wrong column key or is not initialized with `getFilteredRowModel`.

**Why it happens:** TanStack Table filtering requires `getFilteredRowModel()` in the `useReactTable` options AND the filter input must call `table.getColumn('category')?.setFilterValue(value)` using the exact `accessorKey` string.

**How to avoid:** Initialize `useReactTable` with `getFilteredRowModel: getFilteredRowModel()`. Use the exact `accessorKey` value ('category') when calling `setFilterValue`.

### Pitfall 5: Tenant Detail Year Selector — searchParams vs State

**What goes wrong:** Year selector changes year but the table doesn't update because it's reading from component state instead of URL `searchParams`.

**Why it happens:** Server Components cannot hold state — year selection must be encoded in the URL. Using a client-side `useState` for year would require re-fetching data client-side, which is more complex.

**How to avoid:** Year selector navigates to `?year=YYYY` (use `router.push` or a `<form>` with a GET action). The Server Component reads `searchParams.year`. This keeps the page SSR-rendered, URL shareable, and data always fresh on navigation.

### Pitfall 6: P.K Calculation Edge Cases

**What goes wrong:** P.K (Nuomos kaina ÷ plotas) divides by zero when `space_m2` is null or 0. Same for Apyvarta/m² and Efektyvumas when `space_m2` or `rent_eur` is null.

**Why it happens:** The `tenants` schema has `space_m2` and `rent_eur` as nullable `numeric` columns (not NOT NULL).

**How to avoid:** Guard all divisions with null/zero checks:
```typescript
const pk = tenant.rent_eur && tenant.space_m2 && tenant.space_m2 > 0
  ? tenant.rent_eur / tenant.space_m2
  : null
```
Display `null` as "—" in the table. Consider adding Zod validation on the form to require non-zero positive values for these fields.

---

## Code Examples

Verified patterns from official sources:

### Supabase auth.admin.createUser with app_metadata
```typescript
// Source: Supabase JS Reference — https://supabase.com/docs/reference/javascript/auth-admin-createuser
const { data, error } = await supabase.auth.admin.createUser({
  email: 'seller@pceuropa.lt',
  password: 'temporary-password',
  email_confirm: true,                    // Skip email confirmation flow
  app_metadata: { role: 'seller' },       // Secure — users cannot self-modify app_metadata
})
// data.user.id → use as user_id in tenants table insert
```

### shadcn Sheet basic usage
```typescript
// Source: shadcn/ui Sheet docs — https://ui.shadcn.com/docs/components/sheet
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

<Sheet open={open} onOpenChange={setOpen}>
  <SheetTrigger asChild>
    <Button>Naujas nuomininkas</Button>
  </SheetTrigger>
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>Naujas nuomininkas</SheetTitle>
    </SheetHeader>
    {/* Form content */}
  </SheetContent>
</Sheet>
```

### shadcn AlertDialog for delete confirmation
```typescript
// Source: shadcn/ui AlertDialog docs — https://ui.shadcn.com/docs/components/alert-dialog
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

<AlertDialog>
  <AlertDialogTrigger asChild>
    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Ištrinti</DropdownMenuItem>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Ištrinti nuomininką?</AlertDialogTitle>
      <AlertDialogDescription>
        Šio veiksmo negalima atšaukti. Nuomininko duomenys bus ištrinti visam laikui.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Atšaukti</AlertDialogCancel>
      <AlertDialogAction onClick={() => deleteTenant(tenant.id)}>Ištrinti</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

**Important gotcha with DropdownMenuItem + AlertDialog:** `DropdownMenuItem` closes the dropdown on select — call `e.preventDefault()` in `onSelect` to prevent the dropdown from closing before the AlertDialog opens.

### TanStack Table DataTable component (core pattern)
```typescript
// Source: shadcn/ui DataTable docs — https://ui.shadcn.com/docs/components/data-table
'use client'
import {
  ColumnDef, SortingState, ColumnFiltersState,
  useReactTable, getCoreRowModel, getSortedRowModel,
  getFilteredRowModel, getPaginationRowModel, flexRender,
} from '@tanstack/react-table'
import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function DataTable<TData, TValue>({
  columns,
  data,
}: {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: { sorting, columnFilters },
  })

  return (
    <div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map(row => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
```

### react-hook-form + zod + shadcn Form field (Select example)
```typescript
// Source: shadcn/ui Form docs — https://ui.shadcn.com/docs/components/form
<FormField
  control={form.control}
  name="category"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Kategorija</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Pasirinkite kategoriją" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {TENANT_CATEGORIES.map(cat => (
            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```

### revalidatePath in Server Actions
```typescript
// Source: Next.js docs — https://nextjs.org/docs/app/api-reference/functions/revalidatePath
import { revalidatePath } from 'next/cache'

// After any tenant mutation:
revalidatePath('/admin/tenants')

// After updating a specific tenant (also invalidates detail page):
revalidatePath(`/admin/tenants/${tenantId}`)
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@supabase/auth-helpers-nextjs` | `@supabase/ssr` | 2024 | Already addressed in Phase 1; service role client uses `@supabase/supabase-js` directly (no SSR wrapper needed for admin client) |
| `getServerSideProps` + API routes for CRUD | Next.js Server Actions | Next.js 13+ | `'use server'` actions replace API routes for mutations; `revalidatePath` replaces manual cache invalidation |
| React Table v7 (react-table) | TanStack Table v8 (@tanstack/react-table) | 2022 | Package renamed; shadcn DataTable docs use v8; API is different from v7 |
| `form.handleSubmit` → fetch to API route | `form.handleSubmit` → Server Action via `useTransition` | Next.js 14+ | Server Actions can be called directly from Client Components; `useTransition` provides `isPending` state |

**Deprecated/outdated:**
- `react-table` (v7): Renamed to `@tanstack/react-table` (v8). Different package name, different API. Never install `react-table` — always `@tanstack/react-table`.
- Inline DropdownMenuTrigger inside `AlertDialogTrigger`: Does not work due to nested Radix portals. The correct pattern is to track open state separately and use the three-dot `onSelect` + `e.preventDefault()` to open the AlertDialog via state.

---

## Open Questions

1. **Auth user update on tenant edit (username/password change)**
   - What we know: `updateTenant` Server Action updates the `tenants` table row. But if admin also wants to change the seller's username or password, that requires `adminClient.auth.admin.updateUserById(user_id, { email, password })`.
   - What's unclear: Should Phase 2 support changing username/password during edit, or only tenant metadata (store name, category, etc.)?
   - Recommendation: For Phase 2, allow editing all tenant metadata fields but make username/password read-only in the edit form (admin can reset password separately via Supabase dashboard). Add a clear note in the UI: "Norėdami pakeisti slaptažodį, naudokite Supabase valdymo skydelį." This avoids the complexity of the two-step auth update while keeping Phase 2 scope clean.

2. **Pagination vs infinite scroll for tenant list**
   - What we know: 30-100 tenants expected. TanStack Table has built-in pagination (`getPaginationRowModel`). Claude's discretion per CONTEXT.md.
   - Recommendation: Use TanStack Table client-side pagination at 20 rows/page. With ≤100 tenants, the full dataset is fetched once — client-side pagination is simpler than server-side and avoids additional queries. Add the category column filter as a text filter above the table.

3. **Deleting auth user when tenant is deleted**
   - What we know: `tenants.user_id` has `ON DELETE CASCADE` from auth.users — meaning deleting the auth user cascades to the tenant row. But the reverse (deleting tenant) does NOT cascade to auth user.
   - What's unclear: Should tenant delete also delete the seller's ability to log in? Most likely yes — deleted tenant should not be able to log in.
   - Recommendation: In `deleteTenant` Server Action, explicitly call `adminClient.auth.admin.deleteUser(tenant.user_id)` after the tenant row delete. This is safe because the FK cascade only goes one direction.

---

## Sources

### Primary (HIGH confidence)
- [Supabase auth.admin.createUser docs](https://supabase.com/docs/reference/javascript/auth-admin-createuser) — `createUser()` parameters including `app_metadata`, `email_confirm`; service-role-only requirement
- [Supabase Admin API reference](https://supabase.com/docs/reference/javascript/admin-api) — admin client setup with service role
- [Supabase performing admin tasks guide](https://supabase.com/docs/guides/troubleshooting/performing-administration-tasks-on-the-server-side-with-the-servicerole-secret-BYM4Fa) — service role client configuration (`persistSession: false`, `autoRefreshToken: false`, `detectSessionInUrl: false`)
- [shadcn/ui DataTable docs](https://ui.shadcn.com/docs/components/data-table) — TanStack Table integration, column definitions, sorting, filtering, row actions with DropdownMenu
- [shadcn/ui Sheet docs](https://ui.shadcn.com/docs/components/sheet) — Sheet sub-components, `side` prop, usage pattern
- [shadcn/ui Form docs](https://ui.shadcn.com/docs/components/form) — react-hook-form + zod integration, FormField, FormMessage
- [shadcn/ui AlertDialog docs](https://ui.shadcn.com/docs/components/alert-dialog) — delete confirmation pattern
- [Next.js revalidatePath docs](https://nextjs.org/docs/app/api-reference/functions/revalidatePath) — cache invalidation after Server Action mutations

### Secondary (MEDIUM confidence)
- [Supabase Managing User Data guide](https://supabase.com/docs/guides/auth/managing-user-data) — `app_metadata` vs `user_metadata` distinction, role security model
- [shadcn/ui patterns: dropdown-menu-actions-2](https://www.shadcn.io/patterns/dropdown-menu-actions-2) — row-level actions with DropdownMenu in data tables

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries sourced from official shadcn/ui docs and Supabase JS reference
- Architecture: HIGH — patterns follow official Next.js Server Actions + Supabase SSR documentation
- Pitfalls: HIGH — orphan cleanup pattern verified from Supabase admin API docs; revalidatePath behavior from Next.js docs; form state issues from react-hook-form patterns
- Calculated metrics: HIGH — pure math from schema columns already defined in Phase 1 migration

**Research date:** 2026-02-25
**Valid until:** 2026-03-25 (shadcn, TanStack Table v8, react-hook-form v7, and Supabase admin API are stable; re-check if major version bumps occur)
