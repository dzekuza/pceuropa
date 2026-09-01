import type { Metadata } from 'next'
import { Nav } from '@/components/marketing/nav'
import { Footer } from '@/components/marketing/footer'
import { DialogaiSection } from '@/components/marketing/dialogai-section'
import { PlanasSection } from '@/components/marketing/planas-section'
import { DialogaiFoodCourtDirectory } from '@/components/marketing/dialogai-food-court-directory'
import { PageBannerCarousel } from '@/components/marketing/page-banner-carousel'
import { getPublicTenants } from '@/lib/tenants-public'
import { getPuckBannerSlides } from '@/lib/page-content'
import { getLocale, getTranslations } from 'next-intl/server'
import { STORAGE_PUBLIC_BASE } from '@/lib/utils/supabase-image'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('dialogaiPage')
  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
  }
}

const DEFAULT_BANNER_SLIDES = [
  `${STORAGE_PUBLIC_BASE}/marketing-assets/banner-dialogai-1.jpg`,
  `${STORAGE_PUBLIC_BASE}/marketing-assets/banner-dialogai-2.jpg`,
  `${STORAGE_PUBLIC_BASE}/marketing-assets/banner-dialogai-3.jpg`,
]

// 'DIALOGAI' is the raw legacy value still stored on tenants imported before
// 'Dialogai' existed as its own TENANT_CATEGORIES option (see lib/constants.ts) —
// keep both until those rows are re-saved through the admin category dropdown.
const DIALOGAI_CATEGORIES = new Set(['Dialogai', 'DIALOGAI'])

export default async function DialogaiPage() {
  const locale = await getLocale()
  const tPage = await getTranslations('dialogaiPage')
  const bannerSlides = await getPuckBannerSlides('dialogai', DEFAULT_BANNER_SLIDES, locale)
  const tenants = (await getPublicTenants()).filter((t) => t.category && DIALOGAI_CATEGORIES.has(t.category))

  const places = tenants.map((t) => ({
    id: t.id ?? '',
    slug: t.slug ?? '',
    name: (locale === 'en' ? t.store_name_en : null) || t.store_name || '',
    category: (locale === 'en' && t.category_en) || t.category || 'Kita',
    logoUrl: t.logo_url ?? null,
    coverUrl: t.gallery_images?.[0] ?? null,
  }))

  return (
    <main className="bg-[#f7f7f5] flex flex-col items-center min-h-screen font-[family-name:var(--font-jakarta)]">
      <Nav />

      <h1 className="sr-only">{tPage('pageTitle')}</h1>
      <PageBannerCarousel slides={bannerSlides} />

      {/* Food court directory grid */}
      <div className="w-full flex flex-col items-center">
        <DialogaiFoodCourtDirectory places={places} />
      </div>

      {/* Dialogai promo section */}
      <DialogaiSection />

      {/* Floor plan */}
      <div className="w-full bg-[#f7f7f5]">
        <PlanasSection stores={places} />
      </div>

      <Footer />
    </main>
  )
}
