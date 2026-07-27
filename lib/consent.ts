// lib/consent.ts — shared cookie-consent state for the marketing site

export type ConsentValue = 'accepted' | 'rejected'

const STORAGE_KEY = 'pceuropa-cookie-consent'
const CONSENT_EVENT = 'pceuropa-consent-change'

export function getStoredConsent(): ConsentValue | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw === 'accepted' || raw === 'rejected' ? raw : null
}

// localStorage's native 'storage' event only fires in other tabs, so we
// dispatch a custom event to notify listeners (e.g. the GA loader) in this tab.
export function setStoredConsent(value: ConsentValue) {
  localStorage.setItem(STORAGE_KEY, value)
  window.dispatchEvent(new CustomEvent<ConsentValue>(CONSENT_EVENT, { detail: value }))
}

export function onConsentChange(handler: (value: ConsentValue) => void) {
  const listener = (event: Event) => handler((event as CustomEvent<ConsentValue>).detail)
  window.addEventListener(CONSENT_EVENT, listener)
  return () => window.removeEventListener(CONSENT_EVENT, listener)
}
