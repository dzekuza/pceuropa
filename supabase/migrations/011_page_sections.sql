-- supabase/migrations/011_page_sections.sql
-- Stores editable content for public-facing pages (landing, etc.)
-- Admins manage content via /admin/pages; public pages read it with the anon key.

CREATE TABLE public.page_sections (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug   text NOT NULL,
  section_key text NOT NULL,
  content_key text NOT NULL,
  value       text,
  updated_at  timestamptz DEFAULT now(),
  UNIQUE(page_slug, section_key, content_key)
);

ALTER TABLE public.page_sections ENABLE ROW LEVEL SECURITY;

-- Admin can manage all page content
CREATE POLICY "page_sections_admin_all" ON public.page_sections
  FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Public (anon + authenticated) can read page content for rendering public pages
CREATE POLICY "page_sections_public_select" ON public.page_sections
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE INDEX ON public.page_sections(page_slug, section_key);
