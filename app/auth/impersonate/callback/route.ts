// app/auth/impersonate/callback/route.ts — Callback for admin impersonation flow
// After the magic link is clicked, Supabase redirects here with a ?code=
// We exchange the code for a session and land on the seller dashboard.
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
        // Exchange the one-time code for a real session (signs in as the tenant)
        await supabase.auth.exchangeCodeForSession(code)
    }

    // Redirect to the seller dashboard — the session is now the tenant's
    return NextResponse.redirect(new URL('/seller/revenue', request.url))
}
