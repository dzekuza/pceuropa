import type { Metadata } from 'next'
import { CookieConsentBanner } from '@/components/marketing/cookie-consent-banner'
import { GoogleAnalytics } from '@/components/marketing/google-analytics'

export const metadata: Metadata = {
  title: 'PC Europa — Miesto gyvenimo centras',
  description: 'Parduotuvės, restoranai, pramogos ir sportas vienoje vietoje.',
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GoogleAnalytics />
      {children}
      <CookieConsentBanner />
    </>
  )
}
