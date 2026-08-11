-- anon currently has Supabase's default blanket ALL grant on public.tenants
-- (every column, every privilege), and RLS policy tenants_anon_public_select
-- allows SELECT on every row. Combined, this lets any caller with the public
-- anon key read every column via GET /rest/v1/tenants?select=* — including
-- rent_eur, space_m2, company_code, user_id, created_at, and login_password —
-- completely bypassing the tenants_public view built to hide exactly this data.
-- The prior per-migration "GRANT SELECT (col) ... TO anon" statements were
-- no-ops because the default blanket grant was never revoked. No code path
-- writes to tenants as anon (all writes go through authenticated Server
-- Actions), so anon needs nothing beyond the narrow read tenants_public uses.
REVOKE ALL ON public.tenants FROM anon;

GRANT SELECT (
  id, store_name, category, logo_url, gallery_images, description,
  weekday_hours, saturday_hours, sunday_hours, slug, contact_email,
  contact_phone, is_visible
) ON public.tenants TO anon;
