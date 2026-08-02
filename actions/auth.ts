'use server'
// actions/auth.ts — Server Actions for authentication
import { cookies } from 'next/headers'
import { signOut } from '@/lib/auth/config'

export async function logout() {
  const cookieStore = await cookies()

  // Clear impersonation cookie if it exists
  cookieStore.delete('impersonating')

  await signOut({ redirectTo: '/login' })
}
