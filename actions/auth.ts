'use server'
// actions/auth.ts — Server Actions for authentication
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export async function logout() {
  const supabase = await createClient()
  const cookieStore = await cookies()

  // Clear impersonation cookie if it exists
  cookieStore.delete('impersonating')

  await supabase.auth.signOut()
  redirect('/login')
}
