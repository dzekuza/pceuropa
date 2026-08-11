-- Lets admins hide a tenant from public marketing pages without deleting it
-- (e.g. seasonal closures, incomplete listings). tenants_public runs
-- security_invoker (see 20260713120000), so anon needs column-level SELECT
-- on is_visible to evaluate the view's WHERE clause even though the column
-- itself is never part of the view's output.
ALTER TABLE public.tenants
  ADD COLUMN is_visible boolean NOT NULL DEFAULT true;

DROP VIEW public.tenants_public;

CREATE VIEW public.tenants_public WITH (security_barrier = true, security_invoker = on) AS
  SELECT id, store_name, category, logo_url, gallery_images, description,
         weekday_hours, saturday_hours, sunday_hours, slug, contact_email, contact_phone
  FROM public.tenants
  WHERE is_visible;

GRANT SELECT (is_visible) ON public.tenants TO anon;
