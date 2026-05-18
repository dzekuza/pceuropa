// lib/auth/get-role.ts — role helper for Server Components and Server Actions
// Uses getUser() (NOT getSession()) for JWT validation with Supabase Auth server
import { createClient } from '@/lib/supabase/server'

export async function getRole(): Promise<'admin' | 'seller' | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  return (user.app_metadata?.role as 'admin' | 'seller') ?? null
}
