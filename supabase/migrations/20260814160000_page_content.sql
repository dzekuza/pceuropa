-- ============================================================================
-- page_content: generic per-page draft/publish content store for the
-- on-page Edit Toolbar (inline editing directly on public marketing pages,
-- alongside the existing puck_pages/page_sections admin editors).
-- ============================================================================

create table if not exists public.page_content (
  id             uuid primary key default gen_random_uuid(),
  page_slug      text not null unique,
  published_data jsonb not null default '{}'::jsonb,
  draft_data     jsonb,
  draft_status   text not null default 'none'
                 constraint page_content_draft_status_check
                 check (draft_status in ('none', 'editing', 'ready')),
  updated_at     timestamptz not null default now(),
  updated_by     uuid references auth.users(id) on delete set null
);

comment on table public.page_content is
  'Generic key-value content store per page slug for the on-page Edit Toolbar. published_data is what the public site renders; draft_data is the admin''s in-progress copy, edited inline, then pushed live via Publish.';
comment on column public.page_content.published_data is
  'Flat Record<string,string> keyed by stable field ids, e.g. {"hero.title": "...", "hero.subtitle": "..."}.';
comment on column public.page_content.draft_data is
  'Same shape as published_data. Null when draft_status = ''none''. Never expose this column to public/non-admin queries at the application layer.';

create or replace function public.page_content_set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists page_content_set_updated_at on public.page_content;
create trigger page_content_set_updated_at
  before update on public.page_content
  for each row
  execute function public.page_content_set_updated_at();

-- Reuses the same app_metadata.role = 'admin' JWT claim convention as the
-- rest of pceuropa (see lib/supabase/admin.ts, CLAUDE.md).
create or replace function public.page_content_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

comment on function public.page_content_is_admin() is
  'Admin check for page_content RLS, reading app_metadata.role from the JWT (pceuropa convention).';

alter table public.page_content enable row level security;

-- Rows are visible to everyone (content is public by nature). Column-level
-- restriction is NOT enforced here -- the app layer (hooks/use-page-content.ts,
-- app/actions/page-content-actions.ts) is responsible for never selecting
-- draft_data on non-admin code paths.
create policy "page_content_public_select"
  on public.page_content
  for select
  to anon, authenticated
  using (true);

create policy "page_content_admin_insert"
  on public.page_content
  for insert
  to authenticated
  with check (public.page_content_is_admin());

create policy "page_content_admin_update"
  on public.page_content
  for update
  to authenticated
  using (public.page_content_is_admin())
  with check (public.page_content_is_admin());

create policy "page_content_admin_delete"
  on public.page_content
  for delete
  to authenticated
  using (public.page_content_is_admin());

create index if not exists page_content_page_slug_idx on public.page_content (page_slug);
