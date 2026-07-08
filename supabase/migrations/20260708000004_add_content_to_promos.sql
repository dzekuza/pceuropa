alter table public.promos
add column if not exists content text not null default '';
