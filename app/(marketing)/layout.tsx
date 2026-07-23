import type { Metadata } from 'next'
import { CookieConsentBanner } from '@/components/marketing/cookie-consent-banner'

export const metadata: Metadata = {
  title: 'PC Europa — Miesto gyvenimo centras',
  description: 'Parduotuvės, restoranai, pramogos ir sportas vienoje vietoje.',
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <CookieConsentBanner />
    </>
  )
}
