-- Add a human-readable slug for tenants so public store URLs
-- (/parduotuves/[slug]) don't expose the raw uuid.
ALTER TABLE public.tenants ADD COLUMN slug text;

WITH base AS (
  SELECT id, store_name,
    regexp_replace(
      lower(
        translate(store_name,
          'ĄČĘĖĮŠŲŪŽąčęėįšųūž',
          'ACEEISUUZaceeisuuz'
        )
      ),
      '[^a-z0-9]+', '-', 'g'
    ) AS raw_slug
  FROM public.tenants
),
trimmed AS (
  SELECT id, nullif(trim(both '-' from raw_slug), '') AS base_slug
  FROM base
),
numbered AS (
  SELECT id, coalesce(base_slug, 'parduotuve') AS base_slug,
    row_number() OVER (PARTITION BY coalesce(base_slug, 'parduotuve') ORDER BY id) AS rn
  FROM trimmed
)
UPDATE public.tenants t
SET slug = CASE WHEN n.rn = 1 THEN n.base_slug ELSE n.base_slug || '-' || n.rn END
FROM numbered n
WHERE t.id = n.id;

ALTER TABLE public.tenants
  ALTER COLUMN slug SET NOT NULL,
  ADD CONSTRAINT tenants_slug_unique UNIQUE (slug);

CREATE OR REPLACE VIEW public.tenants_public WITH (security_barrier = true) AS
  SELECT id, store_name, category, logo_url, gallery_images, description,
         weekday_hours, saturday_hours, sunday_hours, slug
  FROM public.tenants;

GRANT SELECT (slug) ON public.tenants TO anon;
