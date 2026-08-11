-- Add contact email/phone for tenants, shown publicly on the store page
-- instead of the previously hardcoded address placeholder.
ALTER TABLE public.tenants
  ADD COLUMN contact_email text,
  ADD COLUMN contact_phone text;

DROP VIEW public.tenants_public;

CREATE VIEW public.tenants_public WITH (security_barrier = true) AS
  SELECT id, store_name, category, logo_url, gallery_images, description,
         weekday_hours, saturday_hours, sunday_hours, slug, contact_email, contact_phone
  FROM public.tenants;

GRANT SELECT (contact_email, contact_phone) ON public.tenants TO anon;
