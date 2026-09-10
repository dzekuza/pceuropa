


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."get_admin_monthly_stats"("start_month_str" "text") RETURNS TABLE("month_date" "text", "total_revenue" numeric, "total_tx" integer, "submission_count" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  start_month_date date := start_month_str::date;
BEGIN
  IF ((select auth.jwt()) -> 'app_metadata' ->> 'role') IS DISTINCT FROM 'admin' THEN
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


ALTER FUNCTION "public"."get_admin_monthly_stats"("start_month_str" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_admin_yearly_overview"("target_year" integer) RETURNS TABLE("tenant_id" "uuid", "store_name" "text", "category" "text", "month_date" "text", "total_revenue" numeric, "total_tx" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  range_start date := make_date(target_year, 1, 1);
  range_end date := make_date(target_year + 1, 1, 1);
BEGIN
  IF ((select auth.jwt()) -> 'app_metadata' ->> 'role') IS DISTINCT FROM 'admin' THEN
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


ALTER FUNCTION "public"."get_admin_yearly_overview"("target_year" integer) OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."articles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "content" "text" DEFAULT ''::"text" NOT NULL,
    "cover_image" "text",
    "category" "text" DEFAULT 'Naujiena'::"text" NOT NULL,
    "featured" boolean DEFAULT false NOT NULL,
    "published" boolean DEFAULT false NOT NULL,
    "published_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "articles_category_check" CHECK (("category" = ANY (ARRAY['Naujiena'::"text", 'Akcija'::"text", 'Renginys'::"text"])))
);


ALTER TABLE "public"."articles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."faq_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "question" "text" NOT NULL,
    "answer" "text" NOT NULL,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "attachments" "text"[] DEFAULT '{}'::"text"[] NOT NULL
);


ALTER TABLE "public"."faq_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."moderan_sync_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "month" "date" NOT NULL,
    "sent_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "sent_by" "uuid",
    "results" "jsonb" NOT NULL
);


ALTER TABLE "public"."moderan_sync_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."page_sections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "page_slug" "text" NOT NULL,
    "section_key" "text" NOT NULL,
    "content_key" "text" NOT NULL,
    "value" "text",
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."page_sections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."promos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "image" "text",
    "starts_at" "date" NOT NULL,
    "ends_at" "date" NOT NULL,
    "category" "text" DEFAULT 'stores'::"text" NOT NULL,
    "published" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "content" "text" DEFAULT ''::"text" NOT NULL,
    CONSTRAINT "promos_category_check" CHECK (("category" = ANY (ARRAY['stores'::"text", 'services'::"text", 'food'::"text"])))
);


ALTER TABLE "public"."promos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."puck_pages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "page_slug" "text" NOT NULL,
    "data" "jsonb" DEFAULT '{"root": {"props": {}}, "zones": {}, "content": []}'::"jsonb" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."puck_pages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."revenue_reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "tenant_id" "uuid",
    "month" "date" NOT NULL,
    "amount_eur" numeric NOT NULL,
    "tx_count" integer,
    "submitted_at" timestamp with time zone DEFAULT "now"(),
    "weeks" "jsonb",
    "submitted_by" "text"
);


ALTER TABLE "public"."revenue_reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tenants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "store_name" "text" NOT NULL,
    "operator" "text",
    "company_code" "text",
    "category" "text",
    "space_m2" numeric,
    "rent_eur" numeric,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "login_password" "text",
    "logo_url" "text",
    "gallery_images" "text"[] DEFAULT '{}'::"text"[],
    "description" "text",
    "weekday_hours" "text" DEFAULT '10:00–21:00'::"text" NOT NULL,
    "saturday_hours" "text" DEFAULT '10:00–20:00'::"text" NOT NULL,
    "sunday_hours" "text" DEFAULT '10:00–20:00'::"text" NOT NULL,
    "slug" "text" NOT NULL
);


ALTER TABLE "public"."tenants" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."tenants_public" WITH ("security_barrier"='true', "security_invoker"='on') AS
 SELECT "id",
    "store_name",
    "category",
    "logo_url",
    "gallery_images",
    "description",
    "weekday_hours",
    "saturday_hours",
    "sunday_hours",
    "slug"
   FROM "public"."tenants";


