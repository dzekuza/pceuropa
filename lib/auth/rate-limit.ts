// lib/auth/rate-limit.ts — Postgres-backed sliding-window rate limit for
// the credentials login route. No Redis: at this scale (dozens of sellers)
// a single indexed table query per attempt is cheap enough, and it avoids
// adding another piece of infrastructure to operate post-migration.
import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { loginAttempts } from "@/drizzle/schema";

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS_PER_WINDOW = 10;

// Identifier is the submitted email, lowercased — same key an attacker would
// have to guess correctly to even reach the password check, so this doesn't
// leak whether an account exists.
function normalizeIdentifier(identifier: string): string {
  return identifier.trim().toLowerCase();
}

export async function checkRateLimit(identifier: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - WINDOW_MS);
  const normalized = normalizeIdentifier(identifier);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(loginAttempts)
    .where(
      and(
        eq(loginAttempts.identifier, normalized),
        gte(loginAttempts.attemptedAt, windowStart),
      ),
    );

  return count < MAX_ATTEMPTS_PER_WINDOW;
}

export async function recordLoginAttempt(identifier: string): Promise<void> {
  const normalized = normalizeIdentifier(identifier);

  await db.insert(loginAttempts).values({ identifier: normalized });

  // Opportunistic prune of rows outside any window we'd ever check, so the
  // table doesn't grow unbounded without needing a scheduled job.
  const pruneBefore = new Date(Date.now() - WINDOW_MS);
  await db
    .delete(loginAttempts)
    .where(sql`${loginAttempts.attemptedAt} < ${pruneBefore}`);
}
