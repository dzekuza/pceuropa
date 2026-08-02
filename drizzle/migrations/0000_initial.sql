CREATE TABLE "articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"cover_image" text,
	"category" text DEFAULT 'Naujiena' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "articles_slug_unique" UNIQUE("slug"),
	CONSTRAINT "articles_category_check" CHECK ("articles"."category" IN ('Naujiena', 'Akcija', 'Renginys'))
);
--> statement-breakpoint
CREATE TABLE "faq_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"attachments" text[] DEFAULT '{}'::text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "moderan_sync_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"month" date NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sent_by" uuid,
	"results" jsonb NOT NULL,
	CONSTRAINT "moderan_sync_log_month_unique" UNIQUE("month")
);
--> statement-breakpoint
CREATE TABLE "page_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_slug" text NOT NULL,
	"section_key" text NOT NULL,
	"content_key" text NOT NULL,
	"value" text,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "promos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"image" text,
	"starts_at" date NOT NULL,
	"ends_at" date NOT NULL,
	"category" text DEFAULT 'stores' NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"content" text DEFAULT '' NOT NULL,
	CONSTRAINT "promos_slug_unique" UNIQUE("slug"),
	CONSTRAINT "promos_category_check" CHECK ("promos"."category" IN ('stores', 'services', 'food'))
);
--> statement-breakpoint
CREATE TABLE "puck_pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_slug" text NOT NULL,
	"data" jsonb DEFAULT '{"content":[],"root":{"props":{}},"zones":{}}'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "puck_pages_page_slug_unique" UNIQUE("page_slug")
);
--> statement-breakpoint
CREATE TABLE "revenue_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"tenant_id" uuid,
	"month" date NOT NULL,
	"amount_eur" numeric NOT NULL,
	"tx_count" integer,
	"submitted_at" timestamp with time zone DEFAULT now(),
	"weeks" jsonb,
	"submitted_by" text
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"store_name" text NOT NULL,
	"operator" text,
	"company_code" text,
	"category" text,
	"space_m2" numeric,
	"rent_eur" numeric,
	"created_at" timestamp with time zone DEFAULT now(),
	"login_password" text,
	"logo_url" text,
	"gallery_images" text[] DEFAULT '{}'::text[],
	"description" text,
	"weekday_hours" text DEFAULT '10:00–21:00' NOT NULL,
	"saturday_hours" text DEFAULT '10:00–20:00' NOT NULL,
	"sunday_hours" text DEFAULT '10:00–20:00' NOT NULL,
	"slug" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "revenue_reports" ADD CONSTRAINT "revenue_reports_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "faq_items_sort_order_idx" ON "faq_items" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "moderan_sync_log_sent_by_idx" ON "moderan_sync_log" USING btree ("sent_by");--> statement-breakpoint
CREATE UNIQUE INDEX "page_sections_slug_section_content_key" ON "page_sections" USING btree ("page_slug","section_key","content_key");--> statement-breakpoint
CREATE INDEX "page_sections_slug_section_idx" ON "page_sections" USING btree ("page_slug","section_key");--> statement-breakpoint
CREATE UNIQUE INDEX "revenue_reports_tenant_id_month_key" ON "revenue_reports" USING btree ("tenant_id","month");--> statement-breakpoint
CREATE INDEX "revenue_reports_user_id_idx" ON "revenue_reports" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "revenue_reports_month_idx" ON "revenue_reports" USING btree ("month");--> statement-breakpoint
CREATE UNIQUE INDEX "tenants_slug_unique" ON "tenants" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "tenants_user_id_idx" ON "tenants" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "tenants_store_name_idx" ON "tenants" USING btree ("store_name");--> statement-breakpoint
CREATE INDEX "tenants_created_at_idx" ON "tenants" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
-- ─────────────────────────────────────────────────────────────────────────
-- Row Level Security
--
-- Enabled on every table that had RLS enabled in Supabase (see individual
-- CREATE TABLE migrations under supabase/migrations/). Policies themselves
-- live in drizzle/rls-policies.sql (ported individually, one per source
-- migration) and are appended below, EXCLUDING the storage.objects policies
-- from supabase/migrations/20260722165344_marketing_assets_admin_storage_policies.sql,
-- since storage.objects does not exist in a plain Postgres database — see
-- drizzle/MIGRATION_NOTES.md.
--
-- Policies below grant/reference the `anon` and `authenticated` roles that
-- Supabase provisions automatically. Plain Postgres has neither by default,
-- so this migration creates them (NOLOGIN, no special privileges) if
-- missing. The app layer's connection role must be granted membership in
-- whichever of these roles matches the request, e.g.:
--   GRANT authenticated TO app_user; GRANT anon TO app_user;
-- and switch context per request with `SET LOCAL ROLE` or by relying purely
-- on `current_setting('app.user_role', true)` in the USING clauses (already
-- done below) — the TO anon/TO authenticated targets are kept only for
-- parity with the Supabase originals and can be dropped in favor of `TO
-- PUBLIC` if the target deployment does not model these as distinct
-- Postgres roles.
-- ─────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN;
  END IF;