ALTER VIEW "public"."tenants_public" OWNER TO "postgres";


ALTER TABLE ONLY "public"."articles"
    ADD CONSTRAINT "articles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."articles"
    ADD CONSTRAINT "articles_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."faq_items"
    ADD CONSTRAINT "faq_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."moderan_sync_log"
    ADD CONSTRAINT "moderan_sync_log_month_key" UNIQUE ("month");



ALTER TABLE ONLY "public"."moderan_sync_log"
    ADD CONSTRAINT "moderan_sync_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."page_sections"
    ADD CONSTRAINT "page_sections_page_slug_section_key_content_key_key" UNIQUE ("page_slug", "section_key", "content_key");



ALTER TABLE ONLY "public"."page_sections"
    ADD CONSTRAINT "page_sections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."promos"
    ADD CONSTRAINT "promos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."promos"
    ADD CONSTRAINT "promos_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."puck_pages"
    ADD CONSTRAINT "puck_pages_page_slug_key" UNIQUE ("page_slug");



ALTER TABLE ONLY "public"."puck_pages"
    ADD CONSTRAINT "puck_pages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."revenue_reports"
    ADD CONSTRAINT "revenue_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."revenue_reports"
    ADD CONSTRAINT "revenue_reports_tenant_id_month_key" UNIQUE ("tenant_id", "month");



ALTER TABLE ONLY "public"."tenants"
    ADD CONSTRAINT "tenants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tenants"
    ADD CONSTRAINT "tenants_slug_unique" UNIQUE ("slug");



CREATE INDEX "faq_items_sort_order_idx" ON "public"."faq_items" USING "btree" ("sort_order");



CREATE INDEX "moderan_sync_log_sent_by_idx" ON "public"."moderan_sync_log" USING "btree" ("sent_by");



CREATE INDEX "page_sections_page_slug_section_key_idx" ON "public"."page_sections" USING "btree" ("page_slug", "section_key");



CREATE INDEX "revenue_reports_month_idx" ON "public"."revenue_reports" USING "btree" ("month");



CREATE INDEX "revenue_reports_tenant_id_month_idx" ON "public"."revenue_reports" USING "btree" ("tenant_id", "month");



CREATE INDEX "revenue_reports_user_id_idx" ON "public"."revenue_reports" USING "btree" ("user_id");



CREATE INDEX "tenants_created_at_idx" ON "public"."tenants" USING "btree" ("created_at" DESC);



CREATE INDEX "tenants_store_name_idx" ON "public"."tenants" USING "btree" ("store_name");



CREATE INDEX "tenants_user_id_idx" ON "public"."tenants" USING "btree" ("user_id");



