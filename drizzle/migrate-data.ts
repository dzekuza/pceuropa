// drizzle/migrate-data.ts — one-time data migration from the Phase 0 Supabase
// backup into the self-hosted Postgres schema (Phase 5, Task 2).
//
// This script was supposed to ship in Phase 3 alongside drizzle/schema.ts,
// but never got written — this fills that gap. It has NOT been run against
// any database by the agent that wrote it; it is written-only, for whoever
// runs the actual cutover to execute deliberately.
//
// ─────────────────────────────────────────────────────────────────────────
// HOW TO RUN
//
//   DATABASE_URL=<your connection string> pnpm tsx drizzle/migrate-data.ts
//
// DATABASE_URL is read from process.env only — nothing is hardcoded here.
// Run this against an EMPTY target database (schema already applied via
// drizzle/schema.ts + drizzle/rls-policies.sql + drizzle/rpc-functions.sql,
// zero rows in every table) — this script does not delete or truncate
// anything first, and will fail loudly on primary-key/unique-constraint
// conflicts if run twice or against a non-empty database.
//
// ─────────────────────────────────────────────────────────────────────────
// SOURCE DATA
//
// Reads from ~/backups/pceuropa/pre-migration-2026-08-02/ (verified against
// that backup's MANIFEST.md and, independently, by directly counting each
// data/*.json array's length — both agree):
//
//   data/tenants.json            — 50 rows
//   data/revenue_reports.json    — 209 rows
//   data/faq_items.json          — 5 rows
//   data/page_sections.json      — 0 rows
//   data/puck_pages.json         — 6 rows
//   data/articles.json           — 1 row
//   data/moderan_sync_log.json   — 1 row
//   data/promos.json             — 11 rows
//   auth-users.json              — 51 users (id, email, role, created_at —
//                                  NO password hash; Supabase's Management
//                                  API / MCP execute_sql does not expose
//                                  auth.users.encrypted_password)
//
// Every JSON file above is the verbatim `select jsonb_agg(t) from <table> t`
// export — field names already match drizzle/schema.ts's DB column names
// 1:1 (verified by inspecting one row from each file), so each insert below
// maps JSON keys straight onto schema columns with no renaming beyond
// snake_case → camelCase.
//
// ─────────────────────────────────────────────────────────────────────────
// users TABLE SHAPE (drizzle/schema.ts, Phase 4 addition) — read directly
// off schema.ts rather than assumed:
//
//   id: uuid primary key (defaultRandom, but we override with the exported
//       Supabase auth.users uuid so tenants.user_id / revenue_reports.user_id
//       / moderan_sync_log.sent_by keep resolving correctly)
//   email: text not null, unique
//   role: text not null, check in ('admin', 'seller')
//   passwordHash: text, NULLABLE — no must_reset_password / must_change_password
//       boolean column exists on this table. The task brief asked for a
//       "must_reset_password flag if the users table has one" — it does NOT
//       have one (confirmed by reading schema.ts's users table definition,
//       not guessed), so this script does NOT set one. It leaves
//       passwordHash NULL for every migrated user, which is the schema's own
//       documented mechanism for "this user must go through a forced
//       password-reset flow post-migration" (see schema.ts's comment above
//       the users table). Whoever builds the login/reset flow should treat
//       passwordHash === null as "reset required" — that's a lib/auth/**
//       concern, out of scope here.
//   createdAt: timestamp, defaultNow() — overridden with the original
//       auth.users created_at so signup dates aren't lost.
//
// ─────────────────────────────────────────────────────────────────────────
// RECONCILIATION
//
// After each table insert, this script re-counts rows in the target DB and
// compares against the source JSON array's length, logging PASS/FAIL per
// table. A single FAIL does not stop the remaining tables from running (so
// one bad table doesn't hide reconciliation results for the others) but does
// make the script exit with a non-zero code at the end.
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { sql } from "drizzle-orm";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

const BACKUP_ROOT = join(
  homedir(),
  "backups/pceuropa/pre-migration-2026-08-02",
);

async function readJson<T>(relativePath: string): Promise<T> {
  const raw = await readFile(join(BACKUP_ROOT, relativePath), "utf-8");
  return JSON.parse(raw) as T;
}

async function countRows(
  db: ReturnType<typeof drizzle>,
  table: string,
): Promise<number> {
  const result = await db.execute<{ count: string }>(
    sql.raw(`select count(*)::text as count from "${table}"`),
  );
  return Number(result.rows[0]?.count ?? 0);
}

function logReconciliation(
  label: string,
  sourceCount: number,
  targetCount: number,
): boolean {
  const pass = sourceCount === targetCount;
  console.log(
    `[${pass ? "PASS" : "FAIL"}] ${label}: source=${sourceCount} target=${targetCount}`,
  );
  return pass;
}

