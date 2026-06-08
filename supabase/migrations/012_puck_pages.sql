create table public.puck_pages (
  id uuid primary key default gen_random_uuid(),
  page_slug text unique not null,
  data jsonb not null default '{"content":[],"root":{"props":{}},"zones":{}}',
  updated_at timestamptz default now()
);

alter table public.puck_pages enable row level security;

create policy "Public read puck pages"
  on public.puck_pages for select
  to anon, authenticated
  using (true);

create policy "Admin write puck pages"
  on public.puck_pages for all
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