ALTER TABLE ONLY "public"."moderan_sync_log"
    ADD CONSTRAINT "moderan_sync_log_sent_by_fkey" FOREIGN KEY ("sent_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."revenue_reports"
    ADD CONSTRAINT "revenue_reports_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."revenue_reports"
    ADD CONSTRAINT "revenue_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tenants"
    ADD CONSTRAINT "tenants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admin delete puck pages" ON "public"."puck_pages" FOR DELETE TO "authenticated" USING ((((( SELECT "auth"."jwt"() AS "jwt") -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "Admin insert puck pages" ON "public"."puck_pages" FOR INSERT TO "authenticated" WITH CHECK ((((( SELECT "auth"."jwt"() AS "jwt") -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "Admin only" ON "public"."moderan_sync_log" USING ((((( SELECT "auth"."jwt"() AS "jwt") -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "Admin update puck pages" ON "public"."puck_pages" FOR UPDATE TO "authenticated" USING ((((( SELECT "auth"."jwt"() AS "jwt") -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text")) WITH CHECK ((((( SELECT "auth"."jwt"() AS "jwt") -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "Public and admin can read promos" ON "public"."promos" FOR SELECT USING ((("published" = true) OR (((( SELECT "auth"."jwt"() AS "jwt") -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text")));



CREATE POLICY "Public can read published articles" ON "public"."articles" FOR SELECT USING (("published" = true));



CREATE POLICY "Public read puck pages" ON "public"."puck_pages" FOR SELECT TO "authenticated", "anon" USING (true);



ALTER TABLE "public"."articles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "faq_admin_delete" ON "public"."faq_items" FOR DELETE TO "authenticated" USING ((((( SELECT "auth"."jwt"() AS "jwt") -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "faq_admin_insert" ON "public"."faq_items" FOR INSERT TO "authenticated" WITH CHECK ((((( SELECT "auth"."jwt"() AS "jwt") -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "faq_admin_update" ON "public"."faq_items" FOR UPDATE TO "authenticated" USING ((((( SELECT "auth"."jwt"() AS "jwt") -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text")) WITH CHECK ((((( SELECT "auth"."jwt"() AS "jwt") -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "faq_authenticated_select" ON "public"."faq_items" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."faq_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."moderan_sync_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."page_sections" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "page_sections_admin_delete" ON "public"."page_sections" FOR DELETE TO "authenticated" USING ((((( SELECT "auth"."jwt"() AS "jwt") -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "page_sections_admin_insert" ON "public"."page_sections" FOR INSERT TO "authenticated" WITH CHECK ((((( SELECT "auth"."jwt"() AS "jwt") -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "page_sections_admin_update" ON "public"."page_sections" FOR UPDATE TO "authenticated" USING ((((( SELECT "auth"."jwt"() AS "jwt") -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text")) WITH CHECK ((((( SELECT "auth"."jwt"() AS "jwt") -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "page_sections_public_select" ON "public"."page_sections" FOR SELECT TO "authenticated", "anon" USING (true);



ALTER TABLE "public"."promos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."puck_pages" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "revenue_admin_delete" ON "public"."revenue_reports" FOR DELETE TO "authenticated" USING ((((( SELECT "auth"."jwt"() AS "jwt") -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "revenue_insert" ON "public"."revenue_reports" FOR INSERT TO "authenticated" WITH CHECK (((((( SELECT "auth"."jwt"() AS "jwt") -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text") OR ((((( SELECT "auth"."jwt"() AS "jwt") -> 'app_metadata'::"text") ->> 'role'::"text") = 'seller'::"text") AND ("tenant_id" IN ( SELECT "tenants"."id"
   FROM "public"."tenants"
  WHERE ("tenants"."user_id" = ( SELECT "auth"."uid"() AS "uid")))))));



ALTER TABLE "public"."revenue_reports" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "revenue_select" ON "public"."revenue_reports" FOR SELECT TO "authenticated" USING (((((( SELECT "auth"."jwt"() AS "jwt") -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text") OR ("tenant_id" IN ( SELECT "tenants"."id"
   FROM "public"."tenants"
  WHERE ("tenants"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "revenue_update" ON "public"."revenue_reports" FOR UPDATE TO "authenticated" USING (((((( SELECT "auth"."jwt"() AS "jwt") -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text") OR ((((( SELECT "auth"."jwt"() AS "jwt") -> 'app_metadata'::"text") ->> 'role'::"text") = 'seller'::"text") AND ("tenant_id" IN ( SELECT "tenants"."id"
   FROM "public"."tenants"
  WHERE ("tenants"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))))) WITH CHECK (((((( SELECT "auth"."jwt"() AS "jwt") -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text") OR ((((( SELECT "auth"."jwt"() AS "jwt") -> 'app_metadata'::"text") ->> 'role'::"text") = 'seller'::"text") AND ("tenant_id" IN ( SELECT "tenants"."id"
   FROM "public"."tenants"
  WHERE ("tenants"."user_id" = ( SELECT "auth"."uid"() AS "uid")))))));



ALTER TABLE "public"."tenants" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "tenants_admin_delete" ON "public"."tenants" FOR DELETE TO "authenticated" USING ((((( SELECT "auth"."jwt"() AS "jwt") -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "tenants_admin_insert" ON "public"."tenants" FOR INSERT TO "authenticated" WITH CHECK ((((( SELECT "auth"."jwt"() AS "jwt") -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "tenants_admin_update" ON "public"."tenants" FOR UPDATE TO "authenticated" USING ((((( SELECT "auth"."jwt"() AS "jwt") -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text")) WITH CHECK ((((( SELECT "auth"."jwt"() AS "jwt") -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "tenants_anon_public_select" ON "public"."tenants" FOR SELECT TO "anon" USING (true);



CREATE POLICY "tenants_select" ON "public"."tenants" FOR SELECT TO "authenticated" USING (((((( SELECT "auth"."jwt"() AS "jwt") -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text") OR ((((( SELECT "auth"."jwt"() AS "jwt") -> 'app_metadata'::"text") ->> 'role'::"text") = 'seller'::"text") AND ("user_id" = ( SELECT "auth"."uid"() AS "uid")))));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































REVOKE ALL ON FUNCTION "public"."get_admin_monthly_stats"("start_month_str" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_admin_monthly_stats"("start_month_str" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_admin_monthly_stats"("start_month_str" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_admin_yearly_overview"("target_year" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_admin_yearly_overview"("target_year" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_admin_yearly_overview"("target_year" integer) TO "service_role";


















GRANT ALL ON TABLE "public"."articles" TO "anon";
GRANT ALL ON TABLE "public"."articles" TO "authenticated";
GRANT ALL ON TABLE "public"."articles" TO "service_role";



GRANT ALL ON TABLE "public"."faq_items" TO "anon";
GRANT ALL ON TABLE "public"."faq_items" TO "authenticated";
GRANT ALL ON TABLE "public"."faq_items" TO "service_role";



GRANT ALL ON TABLE "public"."moderan_sync_log" TO "anon";
GRANT ALL ON TABLE "public"."moderan_sync_log" TO "authenticated";
GRANT ALL ON TABLE "public"."moderan_sync_log" TO "service_role";



GRANT ALL ON TABLE "public"."page_sections" TO "anon";
GRANT ALL ON TABLE "public"."page_sections" TO "authenticated";
GRANT ALL ON TABLE "public"."page_sections" TO "service_role";



GRANT ALL ON TABLE "public"."promos" TO "anon";
GRANT ALL ON TABLE "public"."promos" TO "authenticated";
GRANT ALL ON TABLE "public"."promos" TO "service_role";



GRANT ALL ON TABLE "public"."puck_pages" TO "anon";
GRANT ALL ON TABLE "public"."puck_pages" TO "authenticated";
GRANT ALL ON TABLE "public"."puck_pages" TO "service_role";



GRANT ALL ON TABLE "public"."revenue_reports" TO "anon";
GRANT ALL ON TABLE "public"."revenue_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."revenue_reports" TO "service_role";



GRANT ALL ON TABLE "public"."tenants" TO "anon";
GRANT ALL ON TABLE "public"."tenants" TO "authenticated";
GRANT ALL ON TABLE "public"."tenants" TO "service_role";



GRANT SELECT("id") ON TABLE "public"."tenants" TO "anon";



GRANT SELECT("store_name") ON TABLE "public"."tenants" TO "anon";



GRANT SELECT("category") ON TABLE "public"."tenants" TO "anon";



GRANT SELECT("logo_url") ON TABLE "public"."tenants" TO "anon";



GRANT SELECT("gallery_images") ON TABLE "public"."tenants" TO "anon";



GRANT SELECT("description") ON TABLE "public"."tenants" TO "anon";



GRANT SELECT("weekday_hours") ON TABLE "public"."tenants" TO "anon";



GRANT SELECT("saturday_hours") ON TABLE "public"."tenants" TO "anon";



GRANT SELECT("sunday_hours") ON TABLE "public"."tenants" TO "anon";



GRANT SELECT("slug") ON TABLE "public"."tenants" TO "anon";



GRANT ALL ON TABLE "public"."tenants_public" TO "anon";
GRANT ALL ON TABLE "public"."tenants_public" TO "authenticated";
GRANT ALL ON TABLE "public"."tenants_public" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































