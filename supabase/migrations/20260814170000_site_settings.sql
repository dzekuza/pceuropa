-- Singleton table backing the public "coming soon" gate toggle.
-- id is a boolean-typed singleton key (must equal true) so the table can only ever hold one row.
create table if not exists site_settings (
  id boolean primary key default true,
  coming_soon_enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  constraint site_settings_singleton check (id)
);

insert into site_settings (id, coming_soon_enabled)
values (true, true)
on conflict (id) do nothing;

alter table site_settings enable row level security;

-- proxy.ts reads this on every public request (including anonymous visitors), so it must be publicly readable.
create policy "Public can read site settings"
  on site_settings for select
  using (true);

create policy "Admins can update site settings"
  on site_settings for update
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
