// lib/auth/auth.config.ts — Edge-safe Auth.js config
//
// This file must NOT import anything that pulls in Node-only modules (the
// Drizzle `db` client, bcryptjs, or the Credentials provider's authorize()).
// proxy.ts (Next.js middleware) runs on the Edge runtime and only needs to
// read/verify the session JWT — it never calls authorize() itself, so a
// second, minimal NextAuth() instance built from just this config is enough
// for the middleware session check. lib/auth/config.ts extends this with
// the actual Credentials provider for the full (Node runtime) instance used
// by the /api/auth route handlers and Server Components.
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  // Explicit, not just the AUTH_TRUST_HOST env var — this app is served from
  // two hostnames (marketing apex + nuomininkai. dashboard subdomain) behind
  // Caddy, and relying on env-var auto-detection alone left `request.url`
  // inside proxy.ts silently falling back to a single canonical origin
  // instead of the actual incoming Host header, breaking subdomain redirects.
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: {
    // JWT, not database sessions — no `sessions` adapter table, matches the
    // stateless cookie-based session Supabase Auth used.
    strategy: "jwt",
  },
  callbacks: {
    // Mirrors user.app_metadata.role from Supabase: role lives on the JWT
    // itself, embedded once at sign-in, so it never needs a DB round trip
    // to read back on every request.
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: "admin" | "seller" }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as "admin" | "seller";
        // `token.sub` is the user id NextAuth embeds by default (from the
        // `authorize()` return value's `id` field) — session.user.id isn't
        // populated automatically under the JWT strategy, so it must be set
        // explicitly here. Without this, every seller-facing query keyed on
        // the signed-in user's id silently receives `undefined`.
        session.user.id = token.sub as string;
      }
      return session;
    },
  },
  // Populated with the Credentials provider in lib/auth/config.ts. Kept
  // empty here so this file stays free of Node-only imports.
  providers: [],
} satisfies NextAuthConfig;
