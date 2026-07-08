-- Admin aggregate helpers for overview/analytics pages.
-- Keep these admin-only and row-count reducing so dashboard routes do less work
-- in React and transfer fewer repeated revenue rows.

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
  IF ((select auth.jwt()) -> 'app_metadata' ->> 'role') IS DISTINCT FROM 'admin' THEN
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

REVOKE EXECUTE ON FUNCTION public.get_admin_yearly_overview(integer) FROM anon;
