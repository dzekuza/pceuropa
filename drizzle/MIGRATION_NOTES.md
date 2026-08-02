# Phase 3 migration notes — Supabase → self-hosted Postgres

Scope: schema + non-introspectable objects only. Nothing in `supabase/migrations/`
was touched; nothing outside this repo was touched; no destructive or
`push`/`migrate` command was run against any real database.

## Files produced

- `drizzle/schema.ts` — Drizzle schema for all 8 tables.
- `drizzle/tenants-public-view.sql` — hand-ported `tenants_public` view, final live definition.
- `drizzle/rpc-functions.sql` — `get_admin_monthly_stats` + `get_admin_yearly_overview`, ported to plain Postgres.
- `drizzle/rls-policies.sql` — every RLS policy that referenced `auth.uid()`/`auth.jwt()`, ported individually.
- `drizzle/migrations/0000_initial.sql` (+ `drizzle/migrations/meta/`) — drizzle-kit-generated table DDL, with RLS enablement, the ported policies, the view, and the RPC functions appended so the file builds the full schema from scratch in one pass.
- `drizzle.config.ts` (repo root) — points drizzle-kit at `drizzle/schema.ts` / `drizzle/migrations`, needed to run `drizzle-kit generate`. `drizzle-orm`, `drizzle-kit`, `pg`, `@types/pg` were added as devDependencies via `pnpm add -D` to generate this locally.

## RPC authorization decision

`get_admin_monthly_stats` has a history:

