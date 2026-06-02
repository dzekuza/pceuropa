// app/auth/callback/route.ts — Auth callback for PKCE session exchange
// Supabase auth redirects here after OAuth or magic link to exchange code for session.
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
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
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Validate `next` is a relative path — prevent open redirect via external URLs
  const raw = requestUrl.searchParams.get('next') ?? '/admin'
  const next = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/admin'
  return NextResponse.redirect(new URL(next, request.url))
}