END
$$;--> statement-breakpoint
ALTER TABLE "tenants" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "revenue_reports" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "faq_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "page_sections" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "puck_pages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "articles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "moderan_sync_log" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "promos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

-- Policies carried over unchanged from Supabase (USING (true) — no auth fn):
CREATE POLICY "faq_authenticated_select" ON "faq_items"
  FOR SELECT TO authenticated
  USING (true);--> statement-breakpoint
CREATE POLICY "page_sections_public_select" ON "page_sections"
  FOR SELECT TO anon, authenticated
  USING (true);--> statement-breakpoint
CREATE POLICY "Public read puck pages" ON "puck_pages"
  FOR SELECT TO anon, authenticated
  USING (true);--> statement-breakpoint
CREATE POLICY "Public can read published articles" ON "articles"
  FOR SELECT
  USING (published = true);--> statement-breakpoint

-- current_setting()-based policies (ported from Supabase auth.uid()/auth.jwt()
-- policies) — see drizzle/rls-policies.sql for the full source-to-destination
-- mapping and per-policy provenance comments.

-- ═══════════════════════════════════════════════════════════════════════
-- tenants
-- ═══════════════════════════════════════════════════════════════════════

-- Source: 20260703180647_rls_perf_and_security_fixes.sql
-- (supersedes "tenants_admin_all" from 001_initial_schema.sql)
CREATE POLICY "tenants_admin_insert" ON public.tenants
  FOR INSERT TO authenticated
  WITH CHECK (current_setting('app.user_role', true) = 'admin');

-- Source: 20260703180647_rls_perf_and_security_fixes.sql
CREATE POLICY "tenants_admin_update" ON public.tenants
  FOR UPDATE TO authenticated
  USING (current_setting('app.user_role', true) = 'admin')
  WITH CHECK (current_setting('app.user_role', true) = 'admin');

-- Source: 20260703180647_rls_perf_and_security_fixes.sql
CREATE POLICY "tenants_admin_delete" ON public.tenants
  FOR DELETE TO authenticated
  USING (current_setting('app.user_role', true) = 'admin');

-- Source: 20260703180647_rls_perf_and_security_fixes.sql
-- (supersedes "tenants_seller_own_select" from 001_initial_schema.sql)
CREATE POLICY "tenants_select" ON public.tenants
  FOR SELECT TO authenticated
  USING (
    current_setting('app.user_role', true) = 'admin'
    OR (
      current_setting('app.user_role', true) = 'seller'
      AND user_id = current_setting('app.user_id', true)::uuid
    )
  );

-- Source: 20260713120000_tenants_public_security_invoker_with_anon_policy.sql
-- Uses USING (true) — no auth.uid()/auth.jwt() involved, so no rewrite is
-- needed. Included here only for completeness since it's part of the same
-- live table's policy set; see drizzle/tenants-public-view.sql for the full
-- context (column-level grants + tenants_public view).
CREATE POLICY "tenants_anon_public_select" ON public.tenants
  FOR SELECT TO anon
  USING (true);

-- ═══════════════════════════════════════════════════════════════════════
-- revenue_reports
-- ═══════════════════════════════════════════════════════════════════════

-- Source: 20260703180647_rls_perf_and_security_fixes.sql
-- (supersedes "revenue_admin_all" from 001_initial_schema.sql)
CREATE POLICY "revenue_admin_delete" ON public.revenue_reports
  FOR DELETE TO authenticated
  USING (current_setting('app.user_role', true) = 'admin');

