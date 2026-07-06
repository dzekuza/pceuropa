-- supabase/migrations/20260706000002_create_promos_table.sql
create table if not exists public.promos (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  slug         text not null unique,
  image        text,
  starts_at    date not null,
  ends_at      date not null,
  category     text not null default 'stores'
               check (category in ('stores', 'services', 'food')),
  published    boolean not null default false,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- RLS: public can only read published promos
alter table public.promos enable row level security;

create policy "Public can read published promos"
  on public.promos
  for select
  using (published = true);

-- Admin full access via service role (bypasses RLS automatically)
