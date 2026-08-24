-- Nest puck_pages.data per-locale: { lt: {...}, en: {...} } instead of a flat
-- ContentData blob. EN starts as a copy of LT until seeded/translated by an
-- admin. No column-type change (still jsonb), so no RLS policy changes needed.
update public.puck_pages
set data = jsonb_build_object('lt', data, 'en', data)
where not (data ? 'lt' and data ? 'en');
