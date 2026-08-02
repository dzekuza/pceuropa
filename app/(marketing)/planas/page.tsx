import type { Metadata } from 'next'
import { Nav } from '@/components/marketing/nav'
import { Footer } from '@/components/marketing/footer'
import { PlanasSection } from '@/components/marketing/planas-section'
import { getPublicTenants } from '@/lib/tenants-public'

export const metadata: Metadata = {
  title: 'Prekybos centro planas — PC Europa',
  description: 'PC Europa prekybos centro aukštų planas ir parduotuvių sąrašas.',
}

// force-dynamic — Docker builds have no DATABASE_URL reachable at build
// time, so this page can't be pre-rendered; it must render per-request
// against the running container's DB instead.
export const dynamic = 'force-dynamic'

export default async function PlanasPage() {
  const tenants = await getPublicTenants()

  const stores = tenants.map((t) => ({
    id: t.id,
    name: t.store_name,
    logoUrl: t.logo_url ?? null,
  }))

  return (
    <main className="bg-[#f7f7f5] flex flex-col items-center min-h-screen font-[family-name:var(--font-jakarta)]">
      <Nav />
      <div className="w-full bg-[#f7f7f5]">
        <PlanasSection stores={stores} />
      </div>
      <Footer />
    </main>
  )
}
