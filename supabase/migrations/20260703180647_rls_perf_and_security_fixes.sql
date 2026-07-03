-- Fix Supabase advisor findings:
-- 1) auth_rls_initplan: wrap auth.jwt()/auth.uid() calls in (select ...) so they
--    evaluate once per query instead of once per row.
-- 2) multiple_permissive_policies: split each "admin ALL" policy into
--    write-only policies (INSERT/UPDATE/DELETE) and merge SELECT access into a
--    single policy per table, so only one permissive policy runs per action.
-- 3) security_definer_view: tenants_public no longer runs with creator
--    privileges.
-- 4) anon/authenticated SECURITY DEFINER function: get_admin_monthly_stats is
--    now admin-gated and no longer callable by anon.
-- 5) unindexed_foreign_keys: add covering index for moderan_sync_log.sent_by.
-- 6) public_bucket_allows_listing: drop the broad SELECT policy on
--    marketing-assets; public object reads go through the public storage
--    endpoint (bucket.public = true) and do not need this policy — it only
--    enabled directory listing.

-- ---------------------------------------------------------------------------
-- tenants
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "tenants_admin_all" ON public.tenants;
DROP POLICY IF EXISTS "tenants_seller_own_select" ON public.tenants;

CREATE POLICY "tenants_admin_insert" ON public.tenants
  FOR INSERT TO authenticated
  WITH CHECK (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "tenants_admin_update" ON public.tenants
  FOR UPDATE TO authenticated
  USING (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "tenants_admin_delete" ON public.tenants
  FOR DELETE TO authenticated
  USING (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "tenants_select" ON public.tenants
  FOR SELECT TO authenticated
  USING (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
    OR (
      ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'seller'
      AND user_id = (select auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- revenue_reports
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "revenue_admin_all" ON public.revenue_reports;
DROP POLICY IF EXISTS "revenue_seller_tenant_select" ON public.revenue_reports;
DROP POLICY IF EXISTS "revenue_seller_tenant_insert" ON public.revenue_reports;
DROP POLICY IF EXISTS "revenue_seller_tenant_update" ON public.revenue_reports;

CREATE POLICY "revenue_admin_delete" ON public.revenue_reports
  FOR DELETE TO authenticated
  USING (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "revenue_select" ON public.revenue_reports
  FOR SELECT TO authenticated
  USING (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
    OR tenant_id IN (SELECT id FROM public.tenants WHERE user_id = (select auth.uid()))
  );

CREATE POLICY "revenue_insert" ON public.revenue_reports
  FOR INSERT TO authenticated
  WITH CHECK (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
    OR (
      ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'seller'
      AND tenant_id IN (SELECT id FROM public.tenants WHERE user_id = (select auth.uid()))
    )
  );

CREATE POLICY "revenue_update" ON public.revenue_reports
  FOR UPDATE TO authenticated
  USING (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
    OR (
      ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'seller'
      AND tenant_id IN (SELECT id FROM public.tenants WHERE user_id = (select auth.uid()))
    )
  )
  WITH CHECK (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
    OR (
      ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'seller'
      AND tenant_id IN (SELECT id FROM public.tenants WHERE user_id = (select auth.uid()))
    )
  );

-- ---------------------------------------------------------------------------
-- faq_items (public SELECT policy is already auth-fn-free — leave as is)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "faq_admin_all" ON public.faq_items;

CREATE POLICY "faq_admin_insert" ON public.faq_items
  FOR INSERT TO authenticated
  WITH CHECK (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "faq_admin_update" ON public.faq_items
  FOR UPDATE TO authenticated
  USING (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "faq_admin_delete" ON public.faq_items
  FOR DELETE TO authenticated
  USING (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

-- ---------------------------------------------------------------------------
-- page_sections (public SELECT policy is already auth-fn-free — leave as is)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "page_sections_admin_all" ON public.page_sections;

CREATE POLICY "page_sections_admin_insert" ON public.page_sections
  FOR INSERT TO authenticated
  WITH CHECK (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "page_sections_admin_update" ON public.page_sections
  FOR UPDATE TO authenticated
  USING (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "page_sections_admin_delete" ON public.page_sections
  FOR DELETE TO authenticated
  USING (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

-- ---------------------------------------------------------------------------
-- puck_pages (public SELECT policy is already auth-fn-free — leave as is)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admin write puck pages" ON public.puck_pages;

CREATE POLICY "Admin insert puck pages" ON public.puck_pages
  FOR INSERT TO authenticated
  WITH CHECK (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin update puck pages" ON public.puck_pages
  FOR UPDATE TO authenticated
  USING (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin delete puck pages" ON public.puck_pages
  FOR DELETE TO authenticated
  USING (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

-- ---------------------------------------------------------------------------
-- moderan_sync_log — single policy, just needs the initplan wrap + FK index
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admin only" ON public.moderan_sync_log;

CREATE POLICY "Admin only" ON public.moderan_sync_log
  FOR ALL
  USING (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

CREATE INDEX IF NOT EXISTS moderan_sync_log_sent_by_idx
  ON public.moderan_sync_log (sent_by);

-- ---------------------------------------------------------------------------
-- tenants_public view — run with the querying user's privileges, not the
-- view creator's.
-- ---------------------------------------------------------------------------
ALTER VIEW public.tenants_public SET (security_invoker = on);

-- ---------------------------------------------------------------------------
-- get_admin_monthly_stats — gate to admins only, remove anon access.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_admin_monthly_stats(start_month_str text)
 RETURNS TABLE(month_date text, total_revenue numeric, total_tx integer, submission_count integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF ((select auth.jwt()) -> 'app_metadata' ->> 'role') IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  RETURN QUERY
  SELECT
    r.month,
    COALESCE(SUM(r.amount_eur), 0)::numeric AS total_revenue,
    COALESCE(SUM(r.tx_count), 0)::int AS total_tx,
    COUNT(r.id)::int AS submission_count
  FROM revenue_reports r
  WHERE r.month >= start_month_str
  GROUP BY r.month
  ORDER BY r.month ASC;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.get_admin_monthly_stats(text) FROM anon;

-- ---------------------------------------------------------------------------
-- marketing-assets bucket — drop the broad listing SELECT policy. Public
-- object reads still work via the public storage endpoint.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can read marketing-assets" ON storage.objects;
