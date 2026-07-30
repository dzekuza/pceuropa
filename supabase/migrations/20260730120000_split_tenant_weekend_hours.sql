-- Split weekend_hours into separate saturday_hours/sunday_hours so admins can set
-- Mon–Fri, Saturday, and Sunday hours independently instead of one merged weekend value.
ALTER TABLE public.tenants
  ADD COLUMN saturday_hours text NOT NULL DEFAULT '10:00–20:00',
  ADD COLUMN sunday_hours text NOT NULL DEFAULT '10:00–20:00';

UPDATE public.tenants
  SET saturday_hours = weekend_hours,
      sunday_hours = weekend_hours;

ALTER TABLE public.tenants
  DROP COLUMN weekend_hours;

CREATE OR REPLACE VIEW public.tenants_public WITH (security_barrier = true) AS
  SELECT id, store_name, category, logo_url, gallery_images, description,
         weekday_hours, saturday_hours, sunday_hours
  FROM public.tenants;

GRANT SELECT (saturday_hours, sunday_hours) ON public.tenants TO anon;
