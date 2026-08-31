-- Expose the new EN sibling columns (store_name_en, description_en, category_en)
-- through tenants_public so the /en storefront can read them.
DROP VIEW public.tenants_public;

CREATE VIEW public.tenants_public WITH (security_barrier = true, security_invoker = on) AS
  SELECT id, store_name, category, logo_url, gallery_images, description,
         weekday_hours, saturday_hours, sunday_hours, slug, contact_phone, website_url,
         store_name_en, description_en, category_en
  FROM public.tenants
  WHERE is_visible;

GRANT SELECT (store_name_en, description_en, category_en) ON public.tenants TO anon;
