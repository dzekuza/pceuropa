'use server'
// actions/site-lock.ts — Server Action for the public site's under-construction gate
import { createHash, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { SITE_LOCK_COOKIE } from '@/lib/constants'
import { UNDER_CONSTRUCTION_STRINGS as S } from '@/lib/strings'

// Constant-time compare — hash both sides first so length differences (which
// timingSafeEqual would otherwise throw on) don't leak the expected password's length.
function passwordsMatch(input: string, expected: string): boolean {
  const a = createHash('sha256').update(input).digest()
  const b = createHash('sha256').update(expected).digest()
  return timingSafeEqual(a, b)
}

export type UnlockSiteState = { error: string | null; redirectTo?: string }

// Only allow redirecting back to a same-site path — never an absolute/protocol-relative URL.
function sanitizeRedirect(redirectTo: FormDataEntryValue | null): string {
  if (typeof redirectTo !== 'string' || !redirectTo.startsWith('/') || redirectTo.startsWith('//')) {
    return '/'
  }
  return redirectTo
}

export async function unlockSite(
  _prevState: UnlockSiteState,
  formData: FormData
): Promise<UnlockSiteState> {
  const password = formData.get('password')
  const redirectTo = sanitizeRedirect(formData.get('redirectTo'))

  if (typeof password !== 'string' || password.length === 0) {
    return { error: S.errorRequired }
  }

  const expected = process.env.MAINTENANCE_PASSWORD
  if (!expected || !passwordsMatch(password, expected)) {
    return { error: S.errorWrongPassword }
  }

  const cookieStore = await cookies()
  cookieStore.set(SITE_LOCK_COOKIE, '1', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    // No maxAge/expires — session cookie, cleared when the browser closes.
  })

  // Navigate client-side (see ComingSoonInfiniteMenu) instead of calling redirect()
  // here — redirect() inside a useActionState action throws mid-transition and
  // triggers React's "useInsertionEffect must not schedule updates" error.
  return { error: null, redirectTo }
}
