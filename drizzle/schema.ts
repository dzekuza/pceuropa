// drizzle/schema.ts
//
// Drizzle ORM schema for the pceuropa self-hosted Postgres migration (Phase 3).
//
// Reconstructed by reading every migration file in supabase/migrations/ that
// touches each table, in chronological order. Column defaults, constraints,
// and indexes mirror the CURRENT LIVE state of the Supabase database as of
// migration 20260730130000_add_tenant_slug.sql (the last applied migration).
//
// NOTE ON auth.users: several tables have a FK to Supabase's auth.users
// (tenants.user_id, revenue_reports.user_id, moderan_sync_log.sent_by).
// There is NO public-schema users/profiles table anywhere in
// supabase/migrations/ — Supabase Auth manages auth.users in its own schema,
// entirely separate from anything ported here. Since this migration moves to
// Auth.js, Phase 4 will need to introduce a real `users` table (or decide
// these columns reference an external identity provider some other way).
// These three columns are modeled below as plain `uuid` columns with NO
// foreign key reference, since the referenced table (auth.users) does not
// exist in the target database. See drizzle/MIGRATION_NOTES.md.

import {
  pgTable,
  uuid,
  text,
  numeric,
  integer,
  timestamp,
  date,
  jsonb,
  boolean,
  uniqueIndex,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ─────────────────────────────────────────────
// TENANTS
// Source: 001_initial_schema.sql, 003_tenant_login_password.sql,
// 009_tenants_media_fields.sql, 20260730000001_add_tenant_working_hours.sql,
// 20260730120000_split_tenant_weekend_hours.sql (drops weekend_hours, adds
// saturday_hours/sunday_hours), 20260730130000_add_tenant_slug.sql.
// ─────────────────────────────────────────────
export const tenants = pgTable(
  "tenants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // FK to auth.users in Supabase; no local users table exists (see note above).
    userId: uuid("user_id"),
    storeName: text("store_name").notNull(),
    operator: text("operator"),
    companyCode: text("company_code"),
    category: text("category"),
    spaceM2: numeric("space_m2"),
    rentEur: numeric("rent_eur"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    loginPassword: text("login_password"),
    logoUrl: text("logo_url"),
    galleryImages: text("gallery_images").array().default(sql`'{}'::text[]`),
    description: text("description"),
    weekdayHours: text("weekday_hours").notNull().default("10:00–21:00"),
    saturdayHours: text("saturday_hours").notNull().default("10:00–20:00"),
    sundayHours: text("sunday_hours").notNull().default("10:00–20:00"),
    slug: text("slug").notNull(),
  },
  (table) => [
    uniqueIndex("tenants_slug_unique").on(table.slug),
    index("tenants_user_id_idx").on(table.userId),
    index("tenants_store_name_idx").on(table.storeName),
    index("tenants_created_at_idx").on(table.createdAt.desc()),
  ],
);

// ─────────────────────────────────────────────
// REVENUE REPORTS
// Source: 001_initial_schema.sql, 002_weekly_revenue.sql,
// 20260708000001_admin_perf_indexes.sql (revenue_reports_month_idx).
// ─────────────────────────────────────────────
export const revenueReports = pgTable(
  "revenue_reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // FK to auth.users in Supabase; no local users table exists (see note above).
    userId: uuid("user_id"),
    tenantId: uuid("tenant_id").references(() => tenants.id, {
      onDelete: "cascade",
    }),
    month: date("month").notNull(),
    amountEur: numeric("amount_eur").notNull(),
    txCount: integer("tx_count"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow(),
    // jsonb array of 5 objects: [{ tx_count: int, amount_eur: numeric }, ...]
    weeks: jsonb("weeks"),
    submittedBy: text("submitted_by"),
  },
  (table) => [
    uniqueIndex("revenue_reports_tenant_id_month_key").on(
      table.tenantId,
      table.month,
    ),
    index("revenue_reports_user_id_idx").on(table.userId),
    index("revenue_reports_month_idx").on(table.month),
  ],
);

// ─────────────────────────────────────────────
// FAQ ITEMS
// Source: 001_initial_schema.sql, 006_faq_attachments.sql.
// ─────────────────────────────────────────────
export const faqItems = pgTable(
  "faq_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    question: text("question").notNull(),
    answer: text("answer").notNull(),
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    attachments: text("attachments")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
  },
  (table) => [index("faq_items_sort_order_idx").on(table.sortOrder)],
);

