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

-- Seed existing static PROMO_ITEMS (lib/promo-data.ts) so the public /akcijos
-- page shows the same content immediately after cutover.
insert into public.promos (title, slug, image, starts_at, ends_at, category, published)
values
  ('Papildoma nuolaida Rieker!', 'rieker',
   'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/news-1.jpg',
   '2026-03-25', '2026-03-29', 'stores', true),
  ('Kvepia pavasariu', 'pavasaris',
   'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/news-2.jpg',
   '2026-03-25', '2026-03-29', 'stores', true),
  ('Samsung naujienos', 'samsung',
   'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/news-3.jpg',
   '2026-03-25', '2026-03-29', 'stores', true),
  ('Vision Express akcija', 'vision-express',
   'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/news-4.jpg',
   '2026-03-25', '2026-03-29', 'services', true),
  ('Nauja kolekcija Lindex', 'lindex',
   'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/news-1.jpg',
   '2026-04-01', '2026-04-14', 'stores', true),
  ('Vasaros išpardavimas', 'vasara',
   'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/news-2.jpg',
   '2026-06-01', '2026-06-30', 'stores', true),
  ('Sporto prekių nuolaidos', 'sportas',
   'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/news-3.jpg',
   '2026-05-15', '2026-05-31', 'services', true),
  ('Caffeine kavos diena', 'caffeine',
   'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/news-4.jpg',
   '2026-06-10', '2026-06-10', 'food', true),
  ('IKI maisto akcija', 'iki',
   'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/news-1.jpg',
   '2026-06-05', '2026-06-11', 'food', true),
  ('Miyako sushi akcija', 'miyako',
   'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/news-2.jpg',
   '2026-06-01', '2026-06-07', 'food', true)
on conflict (slug) do nothing;
