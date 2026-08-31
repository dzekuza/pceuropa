import { Nav } from '@/components/marketing/nav'
import { Footer } from '@/components/marketing/footer'
import { RestaurantsDirectory } from '@/components/marketing/restaurants-directory'
import { DialogaiSection, RESTORANAI_SECTION_PROPS } from '@/components/marketing/dialogai-section'
import { PlanasSection } from '@/components/marketing/planas-section'
import { PageBannerCarousel } from '@/components/marketing/page-banner-carousel'
import { getPublicTenants } from '@/lib/tenants-public'
import { getPuckBannerSlides } from '@/lib/page-content'
import { normalizeCategory } from '@/lib/constants'
import { STORAGE_PUBLIC_BASE } from '@/lib/utils/supabase-image'

export const metadata = {
  title: 'Restoranai ir Kavinės — PC Europa',
  description: 'Nuo rytinės kavos iki vakarienės mieste – PC EUROPA restoranai ir kavinės kviečia atrasti skonius, jaukią atmosferą ir malonias akimirkas kiekvieną dieną.',
}

const DEFAULT_BANNER_SLIDES = [
  `${STORAGE_PUBLIC_BASE}/marketing-assets/banner-restoranai-1.jpg`,
  `${STORAGE_PUBLIC_BASE}/marketing-assets/banner-restoranai-2.jpg`,
  `${STORAGE_PUBLIC_BASE}/marketing-assets/banner-restoranai-3.jpg`,
]

const RESTORANAI_CATEGORIES = new Set(['Maistas ir restoranai', 'Maistas', 'Kavinės', 'Restoranai', 'KAVINĖS/RESTORANAI'])

export default async function RestoranaiPage() {
  const bannerSlides = await getPuckBannerSlides('restoranai', DEFAULT_BANNER_SLIDES)
  const tenants = (await getPublicTenants()).filter((t) => t.category && RESTORANAI_CATEGORIES.has(t.category))

  const restaurants = tenants.map((t) => ({
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

      <h1 className="sr-only">Restoranai ir Kavinės — PC Europa</h1>
      <PageBannerCarousel slides={bannerSlides} />

      {/* Restaurants grid */}
      <div className="w-full flex flex-col items-center">
        <RestaurantsDirectory restaurants={restaurants} />
      </div>

      {/* Dialogai section */}
      <DialogaiSection {...RESTORANAI_SECTION_PROPS} />

      {/* Planas section */}
      <div className="w-full bg-[#f7f7f5]">
        <PlanasSection stores={restaurants} />
      </div>

      <Footer />
    </main>
  )
}
