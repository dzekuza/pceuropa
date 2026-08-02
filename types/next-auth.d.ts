// types/next-auth.d.ts — module augmentation so `session.user.role` and
// `token.role` type-check. Mirrors the shape of user.app_metadata.role from
// the old Supabase-based session.
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      role: "admin" | "seller";
    } & DefaultSession["user"];
  }

  interface User {
    role: "admin" | "seller";
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: "admin" | "seller";
  }
}
