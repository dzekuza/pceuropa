// lib/auth/admin-users.ts — replaces lib/supabase/admin.ts's auth.admin.*
// helpers with Drizzle equivalents against the new `users` table.
//
// SERVER ONLY — never import in Client Components. This is privileged code
// (equivalent to what the Supabase service-role key granted): it reads and
// writes the users table directly, bypassing whatever RLS-equivalent checks
// (current_setting('app.user_role', true)) apply to ordinary request-scoped
// queries. Call it only from trusted server contexts (route handlers /
// Server Components that have already verified the caller is an admin).
//
// Call-site porting is Phase 5's job (mechanical swap of the 4 auth.admin.*
// call sites found in app/api/admin/impersonate/route.ts and
// app/(dashboard)/admin/tenants/[id]/page.tsx) — this file only provides the
// equivalent helpers so that swap has something to call.
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";

const BCRYPT_ROUNDS = 10;

// Replaces adminClient.auth.admin.createUser({ email, password: crypto.randomUUID(), ... }).
// Original call site provisions a tenant's first-ever login with a random,
// never-communicated password, because sellers only ever reach their account
// via admin-initiated impersonation, never a direct password login. Same
// shape here: a random password is generated and hashed, never returned.
export async function createUser(params: {
  email: string;
  role: "admin" | "seller";
}): Promise<{ id: string; email: string }> {
  const randomPassword = randomUUID();
  const passwordHash = await bcrypt.hash(randomPassword, BCRYPT_ROUNDS);

  const [row] = await db
    .insert(users)
    .values({ email: params.email, role: params.role, passwordHash })
    .returning({ id: users.id, email: users.email });

  return row;
}

// Replaces adminClient.auth.admin.getUserById(id).
export async function getUserById(
  id: string,
): Promise<{ id: string; email: string; role: "admin" | "seller" } | null> {
  const [row] = await db
    .select({ id: users.id, email: users.email, role: users.role })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return row ? { ...row, role: row.role as "admin" | "seller" } : null;
}
