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

-- RLS: public can read published promos; admins can read all (draft + published)
-- so the admin list/edit pages (which use the RLS-bound SSR client, not the
-- service-role client) can see and open drafts. Merged into one SELECT policy
-- per table to avoid the multiple_permissive_policies advisor finding — see
-- 20260703180647_rls_perf_and_security_fixes.sql for the same pattern.
alter table public.promos enable row level security;

create policy "Public and admin can read promos"
  on public.promos
  for select
  using (
    published = true
    or ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Admin writes (insert/update/delete) go through the service role client
-- (actions/promos.ts), which bypasses RLS automatically.
