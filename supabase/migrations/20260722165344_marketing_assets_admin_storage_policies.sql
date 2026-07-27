-- storage.objects has RLS enabled but no policies on the public marketing-assets
-- bucket, so every client-side upload (admin Straipsniai image field) was denied
-- with "new row violates row-level security policy". Public reads keep working via
-- the public storage endpoint; these policies grant write access to admins only.

drop policy if exists "Admins can upload marketing-assets" on storage.objects;
drop policy if exists "Admins can update marketing-assets" on storage.objects;
drop policy if exists "Admins can delete marketing-assets" on storage.objects;

create policy "Admins can upload marketing-assets"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'marketing-assets'
    and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  );

create policy "Admins can update marketing-assets"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'marketing-assets'
    and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  )
  with check (
    bucket_id = 'marketing-assets'
    and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  );

create policy "Admins can delete marketing-assets"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'marketing-assets'
    and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  );
