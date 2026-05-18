// proxy.ts — Next.js 16 middleware (replaces middleware.ts)
// JWT validation, role-based redirect, session refresh
//
// SECURITY NOTES:
// - Uses getUser() (NOT getSession()) — validates JWT with Supabase Auth server
// - Returns supabaseResponse (NOT NextResponse.next()) — so refreshed cookies propagate
// - This is NOT the sole auth guard — every admin Server Component independently calls getUser()
//   (CVE-2025-29927: middleware can be bypassed with x-middleware-subrequest header)
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Next.js 16 proxy.ts requires the exported function to be named "proxy" (not "middleware")
export async function proxy(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request })

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

  const { pathname } = request.nextUrl
  const isDashboardRoute =
    pathname.startsWith('/admin') || pathname.startsWith('/seller')

  // Redirect unauthenticated users away from protected dashboard routes
  if (!user && isDashboardRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect authenticated users away from login/landing to their dashboard
  if (user && (pathname === '/login' || pathname === '/')) {
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
