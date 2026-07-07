// lib/supabase/server.ts — for Server Components, Server Actions, Route Handlers
// Do NOT use this in Client Components (use lib/supabase/client.ts instead)
import { cache } from 'react'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

// cache() deduplicates createClient() within a single render tree, so layout
// and page share one Supabase client instance and auth.getUser() is only called once.
export const createClient = cache(async function createClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
})
