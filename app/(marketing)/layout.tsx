import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PC Europa — Miesto gyvenimo centras',
  description: 'Parduotuvės, restoranai, pramogos ir sportas vienoje vietoje.',
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
