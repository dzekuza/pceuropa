-- storage.objects has no SELECT policy for marketing-assets or tenant-assets.
-- Supabase Storage's upload endpoint does an internal `insert ... returning`
-- to build its response, and Postgres re-checks the returned row against
-- SELECT policies — with none present, every authenticated upload to either
-- bucket failed with "new row violates row-level security policy" even
-- though the INSERT's own WITH CHECK passed (confirmed: the same INSERT
-- without RETURNING succeeds). Public reads are unaffected — they go through
-- the public storage endpoint, a separate code path that doesn't consult
-- these row-level policies.

drop policy if exists "Admins can view marketing-assets" on storage.objects;
drop policy if exists "Admins can view tenant-assets" on storage.objects;

create policy "Admins can view marketing-assets"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'marketing-assets'
    and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  );

create policy "Admins can view tenant-assets"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'tenant-assets'
    and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  );
