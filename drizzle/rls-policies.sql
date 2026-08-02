-- drizzle/rls-policies.sql
--
-- All RLS policies that reference auth.uid()/auth.jwt() in
-- supabase/migrations/, rewritten individually (no blanket search/replace)
-- to use current_setting('app.user_id', true)::uuid /
-- current_setting('app.user_role', true) instead. The future Auth.js-based
-- app layer is expected to run `SET LOCAL app.user_id = '<uuid>'` and
-- `SET LOCAL app.user_role = '<role>'` per request-scoped transaction,
-- mirroring what Supabase populated into auth.uid()/auth.jwt() per request.
--
-- Files found via `grep -rl "auth\.uid()\|auth\.jwt()" supabase/migrations/`
-- (10 files, more than the ~4 initially estimated):
--   001_initial_schema.sql
--   011_page_sections.sql
--   012_puck_pages.sql
--   20260703000001_moderan_sync_log.sql
--   20260703164444_revenue_seller_tenant_rls.sql
--   20260703180647_rls_perf_and_security_fixes.sql
--   20260706000002_create_promos_table.sql
--   20260708000002_admin_overview_rpc.sql          (RPC, ported in rpc-functions.sql)
--   20260708000003_fix_admin_monthly_stats_date_cast.sql (RPC, ported in rpc-functions.sql)
--   20260722165344_marketing_assets_admin_storage_policies.sql
--
-- Several of the above (001, 011's original write policy, 012's original
-- write policy, 20260703164444) define policies that were later DROPped and
-- replaced by 20260703180647_rls_perf_and_security_fixes.sql. Only the
-- CURRENTLY LIVE policy for each table is ported below; each block names the
-- migration that defines the live version, and notes superseded ones for
-- traceability.

-- ═══════════════════════════════════════════════════════════════════════
-- tenants
-- ═══════════════════════════════════════════════════════════════════════

-- Source: 20260703180647_rls_perf_and_security_fixes.sql
-- (supersedes "tenants_admin_all" from 001_initial_schema.sql)
CREATE POLICY "tenants_admin_insert" ON public.tenants
  FOR INSERT TO authenticated
  WITH CHECK (current_setting('app.user_role', true) = 'admin');

-- Source: 20260703180647_rls_perf_and_security_fixes.sql
CREATE POLICY "tenants_admin_update" ON public.tenants
  FOR UPDATE TO authenticated
  USING (current_setting('app.user_role', true) = 'admin')
  WITH CHECK (current_setting('app.user_role', true) = 'admin');

-- Source: 20260703180647_rls_perf_and_security_fixes.sql
CREATE POLICY "tenants_admin_delete" ON public.tenants
  FOR DELETE TO authenticated
  USING (current_setting('app.user_role', true) = 'admin');

-- Source: 20260703180647_rls_perf_and_security_fixes.sql
-- (supersedes "tenants_seller_own_select" from 001_initial_schema.sql)
CREATE POLICY "tenants_select" ON public.tenants
  FOR SELECT TO authenticated
  USING (
    current_setting('app.user_role', true) = 'admin'
    OR (
      current_setting('app.user_role', true) = 'seller'
      AND user_id = current_setting('app.user_id', true)::uuid
    )
  );

-- Source: 20260713120000_tenants_public_security_invoker_with_anon_policy.sql
-- Uses USING (true) — no auth.uid()/auth.jwt() involved, so no rewrite is
-- needed. Included here only for completeness since it's part of the same
-- live table's policy set; see drizzle/tenants-public-view.sql for the full
-- context (column-level grants + tenants_public view).
CREATE POLICY "tenants_anon_public_select" ON public.tenants
  FOR SELECT TO anon
  USING (true);

-- ═══════════════════════════════════════════════════════════════════════
-- revenue_reports
-- ═══════════════════════════════════════════════════════════════════════

-- Source: 20260703180647_rls_perf_and_security_fixes.sql
-- (supersedes "revenue_admin_all" from 001_initial_schema.sql)
CREATE POLICY "revenue_admin_delete" ON public.revenue_reports
  FOR DELETE TO authenticated
  USING (current_setting('app.user_role', true) = 'admin');

