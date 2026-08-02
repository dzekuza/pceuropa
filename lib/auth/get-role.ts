// lib/auth/get-role.ts — role helper for Server Components and Server Actions
//
// Same call signature as the Supabase-era version so Phase 5 can mechanically
// swap call sites: `const role = await getRole()`. `auth()` re-verifies the
// session JWT fresh on every call (Auth.js does not cache across calls the
// way the old cache()-wrapped Supabase client did) — every admin Server
// Component that calls this still gets an independent, non-middleware-trusted
// check (CVE-2025-29927 defense-in-depth is preserved).
import { auth } from '@/lib/auth/config'

export async function getRole(): Promise<'admin' | 'seller' | null> {
  const session = await auth()
  return session?.user?.role ?? null
}