-- Source: 20260703180647_rls_perf_and_security_fixes.sql
-- (supersedes "revenue_seller_tenant_select" from
-- 20260703164444_revenue_seller_tenant_rls.sql, which itself superseded
-- "revenue_seller_own_select" from 001_initial_schema.sql)
CREATE POLICY "revenue_select" ON public.revenue_reports
  FOR SELECT TO authenticated
  USING (
    current_setting('app.user_role', true) = 'admin'
    OR tenant_id IN (
      SELECT id FROM public.tenants
      WHERE user_id = current_setting('app.user_id', true)::uuid
    )
  );

-- Source: 20260703180647_rls_perf_and_security_fixes.sql
-- (supersedes "revenue_seller_tenant_insert" from
-- 20260703164444_revenue_seller_tenant_rls.sql, which itself superseded
-- "revenue_seller_own_insert" from 001_initial_schema.sql)
CREATE POLICY "revenue_insert" ON public.revenue_reports
  FOR INSERT TO authenticated
  WITH CHECK (
    current_setting('app.user_role', true) = 'admin'
    OR (
      current_setting('app.user_role', true) = 'seller'
      AND tenant_id IN (
        SELECT id FROM public.tenants
        WHERE user_id = current_setting('app.user_id', true)::uuid
      )
    )
  );

-- Source: 20260703180647_rls_perf_and_security_fixes.sql
-- (supersedes "revenue_seller_tenant_update" from
-- 20260703164444_revenue_seller_tenant_rls.sql, which itself superseded
-- "revenue_seller_own_update" from 001_initial_schema.sql)
CREATE POLICY "revenue_update" ON public.revenue_reports
  FOR UPDATE TO authenticated
  USING (
    current_setting('app.user_role', true) = 'admin'
    OR (
      current_setting('app.user_role', true) = 'seller'
      AND tenant_id IN (
        SELECT id FROM public.tenants
        WHERE user_id = current_setting('app.user_id', true)::uuid
      )
    )
  )
  WITH CHECK (
    current_setting('app.user_role', true) = 'admin'
    OR (
      current_setting('app.user_role', true) = 'seller'
      AND tenant_id IN (
        SELECT id FROM public.tenants
        WHERE user_id = current_setting('app.user_id', true)::uuid
      )
    )
  );

-- ═══════════════════════════════════════════════════════════════════════
-- faq_items
-- ═══════════════════════════════════════════════════════════════════════

-- Source: 20260703180647_rls_perf_and_security_fixes.sql
-- (supersedes "faq_admin_all" from 001_initial_schema.sql)
CREATE POLICY "faq_admin_insert" ON public.faq_items
  FOR INSERT TO authenticated
  WITH CHECK (current_setting('app.user_role', true) = 'admin');

-- Source: 20260703180647_rls_perf_and_security_fixes.sql
CREATE POLICY "faq_admin_update" ON public.faq_items
  FOR UPDATE TO authenticated
  USING (current_setting('app.user_role', true) = 'admin')
  WITH CHECK (current_setting('app.user_role', true) = 'admin');

-- Source: 20260703180647_rls_perf_and_security_fixes.sql
CREATE POLICY "faq_admin_delete" ON public.faq_items
  FOR DELETE TO authenticated
  USING (current_setting('app.user_role', true) = 'admin');

-- NOTE: "faq_authenticated_select" (001_initial_schema.sql) uses
-- USING (true) — no auth fn, not ported here, carried over unchanged.

-- ═══════════════════════════════════════════════════════════════════════
-- page_sections
-- ═══════════════════════════════════════════════════════════════════════

-- Source: 20260703180647_rls_perf_and_security_fixes.sql
-- (supersedes "page_sections_admin_all" from 011_page_sections.sql)
CREATE POLICY "page_sections_admin_insert" ON public.page_sections
  FOR INSERT TO authenticated
  WITH CHECK (current_setting('app.user_role', true) = 'admin');

-- Source: 20260703180647_rls_perf_and_security_fixes.sql
CREATE POLICY "page_sections_admin_update" ON public.page_sections
  FOR UPDATE TO authenticated
  USING (current_setting('app.user_role', true) = 'admin')
  WITH CHECK (current_setting('app.user_role', true) = 'admin');

