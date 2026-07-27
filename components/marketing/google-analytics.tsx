'use client'

import { Suspense, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Script from 'next/script'
import { GA_MEASUREMENT_ID } from '@/lib/constants'
import { getStoredConsent, onConsentChange } from '@/lib/consent'
import { gtag } from '@/lib/analytics'

function applyConsent(granted: boolean) {
  gtag('consent', 'update', {
    analytics_storage: granted ? 'granted' : 'denied',
  })
}

// gtag('config') only sends a page_view for the initial script load — App Router
// navigations don't reload the page, so we send page_view manually on every
// pathname/query change (send_page_view: false in ga-init hands this off entirely).
function PageviewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const query = searchParams.toString()
    gtag('event', 'page_view', {
      page_path: query ? `${pathname}?${query}` : pathname,
      page_location: window.location.href,
      page_title: document.title,
    })
  }, [pathname, searchParams])

  return null
}

// Loads gtag.js unconditionally (required so GA can react to consent changes),
// but analytics_storage defaults to denied — no cookies are written until the
// visitor accepts the CookieConsentBanner. See lib/consent.ts.
export function GoogleAnalytics() {
  useEffect(() => {
    if (getStoredConsent() === 'accepted') applyConsent(true)
    return onConsentChange((value) => applyConsent(value === 'accepted'))
  }, [])

  return (
    <>
      <Script id="ga-consent-default" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', { analytics_storage: 'denied' });`}
      </Script>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });`}
      </Script>
      <Suspense fallback={null}>
        <PageviewTracker />
      </Suspense>
    </>
  )
}
