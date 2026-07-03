-- 20260703000002_revenue_seller_tenant_rls.sql
-- Fix: sellers could only see/edit revenue_reports where user_id = auth.uid().
-- Imported/synced rows (e.g. Moderan turnover) have user_id = NULL and are linked
-- to the seller only by tenant_id, so they were invisible to the tenant's own
-- account. Re-scope the seller SELECT/INSERT/UPDATE policies to the seller's
-- tenant so every report for that tenant is visible and editable.

-- Drop the old user_id-scoped seller policies
DROP POLICY IF EXISTS "revenue_seller_own_select" ON public.revenue_reports;
DROP POLICY IF EXISTS "revenue_seller_own_insert" ON public.revenue_reports;
DROP POLICY IF EXISTS "revenue_seller_own_update" ON public.revenue_reports;

-- Sellers can view ALL reports belonging to their tenant (incl. imported rows)
CREATE POLICY "revenue_seller_tenant_select" ON public.revenue_reports
  FOR SELECT TO authenticated
  USING (
    tenant_id IN (SELECT id FROM public.tenants WHERE user_id = auth.uid())
  );

-- Sellers (seller role) can insert reports for their own tenant
CREATE POLICY "revenue_seller_tenant_insert" ON public.revenue_reports
  FOR INSERT TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'seller'
    AND tenant_id IN (SELECT id FROM public.tenants WHERE user_id = auth.uid())
  );

-- Sellers (seller role) can update reports for their own tenant, including
-- editing previously imported months (old row may have user_id = NULL).
CREATE POLICY "revenue_seller_tenant_update" ON public.revenue_reports
  FOR UPDATE TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'seller'
    AND tenant_id IN (SELECT id FROM public.tenants WHERE user_id = auth.uid())
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'seller'
    AND tenant_id IN (SELECT id FROM public.tenants WHERE user_id = auth.uid())
  );
