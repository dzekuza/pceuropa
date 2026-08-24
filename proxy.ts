// proxy.ts — Next.js 16 middleware (replaces middleware.ts)
// JWT validation, role-based redirect, session refresh
//
// SECURITY NOTES:
// - Uses getUser() (NOT getSession()) — validates JWT with Supabase Auth server
// - Returns supabaseResponse (NOT NextResponse.next()) — so refreshed cookies propagate
// - This is NOT the sole auth guard — every admin Server Component independently calls getUser()
//   (CVE-2025-29927: middleware can be bypassed with x-middleware-subrequest header)
import { createServerClient } from '@supabase/ssr'
import createIntlMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { SITE_LOCK_COOKIE } from '@/lib/constants'
import { routing } from '@/i18n/routing'

// Locale routing (LT unprefixed at "/", EN prefixed at "/en/...") only ever
// applies to the marketing tree — dashboard/login/api routes are never
// locale-prefixed, so they're excluded here and handled by the auth/gate
// logic below exactly as before.
const intlMiddleware = createIntlMiddleware(routing)

// Next.js 16 proxy.ts requires the exported function to be named "proxy" (not "middleware")
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isDashboardRoute =
    pathname.startsWith('/admin') || pathname.startsWith('/seller')
  const isLocaleExempt =
    isDashboardRoute ||
    pathname.startsWith('/api/') ||
    pathname === '/login' ||
    pathname.startsWith('/auth/')

  // Let next-intl resolve the locale for marketing-tree requests. For the
  // default locale (lt) this is an internal rewrite ("/" -> "/lt") that the
  // App Router's [locale] segment needs to match a page — it must be used as
  // the base response so the rewrite header survives, not discarded. A 3xx
  // here means an actual redirect (malformed/unknown locale segment) and
  // short-circuits immediately. Gate/login/api paths below are never
  // locale-prefixed, so their raw-pathname comparisons stay correct either way.
  let supabaseResponse = NextResponse.next({ request })
  if (!isLocaleExempt) {
    const intlResponse = intlMiddleware(request)
    if (intlResponse.status >= 300 && intlResponse.status < 400) {
      return intlResponse
    }
    supabaseResponse = intlResponse
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // MUST use getUser() — validates JWT with Supabase server. Never use getSession().
  // This call also refreshes expired tokens and sets updated cookies on supabaseResponse.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Dashboard portal lives on the nuomininkai subdomain — login is not reachable
  // from the public marketing domain (pceuropa.lt), and the subdomain root sends
  // visitors straight to login. Skipped on localhost so both the marketing site
  // and the dashboard remain reachable during local development.
  const hostname = request.headers.get('host') || ''
  const isLocalDev = hostname.startsWith('localhost') || hostname.startsWith('127.0.0.1')
  const isTenantSubdomain = hostname.startsWith('nuomininkai.')

  if (!isLocalDev && !isTenantSubdomain && (pathname === '/login' || isDashboardRoute)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (!isLocalDev && isTenantSubdomain && pathname === '/') {
    const role = user?.app_metadata?.role
    const destination = user ? (role === 'admin' ? '/admin' : '/seller') : '/login'
    return NextResponse.redirect(new URL(destination, request.url))
  }

  // Public marketing pages are gated behind an under-construction screen until
  // unlocked with the maintenance password. Dashboard/login/API routes and the
  // gate page itself are exempt so the unlock flow and admin access still work.
  const isGateExempt =
    isTenantSubdomain ||
    isDashboardRoute ||
    pathname === '/login' ||
    pathname === '/under-construction' ||
    pathname.startsWith('/api/')

  if (!isGateExempt && request.cookies.get(SITE_LOCK_COOKIE)?.value !== '1') {
    // Admins can turn the gate off from /admin/settings without a redeploy — the flag
    // lives in site_settings (publicly readable via RLS) and defaults to enabled on error.
    const { data: settings } = await supabase
      .from('site_settings')
      .select('coming_soon_enabled')
      .eq('id', true)
      .maybeSingle()

    if (settings?.coming_soon_enabled ?? true) {
      const url = new URL('/under-construction', request.url)
      url.searchParams.set('from', pathname)
      return NextResponse.redirect(url)
    }
  }

  // Redirect unauthenticated users away from protected dashboard routes
  if (!user && isDashboardRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect authenticated users away from login to their dashboard
  if (user && pathname === '/login') {
    const role = user.app_metadata?.role
    const destination = role === 'admin' ? '/admin' : '/seller'
    return NextResponse.redirect(new URL(destination, request.url))
  }

  // Role enforcement: sellers cannot access admin routes
  if (user && pathname.startsWith('/admin')) {
    const role = user.app_metadata?.role
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/seller', request.url))
    }
  }

  // CRITICAL: Return supabaseResponse — NOT NextResponse.next() —
  // so refreshed session cookies are forwarded to the browser.
  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
