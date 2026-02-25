---
phase: 02-tenant-management
plan: 01
subsystem: ui
tags: [tanstack-table, react-hook-form, zod, shadcn, supabase, server-actions, nextjs]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Supabase schema with tenants table, RLS policies, TypeScript Database types, Next.js scaffold with auth utilities
provides:
  - Admin tenant CRUD UI at /admin/tenants with sortable DataTable
  - Server Actions for createTenant, updateTenant, deleteTenant with admin auth checks
  - Service role admin client in lib/supabase/admin.ts for auth.admin.* operations
  - Lithuanian constants (TENANT_CATEGORIES, MONTHS_LT) in lib/constants.ts
  - Zod validation schema for tenant form with Lithuanian error messages
affects: [03-analytics, 04-settings, seller-revenue-submission]

# Tech tracking
tech-stack:
  added:
    - "@tanstack/react-table v8 — headless DataTable with sort, filter, pagination"
    - "react-hook-form v7 — form state management"
    - "@hookform/resolvers v5 — zod resolver for react-hook-form"
    - "zod v4 — form validation with Lithuanian error messages"
    - "shadcn table, alert-dialog, select, form, badge components"
  patterns:
    - "Column factory pattern: getColumns(onEdit, onDelete) keeps column definitions stateless"
    - "Server Action defense-in-depth: every action calls getUser() + app_metadata.role check independently"
    - "Atomic tenant creation: auth user + tenant record; cleanup orphan on step 2 failure"
    - "String-based form schema for numeric fields (space_m2, rent_eur) to avoid Zod v4 + react-hook-form type mismatch; parsed to float in Server Actions"

key-files:
  created:
    - lib/supabase/admin.ts
    - lib/constants.ts
    - lib/validations/tenant.ts
    - actions/tenants.ts
    - components/tenants/tenant-columns.tsx
    - components/tenants/tenants-table.tsx
    - components/tenants/tenant-form-sheet.tsx
    - components/tenants/delete-tenant-dialog.tsx
    - app/(dashboard)/admin/tenants/page.tsx
    - components/ui/table.tsx
    - components/ui/alert-dialog.tsx
    - components/ui/select.tsx
    - components/ui/form.tsx
    - components/ui/badge.tsx
  modified:
    - actions/tenants.ts (updated after schema change)
    - lib/validations/tenant.ts (updated for type compatibility)
    - package.json

key-decisions:
  - "Tenant form uses string types for space_m2/rent_eur fields — Zod v4 z.coerce.number() infers unknown input type, breaking react-hook-form resolver generics; strings parsed to float in Server Actions"
  - "Column factory pattern getColumns(onEdit, onDelete) — avoids mixing state into column definitions, keeps columns stateless and reusable"
  - "Atomic tenant creation with orphan cleanup — if auth user created but tenant insert fails, admin.deleteUser() is called immediately to prevent ghost accounts"

patterns-established:
  - "Pattern: TenantFormValues uses string for numeric fields — validate with refine(v => !isNaN(parseFloat(v)) && parseFloat(v) > 0), parse in Server Actions with parseFloat()"
  - "Pattern: Server Action admin guard — const { data: { user } } = await supabase.auth.getUser(); if (!user || user.app_metadata?.role !== 'admin') return { error: '...' }"
  - "Pattern: DataTable with getColumns factory — getColumns(handleEdit, handleDelete) returns ColumnDef[] with callbacks injected"

requirements-completed: [TNNT-01, TNNT-02, TNNT-03, TNNT-04]

# Metrics
duration: 25min
completed: 2026-02-25
---

# Phase 2 Plan 01: Tenant Management Summary

**TanStack DataTable with sortable columns and category filter, Sheet drawer form for create/edit via react-hook-form + Zod v4, AlertDialog delete confirmation, Supabase admin client Server Actions with atomic auth user + tenant record creation**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-02-25T16:00:00Z
- **Completed:** 2026-02-25T16:26:56Z
- **Tasks:** 2 of 2 complete
- **Files modified:** 14

## Accomplishments
- Full tenant CRUD at /admin/tenants — DataTable with sorting, category filter, 20 rows/page pagination, all labels in Lithuanian
- Side drawer (Sheet) form for create/edit: react-hook-form + Zod, hides username/password fields when editing, pre-fills data from existing tenant
- Delete AlertDialog with useTransition for async Server Action, removes both tenant record and auth user
- Service role admin client in lib/supabase/admin.ts — uses SUPABASE_SERVICE_ROLE_KEY (no NEXT_PUBLIC_ prefix), persistSession/autoRefreshToken/detectSessionInUrl all disabled
- Atomic tenant creation: step 1 creates auth user, step 2 inserts tenant record; on step 2 failure the orphaned auth user is deleted immediately

