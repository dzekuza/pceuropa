-- Performance indexes for admin dashboard queries
-- Separate migration per database rules (indexes in their own migration)

-- ORDER BY store_name on tenant list page (admin/tenants)
CREATE INDEX IF NOT EXISTS tenants_store_name_idx ON public.tenants (store_name);

-- ORDER BY created_at DESC on admin dashboard "newest tenants" card
CREATE INDEX IF NOT EXISTS tenants_created_at_idx ON public.tenants (created_at DESC);

-- WHERE month >= ... queries on admin dashboard don't include tenant_id,
-- so the existing composite (tenant_id, month) index can't be used.
CREATE INDEX IF NOT EXISTS revenue_reports_month_idx ON public.revenue_reports (month);
