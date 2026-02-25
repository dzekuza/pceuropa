-- supabase/migrations/001_initial_schema.sql
-- pceuropa: Initial database schema with RLS policies
-- Run: npx supabase db push (after linking with npx supabase link --project-ref YOUR_REF)
-- Re-run type generation after applying: npx supabase gen types typescript --linked > types/database.ts

-- ─────────────────────────────────────────────
-- TENANTS TABLE
-- ─────────────────────────────────────────────
CREATE TABLE public.tenants (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE,  -- CASCADE required: deleting user removes their tenant
  store_name   text NOT NULL,           -- Parduotuvė
  operator     text,                    -- Operatorius
  company_code text,                    -- Įm. kodas
  category     text,                    -- Kategorija
  space_m2     numeric,                 -- Patalpos m²
  rent_eur     numeric,                 -- Nuomos kaina EUR
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Admin can do everything on tenants
CREATE POLICY "tenants_admin_all" ON public.tenants
  FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Sellers can only view their own tenant record
CREATE POLICY "tenants_seller_own_select" ON public.tenants
  FOR SELECT TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'seller'
    AND user_id = auth.uid()
  );

-- ─────────────────────────────────────────────
-- REVENUE REPORTS TABLE
-- ─────────────────────────────────────────────
CREATE TABLE public.revenue_reports (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE,  -- CASCADE required
  tenant_id    uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  month        date NOT NULL,           -- First day of month: 2025-01-01 = January 2025
  amount_eur   numeric NOT NULL,        -- Apyvarta EUR
  tx_count     integer,                 -- Pirkimų skaičius
  submitted_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, month)             -- Prevents duplicate submissions per month
);

ALTER TABLE public.revenue_reports ENABLE ROW LEVEL SECURITY;

-- Admin can do everything on revenue_reports
CREATE POLICY "revenue_admin_all" ON public.revenue_reports
  FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Sellers can view their own reports
CREATE POLICY "revenue_seller_own_select" ON public.revenue_reports
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Sellers can submit new reports (only for themselves, only as seller role)
CREATE POLICY "revenue_seller_own_insert" ON public.revenue_reports
  FOR INSERT TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'seller'
    AND user_id = auth.uid()
  );

-- Sellers can update their own reports (only their own, only as seller role)
CREATE POLICY "revenue_seller_own_update" ON public.revenue_reports
  FOR UPDATE TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'seller'
    AND user_id = auth.uid()
  );

-- ─────────────────────────────────────────────
-- FAQ ITEMS TABLE
-- ─────────────────────────────────────────────
CREATE TABLE public.faq_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question    text NOT NULL,
  answer      text NOT NULL,
  sort_order  integer DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;

-- Admin can do everything on faq_items
CREATE POLICY "faq_admin_all" ON public.faq_items
  FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- All authenticated users (admin + seller) can read FAQ items
CREATE POLICY "faq_authenticated_select" ON public.faq_items
  FOR SELECT TO authenticated
  USING (true);

-- ─────────────────────────────────────────────
-- INDEXES (performance for RLS lookups and joins)
-- ─────────────────────────────────────────────
CREATE INDEX ON public.tenants(user_id);
CREATE INDEX ON public.revenue_reports(user_id);
CREATE INDEX ON public.revenue_reports(tenant_id, month);
CREATE INDEX ON public.faq_items(sort_order);