## Task Commits

Each task was committed atomically:

1. **Task 1: Admin client, constants, validation schema, and Server Actions** - `fcce062` (feat)
2. **Task 2: Tenant list page with DataTable, form Sheet, and delete AlertDialog** - `5c88787` (feat)

## Files Created/Modified
- `lib/supabase/admin.ts` - Service role admin client, persistSession/autoRefreshToken/detectSessionInUrl disabled
- `lib/constants.ts` - TENANT_CATEGORIES (10 Lithuanian categories) and MONTHS_LT arrays
- `lib/validations/tenant.ts` - Zod v4 schema with Lithuanian error messages; numeric fields as strings with refine validation
- `actions/tenants.ts` - createTenant, updateTenant, deleteTenant Server Actions with defense-in-depth admin check
- `components/tenants/tenant-columns.tsx` - getColumns() factory with sort, operator, category, space, rent columns, actions DropdownMenu
- `components/tenants/tenants-table.tsx` - TanStack useReactTable with sorting, category filter Select, pagination, row click navigation
- `components/tenants/tenant-form-sheet.tsx` - Sheet with react-hook-form + zodResolver, create/edit modes, error display
- `components/tenants/delete-tenant-dialog.tsx` - AlertDialog with useTransition, calls deleteTenant Server Action
- `app/(dashboard)/admin/tenants/page.tsx` - Server Component, admin auth check, fetch tenants ordered by store_name, renders TenantsTable
- `components/ui/table.tsx`, `alert-dialog.tsx`, `select.tsx`, `form.tsx`, `badge.tsx` - New shadcn components added

## Decisions Made
- Used string types for `space_m2` and `rent_eur` in TenantFormValues to avoid Zod v4 `z.coerce.number()` type inference issue (`unknown` input type) that breaks react-hook-form resolver generics. Values are parsed to `parseFloat()` in Server Actions before writing to database.
- Used column factory `getColumns(onEdit, onDelete)` pattern so column definitions are stateless and callbacks flow from the parent TenantsTable component that owns the state.
- Atomic creation with orphan cleanup: auth user created first (step 1), tenant inserted second (step 2). If step 2 fails, `auth.admin.deleteUser()` is called immediately to avoid ghost auth accounts.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Zod v4 + react-hook-form type incompatibility**
- **Found during:** Task 1 (validation schema creation) + Task 2 (form component)
- **Issue:** Zod v4 `z.coerce.number()` infers `unknown` as the input type in TypeScript, causing react-hook-form resolver generics to reject the schema with multiple Control/Resolver type errors
- **Fix:** Changed `space_m2` and `rent_eur` from `z.coerce.number()` to `z.string().refine(v => !isNaN(parseFloat(v)) && parseFloat(v) > 0, ...)`. Server Actions parse string to float with `parseFloat()`.
- **Files modified:** `lib/validations/tenant.ts`, `actions/tenants.ts`, `components/tenants/tenant-form-sheet.tsx`
- **Verification:** `npx tsc --noEmit` passes with zero errors
- **Committed in:** `5c88787` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — Bug)
**Impact on plan:** The fix is functionally equivalent — form validation still prevents non-numeric or negative values, Server Actions still receive numbers for database insertion. No scope creep.

## Issues Encountered
- Zod v4 changed the `z.number()` params API — `invalid_type_error` no longer valid. Fixed by removing that param (minor, fixed inline before Task 1 commit).

## User Setup Required
None — no external service configuration required beyond what was established in Phase 1.

## Next Phase Readiness
- Tenant CRUD is fully functional — sellers can be created and will have auth users they can log in with immediately
- /admin/tenants page is ready with working list, add, edit, delete
- lib/constants.ts has MONTHS_LT ready for Phase 3 analytics (revenue chart month labels)
- All TNNT-01 through TNNT-04 requirements satisfied

## Self-Check: PASSED

All files created and verified to exist. Both task commits (fcce062, 5c88787) confirmed in git log.

---
*Phase: 02-tenant-management*
*Completed: 2026-02-25*
