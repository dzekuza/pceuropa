-- storage.objects has RLS enabled but no policies on the tenant-assets bucket,
-- so admin uploads (tenant logo/gallery images in TenantFormSheet) were denied
-- with "new row violates row-level security policy" — same gap fixed for
-- marketing-assets in 20260722165344. Public reads keep working via the public
-- storage endpoint; these policies grant write access to admins only.

drop policy if exists "Admins can upload tenant-assets" on storage.objects;
drop policy if exists "Admins can update tenant-assets" on storage.objects;
drop policy if exists "Admins can delete tenant-assets" on storage.objects;

create policy "Admins can upload tenant-assets"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'tenant-assets'
    and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  );

create policy "Admins can update tenant-assets"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'tenant-assets'
    and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  )
  with check (
    bucket_id = 'tenant-assets'
    and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  );

create policy "Admins can delete tenant-assets"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'tenant-assets'
    and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  );