// ─────────────────────────────────────────────────────────────────────────
// Source row shapes — verbatim `jsonb_agg` exports, one row inspected per
// file to confirm field names before writing the mapping below.

interface SourceAuthUser {
  id: string;
  role: "admin" | "seller";
  email: string;
  created_at: string;
}

interface SourceTenant {
  id: string;
  slug: string;
  user_id: string | null;
  category: string | null;
  logo_url: string | null;
  operator: string | null;
  rent_eur: number | null;
  space_m2: number | null;
  created_at: string | null;
  store_name: string;
  description: string | null;
  company_code: string | null;
  sunday_hours: string | null;
  weekday_hours: string | null;
  gallery_images: string[] | null;
  login_password: string | null;
  saturday_hours: string | null;
}

interface SourceRevenueReport {
  id: string;
  month: string;
  weeks: unknown;
  user_id: string | null;
  tx_count: number | null;
  tenant_id: string | null;
  amount_eur: number;
  submitted_at: string | null;
  submitted_by: string | null;
}

interface SourceFaqItem {
  id: string;
  answer: string;
  question: string;
  created_at: string | null;
  sort_order: number | null;
  attachments: string[];
}

interface SourcePageSection {
  id: string;
  page_slug: string;
  section_key: string;
  content_key: string;
  value: string | null;
  updated_at: string | null;
}

interface SourcePuckPage {
  id: string;
  data: unknown;
  page_slug: string;
  updated_at: string | null;
}

interface SourceArticle {
  id: string;
  slug: string;
  title: string;
  content: string;
  category: string;
  featured: boolean;
  published: boolean;
  created_at: string | null;
  updated_at: string | null;
  cover_image: string | null;
  published_at: string | null;
}

interface SourceModeranSyncLog {
  id: string;
  month: string;
  results: unknown;
  sent_at: string;
  sent_by: string | null;
}

interface SourcePromo {
  id: string;
  slug: string;
  image: string | null;
  title: string;
  content: string;
  ends_at: string;
  category: string;
  published: boolean;
  starts_at: string;
  created_at: string | null;
  updated_at: string | null;
}

