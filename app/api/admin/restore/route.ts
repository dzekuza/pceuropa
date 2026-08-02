// app/api/admin/restore/route.ts — Restore admin session after impersonation
//
// Counterpart to app/api/admin/impersonate/route.ts's session mint: the JWT
// strategy is stateless, so "restoring" the admin session just means putting
// the backed-up session cookie back rather than refreshing a Supabase token.
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { decode } from 'next-auth/jwt'
import { isSameSiteNavigation } from '@/lib/auth/same-site-navigation'

// Duplicated from app/api/admin/impersonate/route.ts — see the note there on
// why this isn't lifted into lib/auth/ (out of scope for this pass).
const USE_SECURE_COOKIES = process.env.NODE_ENV === 'production'
const SESSION_COOKIE_NAME = USE_SECURE_COOKIES
  ? '__Secure-authjs.session-token'
  : 'authjs.session-token'

export async function GET(request: NextRequest) {
    if (!isSameSiteNavigation(request)) {
        return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
    }

    const cookieStore = await cookies()
    const adminSessionCookie = cookieStore.get('admin_session_backup')?.value

    cookieStore.delete('impersonating')
    cookieStore.delete('admin_session_backup')

    if (!adminSessionCookie) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    const secret = process.env.AUTH_SECRET
    if (!secret) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Verify the backed-up cookie is still a valid, unexpired admin session
    // before restoring it — never trust it blindly.
    const token = await decode({ token: adminSessionCookie, secret, salt: SESSION_COOKIE_NAME }).catch(() => null)

    if (!token || token.role !== 'admin') {
        cookieStore.delete(SESSION_COOKIE_NAME)
        return NextResponse.redirect(new URL('/login', request.url))
    }

    cookieStore.set(SESSION_COOKIE_NAME, adminSessionCookie, {
        httpOnly: true,
        secure: USE_SECURE_COOKIES,
        sameSite: 'lax',
        path: '/',
    })

    return NextResponse.redirect(new URL('/admin', request.url))
}