-- Source: 20260703180647_rls_perf_and_security_fixes.sql
-- (supersedes "revenue_seller_tenant_select" from
-- 20260703164444_revenue_seller_tenant_rls.sql, which itself superseded
-- "revenue_seller_own_select" from 001_initial_schema.sql)
CREATE POLICY "revenue_select" ON public.revenue_reports
  FOR SELECT TO authenticated
  USING (
    current_setting('app.user_role', true) = 'admin'
    OR tenant_id IN (
      SELECT id FROM public.tenants
      WHERE user_id = current_setting('app.user_id', true)::uuid
    )
  );

-- Source: 20260703180647_rls_perf_and_security_fixes.sql
-- (supersedes "revenue_seller_tenant_insert" from
-- 20260703164444_revenue_seller_tenant_rls.sql, which itself superseded
-- "revenue_seller_own_insert" from 001_initial_schema.sql)
CREATE POLICY "revenue_insert" ON public.revenue_reports
  FOR INSERT TO authenticated
  WITH CHECK (
    current_setting('app.user_role', true) = 'admin'
    OR (
      current_setting('app.user_role', true) = 'seller'
      AND tenant_id IN (
        SELECT id FROM public.tenants
        WHERE user_id = current_setting('app.user_id', true)::uuid
      )
    )
  );

-- Source: 20260703180647_rls_perf_and_security_fixes.sql
-- (supersedes "revenue_seller_tenant_update" from
-- 20260703164444_revenue_seller_tenant_rls.sql, which itself superseded
-- "revenue_seller_own_update" from 001_initial_schema.sql)
CREATE POLICY "revenue_update" ON public.revenue_reports
  FOR UPDATE TO authenticated
  USING (
    current_setting('app.user_role', true) = 'admin'
    OR (
      current_setting('app.user_role', true) = 'seller'
      AND tenant_id IN (
        SELECT id FROM public.tenants
        WHERE user_id = current_setting('app.user_id', true)::uuid
      )
    )
  )
  WITH CHECK (
    current_setting('app.user_role', true) = 'admin'
    OR (
      current_setting('app.user_role', true) = 'seller'
      AND tenant_id IN (
        SELECT id FROM public.tenants
        WHERE user_id = current_setting('app.user_id', true)::uuid
      )
    )
  );

-- ═══════════════════════════════════════════════════════════════════════
-- faq_items
-- ═══════════════════════════════════════════════════════════════════════

-- Source: 20260703180647_rls_perf_and_security_fixes.sql
-- (supersedes "faq_admin_all" from 001_initial_schema.sql)
CREATE POLICY "faq_admin_insert" ON public.faq_items
  FOR INSERT TO authenticated
  WITH CHECK (current_setting('app.user_role', true) = 'admin');

-- Source: 20260703180647_rls_perf_and_security_fixes.sql
CREATE POLICY "faq_admin_update" ON public.faq_items
  FOR UPDATE TO authenticated
  USING (current_setting('app.user_role', true) = 'admin')
  WITH CHECK (current_setting('app.user_role', true) = 'admin');

-- Source: 20260703180647_rls_perf_and_security_fixes.sql
CREATE POLICY "faq_admin_delete" ON public.faq_items
  FOR DELETE TO authenticated
  USING (current_setting('app.user_role', true) = 'admin');

-- NOTE: "faq_authenticated_select" (001_initial_schema.sql) uses
-- USING (true) — no auth fn, not ported here, carried over unchanged.

-- ═══════════════════════════════════════════════════════════════════════
-- page_sections
-- ═══════════════════════════════════════════════════════════════════════

-- Source: 20260703180647_rls_perf_and_security_fixes.sql
-- (supersedes "page_sections_admin_all" from 011_page_sections.sql)
CREATE POLICY "page_sections_admin_insert" ON public.page_sections
  FOR INSERT TO authenticated
  WITH CHECK (current_setting('app.user_role', true) = 'admin');

