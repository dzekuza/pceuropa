-- Replaces the admin-facing "contact email" field with a website URL field.
-- contact_email is kept as-is (data intact, still readable) but is no longer
-- collected or shown by the app; website_url takes its place in the UI.
ALTER TABLE public.tenants
  ADD COLUMN website_url text;

DROP VIEW public.tenants_public;

CREATE VIEW public.tenants_public WITH (security_barrier = true, security_invoker = on) AS
  SELECT id, store_name, category, logo_url, gallery_images, description,
         weekday_hours, saturday_hours, sunday_hours, slug, contact_phone, website_url
  FROM public.tenants
  WHERE is_visible;

GRANT SELECT (website_url) ON public.tenants TO anon;