1. `005_admin_stats_rpc.sql` (original): the function body did **not** check the caller's role. Its comment said authorization was "handled via RLS or application tier" — i.e. it trusted the app tier / grants entirely.
2. `20260703180647_rls_perf_and_security_fixes.sql`: added a self-enforcing role check inside the function body (`RAISE EXCEPTION` if role isn't admin) and revoked `EXECUTE` from `anon`, specifically to close a Supabase advisor finding.
3. `20260703180716_revoke_admin_stats_public_execute.sql`: also revoked the default `PUBLIC` grant.
4. `20260708000003_fix_admin_monthly_stats_date_cast.sql`: unrelated date-cast bug fix, carries the same self-enforcing check forward — **this is the live definition**.

**Decision:** the port in `drizzle/rpc-functions.sql` preserves the *live*, self-enforcing behavior (step 4), not the original "trust the app tier" design from step 1. The in-body check now reads `current_setting('app.user_role', true)` instead of `auth.jwt()`. This means the function still raises `Forbidden` if the calling transaction hasn't set `app.user_role = 'admin'` via `SET LOCAL`, in addition to whatever grants exist at the Postgres level — defense in depth, matching what's actually running in production today. I did not weaken this; flagging it explicitly per the task instructions since it would have been easy to silently drop the check if someone only read migration `005` and stopped there.

`get_admin_yearly_overview` (`20260708000002_admin_overview_rpc.sql`) was introduced already self-enforcing — no prior "trust the app tier" version ever existed for it. Same treatment applied.

Both functions currently have no `GRANT EXECUTE` issued to any role in the port — the migration file leaves this as a `-- ` comment / TODO for whoever wires up the actual app-tier Postgres role, since that role name doesn't exist yet in this codebase.

## RLS policy files ported (source → destination)

Found via `grep -rl "auth\.uid()\|auth\.jwt()" supabase/migrations/` — **10 files**, more than the ~4 named in the task prompt (`20260703164444`, `20260703180647`, `20260703180716`, `20260722165344`):

| Source migration | Contains | Ported? |
|---|---|---|
| `001_initial_schema.sql` | Original `tenants_admin_all`, `tenants_seller_own_select`, `revenue_admin_all`, `revenue_seller_own_select/insert/update`, `faq_admin_all` policies | Superseded by `20260703180647`; **not re-ported** (would recreate dropped objects) |
| `011_page_sections.sql` | Original `page_sections_admin_all` | Superseded by `20260703180647`; not re-ported |
| `012_puck_pages.sql` | Original `Admin write puck pages` | Superseded by `20260703180647`; not re-ported |
| `20260703000001_moderan_sync_log.sql` | Original `Admin only` (no initplan wrapper) | Superseded by `20260703180647`; not re-ported |
| `20260703164444_revenue_seller_tenant_rls.sql` | `revenue_seller_tenant_select/insert/update` | Superseded by `20260703180647`; not re-ported |
| `20260703180647_rls_perf_and_security_fixes.sql` | **Live** policies for tenants (`tenants_admin_insert/update/delete`, `tenants_select`), revenue_reports (`revenue_admin_delete`, `revenue_select`, `revenue_insert`, `revenue_update`), faq_items (`faq_admin_insert/update/delete`), page_sections (`page_sections_admin_insert/update/delete`), puck_pages (`Admin insert/update/delete puck pages`), moderan_sync_log (`Admin only`, rewrapped) | **Ported** → `drizzle/rls-policies.sql` (19 policies) |
| `20260706000002_create_promos_table.sql` | `Public and admin can read promos` | **Ported** → `drizzle/rls-policies.sql` |
| `20260708000002_admin_overview_rpc.sql` | In-function role check, not a policy | **Ported** → `drizzle/rpc-functions.sql` (`get_admin_yearly_overview`) |
| `20260708000003_fix_admin_monthly_stats_date_cast.sql` | In-function role check, not a policy | **Ported** → `drizzle/rpc-functions.sql` (`get_admin_monthly_stats`) |
| `20260722165344_marketing_assets_admin_storage_policies.sql` | `Admins can upload/update/delete marketing-assets` (on `storage.objects`) | **Ported** → `drizzle/rls-policies.sql`, but excluded from the executable `0000_initial.sql` (see below) |

Total individually-rewritten policies in `drizzle/rls-policies.sql`: **20** (11 for tenants/revenue_reports/faq_items/page_sections/puck_pages/moderan_sync_log/promos that are part of the plain-Postgres schema, plus 3 storage.objects policies kept for reference only, plus `tenants_anon_public_select` which technically has no `auth.*` call but is included for table-level completeness since it's part of the same live policy set — see the file's own header for the precise breakdown).

Every ported policy is preceded by a one-line `-- Source: <file>` comment. `USING (true)` policies with no `auth.uid()`/`auth.jwt()` call (`faq_authenticated_select`, `page_sections_public_select`, `Public read puck pages`, `Public can read published articles`) were **not** rewritten — they carry over unchanged and are included directly in `0000_initial.sql` for completeness, since they're needed to actually enable RLS on those tables without locking out legitimate public reads.

### storage.objects — not included in the runnable migration

`storage.objects` is a Supabase Storage-managed table; it does not exist in a
plain Postgres database. The three `marketing-assets` bucket policies are
preserved in `drizzle/rls-policies.sql` for documentation/reference, but
deliberately **excluded** from `drizzle/migrations/0000_initial.sql`, since
including a `CREATE POLICY ... ON storage.objects` there would make the
migration fail outright against a real self-hosted Postgres database that
has no such table. Whatever object-storage backend replaces Supabase Storage
(S3-compatible, etc.) will need its own authorization model — this is a
call-out for Phase 4/5, not something resolved here.

## `anon` / `authenticated` roles

Supabase provisions `anon` and `authenticated` Postgres roles automatically;
plain Postgres has neither. `0000_initial.sql` creates both with a `DO` block
(`CREATE ROLE ... NOLOGIN` if not already present) so the `GRANT ... TO anon`
and `TO authenticated` clauses in the ported view/policies don't fail on a
bare database. Whoever wires up the actual application connection role still
needs to `GRANT anon TO app_user;` / `GRANT authenticated TO app_user;` (or
drop the role-scoping entirely in favor of `TO PUBLIC` plus the
`current_setting('app.user_role', true)` checks, which already do the real
authorization work) — noted inline in the migration file.

## Ambiguities resolved with judgment calls

1. **`auth.users` FK columns** (`tenants.user_id`, `revenue_reports.user_id`,
   `moderan_sync_log.sent_by`): these reference Supabase's `auth.users`,
   which has no equivalent in the target database and no public-schema
   mirror table anywhere in `supabase/migrations/`. I modeled them in
   `drizzle/schema.ts` as plain `uuid` columns with **no** foreign key
   reference (rather than guessing at a `users` table shape that doesn't
   exist yet). **This needs a human decision before Phase 4 (auth)**: either
   introduce a real `users` table that Auth.js populates and re-add these
   FKs, or keep these columns as opaque external-identity uuids with
   integrity enforced at the application layer only.

   **Resolved**: Phase 4 introduced `users` (populated by Auth.js), and
   `drizzle/migrations/0002_black_umar.sql` adds the real FKs back. Safe
   against existing data because Supabase already enforced the equivalent FK
   to `auth.users`, and `migrate-data.ts` re-inserts the full `auth-users.json`
   export into `users` with matching ids before inserting the referencing
   tables.

2. **No local users/profiles table exists.** Confirmed by reading every
   migration in `supabase/migrations/` — the only user-related structure
   is the `auth.users` FK usage above. Supabase Auth fully owns identity;
   nothing in the `public` schema shadows it. This is the single biggest
   open question for Phase 4: Auth.js needs its own adapter tables (typically
   `users`, `accounts`, `sessions`, `verification_tokens` per the Auth.js
   Drizzle adapter convention), and a decision on how `tenants.user_id` /
   `revenue_reports.user_id` / `moderan_sync_log.sent_by` map onto whatever
   `users.id` shape Auth.js ends up using (same uuid space vs. a mapping
   table).

3. **`tenants_public` view's "final" migration.** Two migrations both touch
   `tenants_public` with overlapping timestamps in intent:
   `20260713120000_tenants_public_security_invoker_with_anon_policy.sql`
   (sets `security_invoker = on` + anon grants/policy, doesn't touch the
   `SELECT` list) and `20260730130000_add_tenant_slug.sql` (changes the
   `SELECT` list to add `slug`, doesn't touch `security_invoker`). Both are
   still in effect simultaneously — I merged them: the view's column list
   comes from `20260730130000` (the last migration to touch the projection),
   and `security_invoker = on` plus the anon column grants/policy come from
   `20260713120000` (the last migration to touch view-level security). This
   is not a conflict, just two migrations changing orthogonal aspects of the
   same object — documented in `drizzle/tenants-public-view.sql`'s header.

4. **RLS policy naming collisions across migrations for the same logical
   policy** (e.g. `moderan_sync_log`'s `"Admin only"` policy is dropped and
   recreated by name in `20260703180647`): only the live/final definition is
   ported, per-file provenance is noted in a comment, but the superseded
   version is not separately emitted (it would just be dead SQL — DROP then
   CREATE of an object nothing else depends on).

5. **`check()` constraints for `articles.category` and `promos.category`**:
   Drizzle's schema builder supports `check()` as of the installed
   `drizzle-orm@0.45.2` / `drizzle-kit@0.31.10`, so these were expressed as
   real Postgres `CHECK` constraints rather than a Drizzle enum, matching the
   original migrations exactly (`CHECK (category IN (...))`), not silently
   upgraded to a `pgEnum` type change.

## Not run

No `drizzle-kit push` / `drizzle-kit migrate` was executed against any
database, local or remote. `drizzle-kit generate` was run once, locally,
purely to produce `drizzle/migrations/0000_initial.sql` and its
`meta/0000_snapshot.json` / `meta/_journal.json` companions from
`drizzle/schema.ts` — this only reads the TypeScript schema file and writes
SQL to disk, it does not connect to any database.
