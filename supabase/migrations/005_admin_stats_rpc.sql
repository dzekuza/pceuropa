-- Migration: 005_admin_stats_rpc.sql
-- Description: Create an RPC to aggregate monthly revenue and transactions for the admin dashboard.

CREATE OR REPLACE FUNCTION get_admin_monthly_stats(start_month_str text)
RETURNS TABLE (
  month_date text,
  total_revenue numeric,
  total_tx int,
  submission_count int
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Requires caller to be an admin, handled via RLS or application tier.
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
$$;
