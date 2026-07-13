-- Re-fix security_definer_view for tenants_public. The prior attempt
-- (20260703180647) set security_invoker = on but was reverted
-- (20260706000001) because anon has no RLS path into tenants, breaking
-- every public marketing page (parduotuves, restoranai, sportas,
-- laisvalaikis, darbo-laikas, planas, dialogai).
--
-- This time, grant anon read access to exactly the non-sensitive columns
-- tenants_public projects (id, store_name, category, logo_url,
-- gallery_images, description), scoped to the anon role only so it does not
-- create a second permissive SELECT policy for authenticated (which would
-- reintroduce the multiple_permissive_policies advisory). Column-level GRANT
-- keeps this equivalent in exposure to the current security-definer view,
-- even if queried directly against the base table.

GRANT SELECT (id, store_name, category, logo_url, gallery_images, description)
  ON public.tenants TO anon;

CREATE POLICY "tenants_anon_public_select" ON public.tenants
  FOR SELECT TO anon
  USING (true);

ALTER VIEW public.tenants_public SET (security_invoker = on);
