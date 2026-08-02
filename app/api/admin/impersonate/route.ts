// app/api/admin/impersonate/route.ts — Admin portal: sign-in as a tenant
//
// Supabase's magic-link + verifyOtp session-swap has no Auth.js equivalent.
// lib/auth/admin-users.ts was written expecting this route to round-trip a
// generateImpersonationToken()/verifyImpersonationToken() pair through a
// second "verify" request; instead this mints the Auth.js session JWT
// directly in this single response (see the note below encode() call for
// why). This is new session-issuing infrastructure, not a mechanical query
// swap — flagged in the Phase 5 report for extra review.
export const dynamic = 'force-dynamic'

import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { eq } from 'drizzle-orm'
import { encode } from 'next-auth/jwt'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { tenants } from '@/drizzle/schema'
import { createUser, getUserById } from '@/lib/auth/admin-users'
import { isSameSiteNavigation } from '@/lib/auth/same-site-navigation'

// Mirrors @auth/core's defaultCookies() naming (cookie name doubles as the
// JWT encode/decode "salt") — duplicated here rather than added to lib/auth/
// since this pass is scoped to app/(dashboard)/** and app/api/** only.
const USE_SECURE_COOKIES = process.env.NODE_ENV === 'production'
const SESSION_COOKIE_NAME = USE_SECURE_COOKIES
  ? '__Secure-authjs.session-token'
  : 'authjs.session-token'

// Derive a stable seller username from the store name.
// e.g. "Archie's burger" → "archiesburger", "ALI ŠOKOLADINĖ" → "alisokoline"
function toSellerSlug(storeName: string): string {
  return storeName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .replace(/[^a-z0-9]/g, '')       // keep only alphanumeric
}

export async function GET(request: NextRequest) {
  // This route signs the caller into a different account and is reached via
  // full-page navigation rather than fetch, so it can't carry a body-based
  // CSRF token — reject cross-site navigations instead (CSRF via a lured click).
  if (!isSameSiteNavigation(request)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
  }

  const cookieStore = await cookies()

  // Verify caller is an admin
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const tenantId = request.nextUrl.searchParams.get('tenantId')
  if (!tenantId) {
    return NextResponse.json({ error: 'Missing tenantId' }, { status: 400 })
  }

  // Look up the tenant
  const [tenant] = await db
    .select({ userId: tenants.userId, storeName: tenants.storeName })
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1)

  if (!tenant) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
  }

  let tenantUserId = tenant.userId

  // Provision a user on first access if none exists yet
  if (!tenantUserId) {
    const slug = toSellerSlug(tenant.storeName)
    const email = `${slug}@pceuropa.lt`

    const created = await createUser({ email, role: 'seller' })
    tenantUserId = created.id

    // Link the new user back to the tenant row
    await db.update(tenants).set({ userId: tenantUserId }).where(eq(tenants.id, tenantId))
  }

  // Get the tenant user's email for the impersonation session
  const tenantUser = await getUserById(tenantUserId)

  if (!tenantUser) {
    return NextResponse.json({ error: 'Tenant user not found' }, { status: 404 })
  }

  // Back up the admin's own session cookie so admin/restore/route.ts can put
  // it back verbatim — the JWT strategy is stateless, so there's no server-side
  // refresh token to stash the way the Supabase flow did.
  const adminSessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (adminSessionCookie) {
    cookieStore.set('admin_session_backup', adminSessionCookie, {
      httpOnly: true,
      secure: USE_SECURE_COOKIES,
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
      path: '/',
    })
  }

  // Mint a normal Auth.js session JWT for the tenant user directly (rather than
  // round-tripping generateImpersonationToken/verifyImpersonationToken through a
  // second request) — this stays a single server response and never exposes a
  // bearer token in a URL. See lib/auth/admin-users.ts for the token helpers if
  // a redirect-based handoff is needed later.
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'AUTH_SECRET is not set' }, { status: 500 })
  }
  const impersonationSessionToken = await encode({
    token: { sub: tenantUser.id, email: tenantUser.email, role: 'seller' },
    secret,
    salt: SESSION_COOKIE_NAME,
    maxAge: 60 * 60, // 1 hour
  })

  cookieStore.set(SESSION_COOKIE_NAME, impersonationSessionToken, {
    httpOnly: true,
    secure: USE_SECURE_COOKIES,
    sameSite: 'lax',
    maxAge: 60 * 60,
    path: '/',
  })

  // Mark impersonation active for the "return to admin" banner in the seller dashboard
  cookieStore.set('impersonating', tenant.storeName, {
    httpOnly: false,
    secure: USE_SECURE_COOKIES,
    sameSite: 'lax',
    maxAge: 60 * 60,
    path: '/',
  })

  // Land on the seller overview (yearly revenue grid) so the admin immediately
  // sees the tenant's data rather than an empty submission form.
  return NextResponse.redirect(new URL('/seller', request.url))
}