-- Source: 20260703180647_rls_perf_and_security_fixes.sql
CREATE POLICY "page_sections_admin_update" ON public.page_sections
  FOR UPDATE TO authenticated
  USING (current_setting('app.user_role', true) = 'admin')
  WITH CHECK (current_setting('app.user_role', true) = 'admin');

-- Source: 20260703180647_rls_perf_and_security_fixes.sql
CREATE POLICY "page_sections_admin_delete" ON public.page_sections
  FOR DELETE TO authenticated
  USING (current_setting('app.user_role', true) = 'admin');

-- NOTE: "page_sections_public_select" (011_page_sections.sql) uses
-- USING (true) — no auth fn, not ported here, carried over unchanged.

-- ═══════════════════════════════════════════════════════════════════════
-- puck_pages
-- ═══════════════════════════════════════════════════════════════════════

-- Source: 20260703180647_rls_perf_and_security_fixes.sql
-- (supersedes "Admin write puck pages" from 012_puck_pages.sql)
CREATE POLICY "Admin insert puck pages" ON public.puck_pages
  FOR INSERT TO authenticated
  WITH CHECK (current_setting('app.user_role', true) = 'admin');

-- Source: 20260703180647_rls_perf_and_security_fixes.sql
CREATE POLICY "Admin update puck pages" ON public.puck_pages
  FOR UPDATE TO authenticated
  USING (current_setting('app.user_role', true) = 'admin')
  WITH CHECK (current_setting('app.user_role', true) = 'admin');

-- Source: 20260703180647_rls_perf_and_security_fixes.sql
CREATE POLICY "Admin delete puck pages" ON public.puck_pages
  FOR DELETE TO authenticated
  USING (current_setting('app.user_role', true) = 'admin');

-- NOTE: "Public read puck pages" (012_puck_pages.sql) uses USING (true) —
-- no auth fn, not ported here, carried over unchanged.

-- ═══════════════════════════════════════════════════════════════════════
-- moderan_sync_log
-- ═══════════════════════════════════════════════════════════════════════

-- Source: 20260703180647_rls_perf_and_security_fixes.sql
-- (supersedes "Admin only" from 20260703000001_moderan_sync_log.sql —
-- same policy name, re-created with the (select ...) initplan wrapper,
-- here further rewritten to current_setting)
CREATE POLICY "Admin only" ON public.moderan_sync_log
  FOR ALL
  USING (current_setting('app.user_role', true) = 'admin');

-- ═══════════════════════════════════════════════════════════════════════
-- promos
-- ═══════════════════════════════════════════════════════════════════════

-- Source: 20260706000002_create_promos_table.sql
CREATE POLICY "Public and admin can read promos" ON public.promos
  FOR SELECT
  USING (
    published = true
    OR current_setting('app.user_role', true) = 'admin'
  );

-- ═══════════════════════════════════════════════════════════════════════
-- storage.objects (marketing-assets bucket)
--
-- NOTE: storage.objects is a Supabase Storage-managed table with no
-- equivalent in plain Postgres — self-hosted file storage (e.g. S3-compatible
-- object storage) will need its own authorization mechanism entirely outside
-- Postgres RLS. These are ported for reference/documentation only, in case
-- the target storage backend is itself Postgres-RLS-gated (e.g. a metadata
-- table fronting the object store); they are NOT expected to run as-is
-- against a self-hosted Postgres database that lacks a storage.objects table.
-- ═══════════════════════════════════════════════════════════════════════

-- Source: 20260722165344_marketing_assets_admin_storage_policies.sql
CREATE POLICY "Admins can upload marketing-assets"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'marketing-assets'
    AND current_setting('app.user_role', true) = 'admin'
  );

-- Source: 20260722165344_marketing_assets_admin_storage_policies.sql
CREATE POLICY "Admins can update marketing-assets"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'marketing-assets'
    AND current_setting('app.user_role', true) = 'admin'
  )
  WITH CHECK (
    bucket_id = 'marketing-assets'
    AND current_setting('app.user_role', true) = 'admin'
  );

-- Source: 20260722165344_marketing_assets_admin_storage_policies.sql
CREATE POLICY "Admins can delete marketing-assets"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'marketing-assets'
    AND current_setting('app.user_role', true) = 'admin'
  );
