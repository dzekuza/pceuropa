-- Admin-authored standalone pages (title, cover image, rich text), served at /puslapiai/[slug]
create table if not exists public.custom_pages (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  title_en     text,
  slug         text not null unique,
  content      text not null default '',
  content_en   text,
  cover_image  text,
  published    boolean not null default false,
  published_at timestamptz,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

alter table public.custom_pages enable row level security;

create policy "Public can read published custom pages"
  on public.custom_pages
  for select
  using (published = true);

-- Admin writes go through server actions with the service role, which bypasses RLS.

grant select on public.custom_pages to anon, authenticated;
grant all on public.custom_pages to service_role;
