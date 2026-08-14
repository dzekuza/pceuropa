import type { Metadata } from 'next'
import { Nav } from '@/components/marketing/nav'
import { Footer } from '@/components/marketing/footer'

export const metadata: Metadata = {
  title: 'Prekybos centro planas — PC Europa',
  description: 'PC Europa prekybos centro aukštų planas ir parduotuvių sąrašas.',
}

export default function PlanasPage() {
  return (
    <main className="bg-[#f7f7f5] flex flex-col items-center min-h-screen font-[family-name:var(--font-jakarta)]">
      <Nav />
      <Footer />
    </main>
  )
}
