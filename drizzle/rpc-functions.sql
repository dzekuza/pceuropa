-- drizzle/rpc-functions.sql
--
-- Plain-Postgres ports of the two Supabase RPC functions used by the admin
-- dashboard. Both use plpgsql + SECURITY DEFINER identically to the Supabase
-- originals; only the auth check inside each function body changes, from
-- `(select auth.jwt()) -> 'app_metadata' ->> 'role'` to
-- `current_setting('app.user_role', true)`, which the future Auth.js-based
-- app layer is expected to set per request via `SET LOCAL app.user_role = ...`
-- inside the same transaction that runs the query (see drizzle/rls-policies.sql
-- for the same convention applied to RLS policies).

-- ─────────────────────────────────────────────────────────────────────────
-- get_admin_monthly_stats
--
-- Source, read in order:
--   1. supabase/migrations/005_admin_stats_rpc.sql
--        Original version. Comment explicitly states:
--        "Requires caller to be an admin, handled via RLS or application
--        tier." — i.e. the function body itself did NOT check the role; it
--        relied entirely on the caller (RLS grants / app tier) to gate
--        access. EXECUTE was implicitly grantable to any authenticated role.
--   2. supabase/migrations/20260703180647_rls_perf_and_security_fixes.sql
--        Added a self-enforcing role check inside the function body
--        (`IF ... IS DISTINCT FROM 'admin' THEN RAISE EXCEPTION`), and
--        REVOKEd EXECUTE from anon. This was done specifically to fix a
--        Supabase advisor finding ("anon/authenticated SECURITY DEFINER
--        function... now admin-gated").
--   3. supabase/migrations/20260703180716_revoke_admin_stats_public_execute.sql
--        Follow-up: also REVOKEd EXECUTE from PUBLIC (the default grant),
--        and explicitly GRANTed EXECUTE to authenticated only.
--   4. supabase/migrations/20260708000003_fix_admin_monthly_stats_date_cast.sql
--        Functionally unrelated to auth — fixes a date/text comparison bug
--        (casts start_month_str to date once, up front). Carries forward the
--        same self-enforcing admin check from step 2/3. This is the LIVE
--        definition being ported below.
--
-- AUTHORIZATION DECISION (explicit, not silent):
-- The live function (as of migration #4) already self-enforces admin-only
-- access via an in-body role check, plus a database-level EXECUTE grant
-- restricted to the `authenticated` role. This is a stronger posture than
-- the function's original (#1) comment suggests, and the port below
-- preserves that stronger, self-enforcing posture — it does NOT revert to
-- "trust the app tier" (#1's original design). Every caller of this function
-- must have already run `SET LOCAL app.user_role = '<role>'` in the same
-- transaction (mirroring how Supabase populated auth.jwt() per request), and
-- the function raises an exception if that role is not exactly 'admin'.
-- This means the port is self-enforcing defense-in-depth on top of
-- application-tier gating, not a replacement for it — the app layer should
-- still avoid calling this RPC for non-admin sessions in the first place.
CREATE OR REPLACE FUNCTION public.get_admin_monthly_stats(start_month_str text)
RETURNS TABLE (
  month_date text,
  total_revenue numeric,
  total_tx integer,
  submission_count integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  start_month_date date := start_month_str::date;
BEGIN
  IF current_setting('app.user_role', true) IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  RETURN QUERY
  SELECT
    to_char(r.month, 'YYYY-MM-DD') AS month_date,
    COALESCE(SUM(r.amount_eur), 0)::numeric AS total_revenue,
    COALESCE(SUM(r.tx_count), 0)::int AS total_tx,
    COUNT(r.id)::int AS submission_count
  FROM public.revenue_reports r
  WHERE r.month >= start_month_date
  GROUP BY r.month
  ORDER BY r.month ASC;
END;
$$;

-- No PUBLIC/anon execute grant is issued here (mirrors the revoke-everything
-- posture from migrations #2/#3). Grant EXECUTE explicitly to whatever
-- application/service role runs authenticated queries in the target
-- database, e.g.:
--   GRANT EXECUTE ON FUNCTION public.get_admin_monthly_stats(text) TO app_user;

-- ─────────────────────────────────────────────────────────────────────────
-- get_admin_yearly_overview
--
-- Source: supabase/migrations/20260708000002_admin_overview_rpc.sql. This
-- function was introduced already self-enforcing (no prior "trust the app
-- tier" version existed for it — unlike get_admin_monthly_stats). Same
-- authorization decision applies: preserve the self-enforcing admin check,
-- translated to current_setting('app.user_role', true).
CREATE OR REPLACE FUNCTION public.get_admin_yearly_overview(target_year integer)
RETURNS TABLE (
  tenant_id uuid,
  store_name text,
  category text,
  month_date text,
  total_revenue numeric,
  total_tx integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  range_start date := make_date(target_year, 1, 1);
  range_end date := make_date(target_year + 1, 1, 1);
BEGIN
  IF current_setting('app.user_role', true) IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  RETURN QUERY
  SELECT
    t.id AS tenant_id,
    t.store_name,
    t.category,
    to_char(r.month, 'YYYY-MM-DD') AS month_date,
    COALESCE(SUM(r.amount_eur), 0)::numeric AS total_revenue,
    COALESCE(SUM(r.tx_count), 0)::int AS total_tx
  FROM public.revenue_reports r
  JOIN public.tenants t ON t.id = r.tenant_id
  WHERE r.month >= range_start
    AND r.month < range_end
  GROUP BY t.id, t.store_name, t.category, r.month
  ORDER BY t.store_name ASC, r.month ASC;
END;
$$;

-- Same grant convention as above:
--   GRANT EXECUTE ON FUNCTION public.get_admin_yearly_overview(integer) TO app_user;
