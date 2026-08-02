// lib/auth/config.ts — Full Auth.js config (Node runtime)
//
// Extends the edge-safe authConfig with the Credentials provider. This file
// is imported by the /api/auth route handlers and by Server Components —
// never by proxy.ts (middleware), since it pulls in the Drizzle `db` client
// (node-postgres) and bcryptjs, neither of which run on the Edge runtime.
//
// Password hashing: bcryptjs, not native bcrypt or argon2. It's a pure-JS
// implementation with no native bindings to compile, so it works identically
// across every deploy target (Vercel, Fly.io, local) without a build step
// that can silently break on a platform with a different libc/arch. At this
// user count (dozens of sellers, not a high-throughput API) the extra CPU
// cost over a native binding is irrelevant.
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { authConfig } from "@/lib/auth/auth.config";
import { checkRateLimit, recordLoginAttempt } from "@/lib/auth/rate-limit";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        const allowed = await checkRateLimit(email);
        if (!allowed) return null;

        await recordLoginAttempt(email);

        const [row] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (!row?.passwordHash) return null;

        const valid = await bcrypt.compare(password, row.passwordHash);
        if (!valid) return null;

        return {
          id: row.id,
          email: row.email,
          role: row.role as "admin" | "seller",
        };
      },
    }),
  ],
});
