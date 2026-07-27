// lib/analytics.ts — GA4 event tracking via gtag.js. See components/marketing/google-analytics.tsx.

declare global {
  interface Window {
    dataLayer: unknown[]
  }
}

export function gtag(...args: unknown[]) {
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(args)
}

export function trackEvent(name: string, params?: Record<string, string>) {
  gtag('event', name, params)
}
