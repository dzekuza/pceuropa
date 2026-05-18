---
phase: 03-revenue-analytics-faq
plan: 03
subsystem: ui
tags: [faq, shadcn, server-actions, accordion, supabase, zod, react-hook-form]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Supabase server client, auth pattern (getUser + app_metadata.role), types/database.ts with FaqItem type
  - phase: 02-tenant-management
    provides: Component patterns (AlertDialog delete confirmation, Dialog form, shadcn Form with zodResolver)
provides:
  - Admin FAQ CRUD at /admin/faq (create, edit, delete, move up/down reorder)
  - Seller read-only FAQ accordion at /seller/faq
  - Server Actions: createFaqItem, updateFaqItem, deleteFaqItem, reorderFaqItems
  - Zod schema faqFormSchema in lib/validations/faq.ts
affects: [seller-dashboard, navigation]

# Tech tracking
tech-stack:
  added: [shadcn/dialog, shadcn/textarea, shadcn/accordion]
  patterns: [admin-guard-server-action, optimistic-reorder, read-only-accordion]

key-files:
  created:
    - lib/validations/faq.ts
    - actions/faq.ts
    - app/(dashboard)/admin/faq/page.tsx
    - components/faq/faq-admin-list.tsx
    - components/faq/faq-form-dialog.tsx
    - components/faq/delete-faq-dialog.tsx
    - app/(dashboard)/seller/faq/page.tsx
    - components/faq/faq-reader.tsx
    - components/ui/dialog.tsx
    - components/ui/textarea.tsx
    - components/ui/accordion.tsx
  modified: []

key-decisions:
  - "reorderFaqItems uses a simple loop with individual updates — FAQ lists are small (<20 items), simplicity preferred over batch upsert"
  - "FaqAdminList uses optimistic local state for reorder — swap happens instantly in UI, then server action persists"
  - "Seller FAQ page checks role === 'seller' (not just authenticated) — defense-in-depth per project auth pattern"
  - "reorderFaqItems revalidates both /admin/faq and /seller/faq — ensures seller view reflects admin changes immediately"

patterns-established:
  - "Dialog form pattern: Dialog + react-hook-form + zodResolver + useTransition — mirrors Sheet pattern from tenant form"
  - "Delete confirmation: AlertDialog with useTransition loading state on confirm button — same as delete-tenant-dialog"
  - "Optimistic reorder: local state swap + async server action call — no spinner, instant feedback"

requirements-completed: [FAQ-01, FAQ-02, FAQ-03, FAQ-04, FAQ-05]

# Metrics
duration: 15min
completed: 2026-02-25
---

# Phase 03 Plan 03: FAQ Management Summary

**Admin FAQ CRUD with move up/down reorder at /admin/faq and read-only accordion at /seller/faq using shadcn Dialog, AlertDialog, and Accordion**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-02-25T16:50:06Z
- **Completed:** 2026-02-25T17:05:00Z
- **Tasks:** 2
- **Files modified:** 11 created, 0 modified

## Accomplishments
- Admin FAQ management page with full CRUD: create dialog, inline edit, delete confirmation, move up/down reorder with optimistic UI
- All four Server Actions secured with defense-in-depth admin role guard (same pattern as actions/tenants.ts)
- Seller read-only FAQ accordion at /seller/faq — multiple items expandable simultaneously, whitespace preserved in answers
- Installed shadcn dialog, textarea, and accordion components

## Task Commits

Each task was committed atomically:

1. **Task 1: Admin FAQ CRUD with reorder** - `251c499` (feat)
2. **Task 2: Seller read-only FAQ page with accordion** - `7993d9f` (feat)

## Files Created/Modified
- `lib/validations/faq.ts` - Zod faqFormSchema with question/answer fields (min 3 chars each)
- `actions/faq.ts` - Server Actions: createFaqItem, updateFaqItem, deleteFaqItem, reorderFaqItems (all with admin guard)
- `app/(dashboard)/admin/faq/page.tsx` - Admin FAQ page with auth guard and data fetch
- `components/faq/faq-admin-list.tsx` - Client component with optimistic reorder, edit/delete button handlers
- `components/faq/faq-form-dialog.tsx` - Dialog form for create/edit using react-hook-form + zodResolver
- `components/faq/delete-faq-dialog.tsx` - AlertDialog delete confirmation with useTransition
- `app/(dashboard)/seller/faq/page.tsx` - Seller FAQ page with seller role guard
- `components/faq/faq-reader.tsx` - Read-only Accordion (type=multiple), empty state, whitespace-pre-wrap answers
- `components/ui/dialog.tsx` - shadcn Dialog component (installed)
- `components/ui/textarea.tsx` - shadcn Textarea component (installed)
- `components/ui/accordion.tsx` - shadcn Accordion component (installed)

## Decisions Made
- `reorderFaqItems` uses individual loop updates (not batch upsert) — FAQ lists are small and simplicity wins
- Optimistic reorder in `FaqAdminList`: items swap in local state immediately, server action persists in background
- `reorderFaqItems` revalidates both `/admin/faq` and `/seller/faq` so seller view reflects changes without manual refresh
- Seller FAQ page guards with `role === 'seller'` specifically — matches defense-in-depth pattern from all other seller pages

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required. Database `faq_items` table already exists from `001_initial_schema.sql`.

## Next Phase Readiness
- All FAQ requirements (FAQ-01 through FAQ-05) satisfied
- Phase 03 complete — admin and seller FAQ fully functional
- Navigation links to /admin/faq and /seller/faq may need to be added to sidebar (if not already present)

---
*Phase: 03-revenue-analytics-faq*
*Completed: 2026-02-25*
