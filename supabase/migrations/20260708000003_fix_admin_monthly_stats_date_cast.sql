-- Fix admin monthly stats RPC to compare date values with matching types.
-- Some environments reject implicit date >= text comparison.

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
  IF ((select auth.jwt()) -> 'app_metadata' ->> 'role') IS DISTINCT FROM 'admin' THEN
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

REVOKE EXECUTE ON FUNCTION public.get_admin_monthly_stats(text) FROM anon;
