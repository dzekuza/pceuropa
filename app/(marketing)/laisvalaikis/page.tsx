import { Nav } from '@/components/marketing/nav'
import { Footer } from '@/components/marketing/footer'
import { StoresDirectory } from '@/components/marketing/stores-directory'
import { PlanasSection } from '@/components/marketing/planas-section'
import { PageBannerCarousel } from '@/components/marketing/page-banner-carousel'
import { getPublicTenants } from '@/lib/tenants-public'
import { LAISVALAIKIS_STRINGS } from '@/lib/strings'
import { getPuckBannerSlides } from '@/lib/page-content'
import { normalizeCategory } from '@/lib/constants'

export const metadata = {
  title: LAISVALAIKIS_STRINGS.pageTitle,
  description: LAISVALAIKIS_STRINGS.pageDescription,
}

const BASE = '/api/storage/marketing-assets'
const DEFAULT_BANNER_SLIDES = [`${BASE}/hero-bg.jpg`, `${BASE}/activities-coffee.jpg`]

// force-dynamic — Docker builds have no DATABASE_URL reachable at build
// time, so this page can't be pre-rendered; it must render per-request
// against the running container's DB instead.
export const dynamic = 'force-dynamic'

export default async function LaisvalaikisPage() {
  const bannerSlides = await getPuckBannerSlides('laisvalaikis', DEFAULT_BANNER_SLIDES)
  const tenants = (await getPublicTenants()).filter((t) => t.category === 'LAISVALAIKIS IR PRAMOGOS')

  const stores = tenants.map((t) => ({
    id: t.id,
    slug: t.slug,
    name: t.store_name,
    category: normalizeCategory(t.category),
    logoUrl: t.logo_url ?? null,
    coverUrl: t.gallery_images?.[0] ?? null,
  }))

  const planasStores = stores.map((s) => ({
    id: s.id,
    name: s.name,
    logoUrl: s.logoUrl,
  }))

  return (
    <main className="bg-[#f7f7f5] flex flex-col items-center min-h-screen font-[family-name:var(--font-jakarta)]">
      <Nav />

      <h1 className="sr-only">Laisvalaikis — PC Europa</h1>
      <PageBannerCarousel slides={bannerSlides} />

      {/* Leisure & entertainment directory */}
      <div className="w-full flex flex-col items-center">
        <StoresDirectory stores={stores} />
      </div>

      {/* Floor plan */}
      <div className="w-full bg-[#f7f7f5]">
        <PlanasSection stores={planasStores} />
      </div>

      <Footer />
    </main>
  )
}
