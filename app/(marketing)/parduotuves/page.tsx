import { Nav } from '@/components/marketing/nav'
import { Footer } from '@/components/marketing/footer'
import { StoresDirectory } from '@/components/marketing/stores-directory'
import { PlanasSection } from '@/components/marketing/planas-section'
import { PageBannerCarousel } from '@/components/marketing/page-banner-carousel'
import { getPublicTenants } from '@/lib/tenants-public'
import { getPuckBannerSlides } from '@/lib/page-content'
import { normalizeCategory } from '@/lib/constants'

export const metadata = {
  title: 'Parduotuvės ir Paslaugos — PC Europa',
  description: 'Visos PC Europa parduotuvės ir paslaugos vienoje vietoje.',
}

const DEFAULT_BANNER_SLIDES = [
  '/api/storage/marketing-assets/banner-parduotuves-wide.jpg',
]

// force-dynamic — Docker builds have no DATABASE_URL reachable at build
// time, so this page can't be pre-rendered; it must render per-request
// against the running container's DB instead.
export const dynamic = 'force-dynamic'

export default async function ParduotuvesPage() {
  const bannerSlides = await getPuckBannerSlides('parduotuves', DEFAULT_BANNER_SLIDES)
  const tenants = await getPublicTenants()

  const stores = tenants.map((t) => ({
    id: t.id,
    slug: t.slug,
    name: t.store_name,
    category: normalizeCategory(t.category),
    logoUrl: t.logo_url ?? null,
    coverUrl: t.gallery_images?.[0] ?? null,
  }))

  return (
    <main className="bg-[#f7f7f5] flex flex-col items-center min-h-screen font-[family-name:var(--font-jakarta)]">
      <Nav />

      <h1 className="sr-only">Parduotuvės ir Paslaugos — PC Europa</h1>
      <PageBannerCarousel slides={bannerSlides} />

      {/* Stores directory */}
      <div className="w-full flex flex-col items-center">
        <StoresDirectory stores={stores} excludeCategories={['Maistas ir restoranai']} />
      </div>

      {/* Floor plan */}
      <div className="w-full bg-[#f7f7f5]">
        <PlanasSection stores={stores.filter((s) => s.category !== 'Maistas ir restoranai')} />
      </div>

      <Footer />
    </main>
  )
}