// ─────────────────────────────────────────────
// PAGE SECTIONS
// Source: 011_page_sections.sql.
// ─────────────────────────────────────────────
export const pageSections = pgTable(
  "page_sections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    pageSlug: text("page_slug").notNull(),
    sectionKey: text("section_key").notNull(),
    contentKey: text("content_key").notNull(),
    value: text("value"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    uniqueIndex("page_sections_slug_section_content_key").on(
      table.pageSlug,
      table.sectionKey,
      table.contentKey,
    ),
    index("page_sections_slug_section_idx").on(
      table.pageSlug,
      table.sectionKey,
    ),
  ],
);

// ─────────────────────────────────────────────
// PUCK PAGES
// Source: 012_puck_pages.sql.
// ─────────────────────────────────────────────
export const puckPages = pgTable("puck_pages", {
  id: uuid("id").primaryKey().defaultRandom(),
  pageSlug: text("page_slug").notNull().unique(),
  data: jsonb("data")
    .notNull()
    .default(sql`'{"content":[],"root":{"props":{}},"zones":{}}'::jsonb`),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ─────────────────────────────────────────────
// ARTICLES
// Source: 20260630000001_create_articles_table.sql.
// ─────────────────────────────────────────────
export const articles = pgTable(
  "articles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    content: text("content").notNull().default(""),
    coverImage: text("cover_image"),
    category: text("category").notNull().default("Naujiena"),
    featured: boolean("featured").notNull().default(false),
    published: boolean("published").notNull().default(false),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    check(
      "articles_category_check",
      sql`${table.category} IN ('Naujiena', 'Akcija', 'Renginys')`,
    ),
  ],
);

// ─────────────────────────────────────────────
// MODERAN SYNC LOG
// Source: 20260703000001_moderan_sync_log.sql,
// 20260703180647_rls_perf_and_security_fixes.sql (sent_by index).
// ─────────────────────────────────────────────
export const moderanSyncLog = pgTable(
  "moderan_sync_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    month: date("month").notNull().unique(),
    sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
    // FK to auth.users in Supabase; no local users table exists (see note above).
    sentBy: uuid("sent_by"),
    results: jsonb("results").notNull(),
  },
  (table) => [index("moderan_sync_log_sent_by_idx").on(table.sentBy)],
);

// ─────────────────────────────────────────────
// PROMOS
// Source: 20260706000002_create_promos_table.sql,
// 20260708000004_add_content_to_promos.sql.
// ─────────────────────────────────────────────
export const promos = pgTable(
  "promos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    image: text("image"),
    startsAt: date("starts_at").notNull(),
    endsAt: date("ends_at").notNull(),
    category: text("category").notNull().default("stores"),
    published: boolean("published").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    content: text("content").notNull().default(""),
  },
  (table) => [
    check(
      "promos_category_check",
      sql`${table.category} IN ('stores', 'services', 'food')`,
    ),
  ],
);

// ─────────────────────────────────────────────
// USERS — Phase 4 (Auth.js migration) addition.
//
// Replaces Supabase's auth.users, which Auth.js has no equivalent for.
// During data migration each row is re-inserted with the SAME uuid it had
// in Supabase's auth.users, so tenants.user_id / revenue_reports.user_id /
// moderan_sync_log.sent_by keep resolving to the same identity unchanged.
//
// Scope note: per the Phase 4 task, this is an ADDITIVE table only — the 8
// existing table defs above are untouched. FK constraints from
// tenants.user_id / revenue_reports.user_id / moderan_sync_log.sent_by to
// this table are NOT added here even though the migration decision doc
// mentions adding them once a target table exists; wiring those FKs touches
// the existing table defs and is left for a follow-up phase.
//
// No password hashes exist in the Supabase export (~/backups/pceuropa/
// pre-migration-2026-08-02/auth-users.json) — passwordHash is nullable so
// migrated rows can land with NULL and go through a forced password-reset
// flow post-migration; new users created after cutover always get a hash.
// ─────────────────────────────────────────────
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    role: text("role").notNull(),
    passwordHash: text("password_hash"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    uniqueIndex("users_email_unique").on(table.email),
    check("users_role_check", sql`${table.role} IN ('admin', 'seller')`),
  ],
);

// ─────────────────────────────────────────────
// LOGIN ATTEMPTS — Phase 4 addition, backs the Postgres sliding-window rate
// limiter in lib/auth/rate-limit.ts. One row per attempt; old rows are
// pruned by the rate limiter itself rather than a cron job, since volume at
// this scale (dozens of sellers) never justifies a scheduled job.
// ─────────────────────────────────────────────
export const loginAttempts = pgTable(
  "login_attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    identifier: text("identifier").notNull(),
    attemptedAt: timestamp("attempted_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("login_attempts_identifier_attempted_at_idx").on(
      table.identifier,
      table.attemptedAt,
    ),
  ],
);
