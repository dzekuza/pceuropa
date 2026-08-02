// proxy.ts — Next.js 16 middleware (replaces middleware.ts)
// Session check, role-based redirect, gate cookie
//
// SECURITY NOTES:
// - `auth()` decrypts/verifies the session JWT via Edge-safe crypto (jose) —
//   no DB round trip, mirrors what supabase.auth.getUser() gave us for cheap
//   JWT validation, but note this does NOT hit the database to confirm the
//   user still exists/wasn't revoked (that's what the old getUser() call did
//   against Supabase's Auth server). See lib/auth/config.ts.
// - This is NOT the sole auth guard — every admin Server Component
//   independently re-validates the session (CVE-2025-29927: middleware can
//   be bypassed with the x-middleware-subrequest header).
import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { SITE_LOCK_COOKIE } from "@/lib/constants";
import { authConfig } from "@/lib/auth/auth.config";

// Separate, edge-safe NextAuth instance built from just the shared config —
// no Credentials provider, no Drizzle/bcrypt imports, so this is safe to run
// on the Edge runtime. The full instance (with the provider) lives in
// lib/auth/config.ts and is used by the /api/auth route handlers instead.
const { auth } = NextAuth(authConfig);

// Next.js 16 proxy.ts requires the exported function to be named "proxy" (not "middleware")
export const proxy = auth((request) => {
  const user = request.auth?.user

  const { pathname } = request.nextUrl
  const isDashboardRoute =
    pathname.startsWith('/admin') || pathname.startsWith('/seller')

  // Dashboard portal lives on the nuomininkai subdomain — login is not reachable
  // from the public marketing domain (pceuropa.lt), and the subdomain root sends
  // visitors straight to login. Skipped on localhost so both the marketing site
  // and the dashboard remain reachable during local development.
  const hostname = request.headers.get('host') || ''
  const isLocalDev = hostname.startsWith('localhost') || hostname.startsWith('127.0.0.1')
  const isTenantSubdomain = hostname.startsWith('nuomininkai.')

  // Behind Caddy, `request.url`/`request.nextUrl` can resolve to a single
  // canonical origin instead of the actual incoming Host header once the
  // NextAuth `auth()` wrapper has touched the request — reproduced when
  // serving two hostnames (marketing apex + nuomininkai. subdomain) from one
  // container. Build redirect targets from the verified Host header instead
  // of trusting request.url's origin.
  const protocol = request.headers.get('x-forwarded-proto') ?? 'https'
  const origin = isLocalDev ? request.nextUrl.origin : `${protocol}://${hostname}`

  if (!isLocalDev && !isTenantSubdomain && (pathname === '/login' || isDashboardRoute)) {
    return NextResponse.redirect(new URL('/', origin))
  }

  if (!isLocalDev && isTenantSubdomain && pathname === '/') {
    const role = user?.role
    const destination = user ? (role === 'admin' ? '/admin' : '/seller') : '/login'
    return NextResponse.redirect(new URL(destination, origin))
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
    const url = new URL('/under-construction', origin)
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  // Redirect unauthenticated users away from protected dashboard routes
  if (!user && isDashboardRoute) {
    return NextResponse.redirect(new URL('/login', origin))
  }

  // Redirect authenticated users away from login to their dashboard
  if (user && pathname === '/login') {
    const role = user.role
    const destination = role === 'admin' ? '/admin' : '/seller'
    return NextResponse.redirect(new URL(destination, origin))
  }

  // Role enforcement: sellers cannot access admin routes
  if (user && pathname.startsWith('/admin')) {
    const role = user.role
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/seller', origin))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
