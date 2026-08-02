-- drizzle/tenants-public-view.sql
--
-- Hand-ported final live definition of public.tenants_public.
--
-- Reconstructed by reading, in order:
--   1. supabase/migrations/008_tenants_public_view.sql
--        (original: security_barrier view, SELECT id, store_name, category;
--         GRANT SELECT ON tenants_public TO anon)
--   2. supabase/migrations/010_tenants_public_view_media.sql
--        (adds logo_url, gallery_images)
--   3. supabase/migrations/20260701000001_tenants_public_view_description.sql
--        (adds description)
--   4. supabase/migrations/20260703180647_rls_perf_and_security_fixes.sql
--        (sets security_invoker = on — broke public pages, see #5)
--   5. supabase/migrations/20260706000001_revert_tenants_public_security_invoker.sql
--        (reverts to security_invoker = off, i.e. security definer semantics,
--         because anon has no RLS path into the base `tenants` table)
--   6. supabase/migrations/20260730000001_add_tenant_working_hours.sql
--        (adds weekday_hours, weekend_hours; GRANTs those columns to anon)
--   7. supabase/migrations/20260730120000_split_tenant_weekend_hours.sql
--        (drops weekend_hours; adds saturday_hours, sunday_hours; GRANTs
--         those columns to anon)
--   8. supabase/migrations/20260730130000_add_tenant_slug.sql
--        (adds slug; GRANTs slug to anon)
--   9. supabase/migrations/20260713120000_tenants_public_security_invoker_with_anon_policy.sql
--        (the LAST migration to touch tenants_public: this is chronologically
--         after #6/#7/#8 by file timestamp naming, but its content only
--         re-applies security_invoker = on plus grants/policy on the base
--         table — it does not change the view's SELECT list. The view's
--         column list as of the last migration that changes it (#8) is final.)
--
-- LIVE STATE: security_invoker = on (per #9), with anon granted column-level
-- SELECT on the exact same columns the view projects, plus a
-- `tenants_anon_public_select` USING (true) policy on the base `tenants`
-- table restricted to the anon role. This makes the invoker-mode view work
-- for anonymous/public marketing pages without exposing sensitive tenant
-- columns (login_password, rent_eur, company_code, operator, user_id, etc.),
-- since anon's column-level grant and RLS policy only ever expose the
-- public-safe projection below.
--
-- Plain Postgres has no security_invoker/security_barrier concept tied to
-- Supabase's anon/authenticated roles, but the same mechanics apply 1:1 in
-- self-hosted Postgres: an ordinary view (no SECURITY DEFINER function
-- involved) always runs as the querying role, RLS on the base table still
-- applies, and column-level GRANTs still restrict which columns a role can
-- read through the view. Create an `anon` role in the target database to
-- preserve this exact boundary.

CREATE OR REPLACE VIEW public.tenants_public AS
  SELECT
    id,
    store_name,
    category,
    logo_url,
    gallery_images,
    description,
    weekday_hours,
    saturday_hours,
    sunday_hours,
    slug
  FROM public.tenants;

-- security_barrier is retained from the original Supabase definition: it
-- prevents the planner from pushing caller-supplied WHERE clauses through
-- the view in a way that could leak data via side-channels (timing/error
-- based inference on columns not in the projection).
ALTER VIEW public.tenants_public SET (security_barrier = true);

-- Column-level grant mirrors the exact projection above — anon can read
-- these columns whether queried through the view or (if ever exposed)
-- directly against the base table.
GRANT SELECT (
  id, store_name, category, logo_url, gallery_images, description,
  weekday_hours, saturday_hours, sunday_hours, slug
) ON public.tenants TO anon;

GRANT SELECT ON public.tenants_public TO anon;

-- Base-table RLS policy restricted to anon: permits SELECT on all rows, but
-- only the granted columns above are ever visible to that role.
CREATE POLICY "tenants_anon_public_select" ON public.tenants
  FOR SELECT TO anon
  USING (true);