-- Source: 20260703180647_rls_perf_and_security_fixes.sql
CREATE POLICY "page_sections_admin_delete" ON public.page_sections
  FOR DELETE TO authenticated
  USING (current_setting('app.user_role', true) = 'admin');

-- NOTE: "page_sections_public_select" (011_page_sections.sql) uses
-- USING (true) — no auth fn, not ported here, carried over unchanged.

-- ═══════════════════════════════════════════════════════════════════════
-- puck_pages
-- ═══════════════════════════════════════════════════════════════════════

-- Source: 20260703180647_rls_perf_and_security_fixes.sql
-- (supersedes "Admin write puck pages" from 012_puck_pages.sql)
CREATE POLICY "Admin insert puck pages" ON public.puck_pages
  FOR INSERT TO authenticated
  WITH CHECK (current_setting('app.user_role', true) = 'admin');

-- Source: 20260703180647_rls_perf_and_security_fixes.sql
CREATE POLICY "Admin update puck pages" ON public.puck_pages
  FOR UPDATE TO authenticated
  USING (current_setting('app.user_role', true) = 'admin')
  WITH CHECK (current_setting('app.user_role', true) = 'admin');

-- Source: 20260703180647_rls_perf_and_security_fixes.sql
CREATE POLICY "Admin delete puck pages" ON public.puck_pages
  FOR DELETE TO authenticated
  USING (current_setting('app.user_role', true) = 'admin');

-- NOTE: "Public read puck pages" (012_puck_pages.sql) uses USING (true) —
-- no auth fn, not ported here, carried over unchanged.

-- ═══════════════════════════════════════════════════════════════════════
-- moderan_sync_log
-- ═══════════════════════════════════════════════════════════════════════

-- Source: 20260703180647_rls_perf_and_security_fixes.sql
-- (supersedes "Admin only" from 20260703000001_moderan_sync_log.sql —
-- same policy name, re-created with the (select ...) initplan wrapper,
-- here further rewritten to current_setting)
CREATE POLICY "Admin only" ON public.moderan_sync_log
  FOR ALL
  USING (current_setting('app.user_role', true) = 'admin');

-- ═══════════════════════════════════════════════════════════════════════
-- promos
-- ═══════════════════════════════════════════════════════════════════════

-- Source: 20260706000002_create_promos_table.sql
CREATE POLICY "Public and admin can read promos" ON public.promos
  FOR SELECT
  USING (
    published = true
    OR current_setting('app.user_role', true) = 'admin'
  );

-- ═══════════════════════════════════════════════════════════════════════

--> statement-breakpoint
-- ─────────────────────────────────────────────────────────────────────────
-- tenants_public view — see drizzle/tenants-public-view.sql for full
-- migration-by-migration provenance.
-- ─────────────────────────────────────────────────────────────────────────
-- Supabase's anon/authenticated roles, but the same mechanics apply 1:1 in
-- self-hosted Postgres: an ordinary view (no SECURITY DEFINER function
-- involved) always runs as the querying role, RLS on the base table still
-- applies, and column-level GRANTs still restrict which columns a role can
-- read through the view. Create an `anon` role in the target database to
-- preserve this exact boundary.

CREATE OR REPLACE VIEW public.tenants_public AS
  SELECT
    id,
    store_name,
    category,
    logo_url,
    gallery_images,
    description,
    weekday_hours,
    saturday_hours,
    sunday_hours,
    slug
  FROM public.tenants;

-- security_barrier is retained from the original Supabase definition: it
-- prevents the planner from pushing caller-supplied WHERE clauses through
-- the view in a way that could leak data via side-channels (timing/error
-- based inference on columns not in the projection).
ALTER VIEW public.tenants_public SET (security_barrier = true);

-- Column-level grant mirrors the exact projection above — anon can read
-- these columns whether queried through the view or (if ever exposed)
-- directly against the base table.
GRANT SELECT (
  id, store_name, category, logo_url, gallery_images, description,
  weekday_hours, saturday_hours, sunday_hours, slug
) ON public.tenants TO anon;

GRANT SELECT ON public.tenants_public TO anon;

