-- 013_create_articles_table.sql
create table if not exists public.articles (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  slug         text not null unique,
  content      text not null default '',
  cover_image  text,
  category     text not null default 'Naujiena'
               check (category in ('Naujiena', 'Akcija', 'Renginys')),
  featured     boolean not null default false,
  published    boolean not null default false,
  published_at timestamptz,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- RLS: public can only read published articles
alter table public.articles enable row level security;

create policy "Public can read published articles"
  on public.articles
  for select
  using (published = true);

-- Admin full access via service role (bypasses RLS automatically)
