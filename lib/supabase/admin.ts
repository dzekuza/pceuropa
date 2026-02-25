// lib/supabase/admin.ts — Service role admin client for auth.admin.* operations
// SERVER ONLY — never import in Client Components
// Uses service role key (no NEXT_PUBLIC_ prefix) — never exposed to browser
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  )
}