function toDate(value: string | null | undefined): Date | undefined {
  return value ? new Date(value) : undefined;
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool = new Pool({ connectionString });
  const db = drizzle(pool, { schema });

  const results: boolean[] = [];

  try {
    // ── users (from auth-users.json — separate top-level export, not data/) ──
    const authUsers = await readJson<SourceAuthUser[]>("auth-users.json");
    console.log(`Read ${authUsers.length} rows from auth-users.json`);
    if (authUsers.length) {
      await db.insert(schema.users).values(
        authUsers.map((u) => ({
          id: u.id,
          email: u.email,
          role: u.role,
          passwordHash: null, // no hash exported; forces password-reset flow
          createdAt: toDate(u.created_at),
        })),
      );
    }
    results.push(
      logReconciliation(
        "users",
        authUsers.length,
        await countRows(db, "users"),
      ),
    );

    // ── tenants ──
    const tenantsData = await readJson<SourceTenant[]>("data/tenants.json");
    console.log(`Read ${tenantsData.length} rows from data/tenants.json`);
    if (tenantsData.length) {
      await db.insert(schema.tenants).values(
        tenantsData.map((t) => ({
          id: t.id,
          userId: t.user_id,
          storeName: t.store_name,
          operator: t.operator,
          companyCode: t.company_code,
          category: t.category,
          spaceM2: t.space_m2 != null ? String(t.space_m2) : null,
          rentEur: t.rent_eur != null ? String(t.rent_eur) : null,
          createdAt: toDate(t.created_at),
          loginPassword: t.login_password,
          logoUrl: t.logo_url,
          galleryImages: t.gallery_images ?? [],
          description: t.description,
          weekdayHours: t.weekday_hours ?? undefined,
          saturdayHours: t.saturday_hours ?? undefined,
          sundayHours: t.sunday_hours ?? undefined,
          slug: t.slug,
        })),
      );
    }
    results.push(
      logReconciliation(
        "tenants",
        tenantsData.length,
        await countRows(db, "tenants"),
      ),
    );

    // ── revenue_reports (FK to tenants — must run after tenants) ──
    const revenueData = await readJson<SourceRevenueReport[]>(
      "data/revenue_reports.json",
    );
    console.log(
      `Read ${revenueData.length} rows from data/revenue_reports.json`,
    );
    if (revenueData.length) {
      await db.insert(schema.revenueReports).values(
        revenueData.map((r) => ({
          id: r.id,
          userId: r.user_id,
          tenantId: r.tenant_id,
          month: r.month,
          amountEur: String(r.amount_eur),
          txCount: r.tx_count,
          submittedAt: toDate(r.submitted_at),
          weeks: r.weeks,
          submittedBy: r.submitted_by,
        })),
      );
    }
    results.push(
      logReconciliation(
        "revenue_reports",
        revenueData.length,
        await countRows(db, "revenue_reports"),
      ),
    );

    // ── faq_items ──
    const faqData = await readJson<SourceFaqItem[]>("data/faq_items.json");
    console.log(`Read ${faqData.length} rows from data/faq_items.json`);
    if (faqData.length) {
      await db.insert(schema.faqItems).values(
        faqData.map((f) => ({
          id: f.id,
          question: f.question,
          answer: f.answer,
          sortOrder: f.sort_order,
          createdAt: toDate(f.created_at),
          attachments: f.attachments ?? [],
        })),
      );
    }
    results.push(
      logReconciliation(
        "faq_items",
        faqData.length,
        await countRows(db, "faq_items"),
      ),
    );

    // ── page_sections (0 rows in the backup — insert is a no-op, still
    // reconciled explicitly so a future non-empty export doesn't silently
    // skip verification) ──
    const pageSectionsData = await readJson<SourcePageSection[]>(
      "data/page_sections.json",
    );
    console.log(
      `Read ${pageSectionsData.length} rows from data/page_sections.json`,
    );
    if (pageSectionsData.length) {
      await db.insert(schema.pageSections).values(
        pageSectionsData.map((p) => ({
          id: p.id,
          pageSlug: p.page_slug,
          sectionKey: p.section_key,
          contentKey: p.content_key,
          value: p.value,
          updatedAt: toDate(p.updated_at),
        })),
      );
    }
    results.push(
      logReconciliation(
        "page_sections",
        pageSectionsData.length,
        await countRows(db, "page_sections"),
      ),
    );

    // ── puck_pages ──
    const puckPagesData = await readJson<SourcePuckPage[]>(
      "data/puck_pages.json",
    );
    console.log(`Read ${puckPagesData.length} rows from data/puck_pages.json`);
    if (puckPagesData.length) {
      await db.insert(schema.puckPages).values(
        puckPagesData.map((p) => ({
          id: p.id,
          pageSlug: p.page_slug,
          data: p.data as object,
          updatedAt: toDate(p.updated_at),
        })),
      );
    }
    results.push(
      logReconciliation(
        "puck_pages",
        puckPagesData.length,
        await countRows(db, "puck_pages"),
      ),
    );

    // ── articles ──
    const articlesData = await readJson<SourceArticle[]>(
      "data/articles.json",
    );
    console.log(`Read ${articlesData.length} rows from data/articles.json`);
    if (articlesData.length) {
      await db.insert(schema.articles).values(
        articlesData.map((a) => ({
          id: a.id,
          title: a.title,
          slug: a.slug,
          content: a.content,
          coverImage: a.cover_image,
          category: a.category,
          featured: a.featured,
          published: a.published,
          publishedAt: toDate(a.published_at) ?? null,
          createdAt: toDate(a.created_at),
          updatedAt: toDate(a.updated_at),
        })),
      );
    }
    results.push(
      logReconciliation(
        "articles",
        articlesData.length,
        await countRows(db, "articles"),
      ),
    );

    // ── moderan_sync_log (FK sent_by -> users, runs after users) ──
    const moderanData = await readJson<SourceModeranSyncLog[]>(
      "data/moderan_sync_log.json",
    );
    console.log(
      `Read ${moderanData.length} rows from data/moderan_sync_log.json`,
    );
    if (moderanData.length) {
      await db.insert(schema.moderanSyncLog).values(
        moderanData.map((m) => ({
          id: m.id,
          month: m.month,
          sentAt: toDate(m.sent_at),
          sentBy: m.sent_by,
          results: m.results,
        })),
      );
    }
    results.push(
      logReconciliation(
        "moderan_sync_log",
        moderanData.length,
        await countRows(db, "moderan_sync_log"),
      ),
    );

    // ── promos ──
    const promosData = await readJson<SourcePromo[]>("data/promos.json");
    console.log(`Read ${promosData.length} rows from data/promos.json`);
    if (promosData.length) {
      await db.insert(schema.promos).values(
        promosData.map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          image: p.image,
          startsAt: p.starts_at,
          endsAt: p.ends_at,
          category: p.category,
          published: p.published,
          createdAt: toDate(p.created_at),
          updatedAt: toDate(p.updated_at),
          content: p.content ?? "",
        })),
      );
    }
    results.push(
      logReconciliation(
        "promos",
        promosData.length,
        await countRows(db, "promos"),
      ),
    );
  } finally {
    await pool.end();
  }

  const allPassed = results.every(Boolean);
  console.log(
    allPassed
      ? "\nAll tables reconciled successfully."
      : "\nOne or more tables FAILED reconciliation — see log above.",
  );
  process.exitCode = allPassed ? 0 : 1;
}

main().catch((err) => {
  console.error("[migrate-data] fatal error:", err);
  process.exitCode = 1;
});