-- NOTE: the "tenants_anon_public_select" policy this view depends on for
-- invoker-mode reads is already created earlier in this migration, in the
-- RLS policies section above (ported from
-- 20260713120000_tenants_public_security_invoker_with_anon_policy.sql).

--> statement-breakpoint
-- ─────────────────────────────────────────────────────────────────────────
-- RPC functions — see drizzle/rpc-functions.sql for the authorization
-- decision writeup.
-- ─────────────────────────────────────────────────────────────────────────
--        same self-enforcing admin check from step 2/3. This is the LIVE
--        definition being ported below.
--
-- AUTHORIZATION DECISION (explicit, not silent):
-- The live function (as of migration #4) already self-enforces admin-only
-- access via an in-body role check, plus a database-level EXECUTE grant
-- restricted to the `authenticated` role. This is a stronger posture than
-- the function's original (#1) comment suggests, and the port below
-- preserves that stronger, self-enforcing posture — it does NOT revert to
-- "trust the app tier" (#1's original design). Every caller of this function
-- must have already run `SET LOCAL app.user_role = '<role>'` in the same
-- transaction (mirroring how Supabase populated auth.jwt() per request), and
-- the function raises an exception if that role is not exactly 'admin'.
-- This means the port is self-enforcing defense-in-depth on top of
-- application-tier gating, not a replacement for it — the app layer should
-- still avoid calling this RPC for non-admin sessions in the first place.
CREATE OR REPLACE FUNCTION public.get_admin_monthly_stats(start_month_str text)
RETURNS TABLE (
  month_date text,
  total_revenue numeric,
  total_tx integer,
  submission_count integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  start_month_date date := start_month_str::date;
BEGIN
  IF current_setting('app.user_role', true) IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  RETURN QUERY
  SELECT
    to_char(r.month, 'YYYY-MM-DD') AS month_date,
    COALESCE(SUM(r.amount_eur), 0)::numeric AS total_revenue,
    COALESCE(SUM(r.tx_count), 0)::int AS total_tx,
    COUNT(r.id)::int AS submission_count
  FROM public.revenue_reports r
  WHERE r.month >= start_month_date
  GROUP BY r.month
  ORDER BY r.month ASC;
END;
$$;

-- No PUBLIC/anon execute grant is issued here (mirrors the revoke-everything
-- posture from migrations #2/#3). Grant EXECUTE explicitly to whatever
-- application/service role runs authenticated queries in the target
-- database, e.g.:
--   GRANT EXECUTE ON FUNCTION public.get_admin_monthly_stats(text) TO app_user;

-- ─────────────────────────────────────────────────────────────────────────
-- get_admin_yearly_overview
--
-- Source: supabase/migrations/20260708000002_admin_overview_rpc.sql. This
-- function was introduced already self-enforcing (no prior "trust the app
-- tier" version existed for it — unlike get_admin_monthly_stats). Same
-- authorization decision applies: preserve the self-enforcing admin check,
-- translated to current_setting('app.user_role', true).
CREATE OR REPLACE FUNCTION public.get_admin_yearly_overview(target_year integer)
RETURNS TABLE (
  tenant_id uuid,
  store_name text,
  category text,
  month_date text,
  total_revenue numeric,
  total_tx integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  range_start date := make_date(target_year, 1, 1);
  range_end date := make_date(target_year + 1, 1, 1);
BEGIN
  IF current_setting('app.user_role', true) IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  RETURN QUERY
  SELECT
    t.id AS tenant_id,
    t.store_name,
    t.category,
    to_char(r.month, 'YYYY-MM-DD') AS month_date,
    COALESCE(SUM(r.amount_eur), 0)::numeric AS total_revenue,
    COALESCE(SUM(r.tx_count), 0)::int AS total_tx
  FROM public.revenue_reports r
  JOIN public.tenants t ON t.id = r.tenant_id
  WHERE r.month >= range_start
    AND r.month < range_end
  GROUP BY t.id, t.store_name, t.category, r.month
  ORDER BY t.store_name ASC, r.month ASC;
END;
$$;

-- Same grant convention as above:
--   GRANT EXECUTE ON FUNCTION public.get_admin_yearly_overview(integer) TO app_user;
