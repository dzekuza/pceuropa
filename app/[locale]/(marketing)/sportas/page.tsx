import type { Metadata } from 'next'
import { getTranslations, getLocale } from 'next-intl/server'
import { Nav } from '@/components/marketing/nav'
import { Footer } from '@/components/marketing/footer'
import { StoresDirectory } from '@/components/marketing/stores-directory'
import { PlanasSection } from '@/components/marketing/planas-section'
import { PageBannerCarousel } from '@/components/marketing/page-banner-carousel'
import { getPublicTenants } from '@/lib/tenants-public'
import { getPuckBannerSlides } from '@/lib/page-content'
import { normalizeCategory } from '@/lib/constants'
import { STORAGE_PUBLIC_BASE } from '@/lib/utils/supabase-image'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('sportas')
  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
  }
}

const DEFAULT_BANNER_SLIDES = [
  `${STORAGE_PUBLIC_BASE}/marketing-assets/banner-sportas-carousel.jpg`,
]

export default async function SportasPage() {
  const locale = await getLocale()
  const bannerSlides = await getPuckBannerSlides('sportas', DEFAULT_BANNER_SLIDES, locale)
  const tenants = (await getPublicTenants()).filter((t) => normalizeCategory(t.category) === 'Sportas ir sveikatingumas')

  const stores = tenants.map((t) => ({
    id: t.id ?? '',
    slug: t.slug ?? '',
    name: (locale === 'en' ? t.store_name_en : null) || t.store_name || '',
    category: (locale === 'en' && t.category_en) || normalizeCategory(t.category),
    logoUrl: t.logo_url ?? null,
    coverUrl: t.gallery_images?.[0] ?? null,
    weekdayHours: t.weekday_hours,
    saturdayHours: t.saturday_hours,
    sundayHours: t.sunday_hours,
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
