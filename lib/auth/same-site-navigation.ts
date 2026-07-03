// lib/auth/same-site-navigation.ts — CSRF guard for state-changing GET routes
//
// These routes are reached via full-page browser navigation (router.push /
// window.open), not fetch, so a body-based CSRF token isn't an option. Instead
// reject any request that didn't originate from a same-site navigation, using
// Sec-Fetch-Site (sent by all evergreen browsers) with a Referer fallback for
// older clients that omit it.
import type { NextRequest } from 'next/server'

export function isSameSiteNavigation(request: NextRequest): boolean {
  const secFetchSite = request.headers.get('sec-fetch-site')
  if (secFetchSite) {
    return secFetchSite === 'same-origin' || secFetchSite === 'same-site' || secFetchSite === 'none'
  }

  const referer = request.headers.get('referer')
  if (!referer) return false

  try {
    return new URL(referer).host === request.nextUrl.host
  } catch {
    return false
  }
}
