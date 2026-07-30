-- Add per-tenant working hours, editable by admins in the tenant form.
-- Defaults match the placeholders previously hardcoded in app/(marketing)/darbo-laikas/page.tsx.
ALTER TABLE public.tenants
  ADD COLUMN weekday_hours text NOT NULL DEFAULT '10:00–21:00',
  ADD COLUMN weekend_hours text NOT NULL DEFAULT '10:00–20:00';

CREATE OR REPLACE VIEW public.tenants_public WITH (security_barrier = true) AS
  SELECT id, store_name, category, logo_url, gallery_images, description, weekday_hours, weekend_hours
  FROM public.tenants;

GRANT SELECT (weekday_hours, weekend_hours) ON public.tenants TO anon;
