-- The prior migration revoked EXECUTE from anon directly, but
-- get_admin_monthly_stats still carried the default PUBLIC grant, which
-- anon inherits. Revoke from PUBLIC explicitly so anon can no longer call it.
REVOKE EXECUTE ON FUNCTION public.get_admin_monthly_stats(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_admin_monthly_stats(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_admin_monthly_stats(text) TO authenticated;
