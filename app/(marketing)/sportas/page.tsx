import { Nav } from '@/components/marketing/nav'
import { Footer } from '@/components/marketing/footer'
import { StoresDirectory } from '@/components/marketing/stores-directory'
import { PlanasSection } from '@/components/marketing/planas-section'
import { PageBannerCarousel } from '@/components/marketing/page-banner-carousel'
import { getPublicTenants } from '@/lib/tenants-public'
import { SPORTAS_STRINGS } from '@/lib/strings'
import { getPuckBannerSlides } from '@/lib/page-content'
import { normalizeCategory } from '@/lib/constants'

export const metadata = {
  title: SPORTAS_STRINGS.pageTitle,
  description: SPORTAS_STRINGS.pageDescription,
}

const DEFAULT_BANNER_SLIDES = [
  'https://ybyyxcuvxuzrledbitky.supabase.co/storage/v1/object/public/marketing-assets/banner-sportas-carousel.jpg',
]

export default async function SportasPage() {
  const bannerSlides = await getPuckBannerSlides('sportas', DEFAULT_BANNER_SLIDES)
  const tenants = (await getPublicTenants()).filter((t) => t.category === 'SPORTAS IR SVEIKATINGUMAS')

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

      <h1 className="sr-only">Sportas — PC Europa</h1>
      <PageBannerCarousel slides={bannerSlides} />

      {/* Sports stores directory */}
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
