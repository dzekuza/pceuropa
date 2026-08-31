import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { Nav } from '@/components/marketing/nav'
import { Footer } from '@/components/marketing/footer'
import { AkcijosGrid } from '@/components/marketing/akcijos-grid'
import { PageBannerCarousel } from '@/components/marketing/page-banner-carousel'
import { createClient } from '@/lib/supabase/server'
import { formatPromoDateRange } from '@/lib/utils/format-promo-date'
import { getPuckBannerSlides, getPuckBlockProps } from '@/lib/page-content'
import type { PromoItem } from '@/components/marketing/promo-card'
import { STORAGE_PUBLIC_BASE } from '@/lib/utils/supabase-image'

const DEFAULT_BANNER_SLIDES = [
  `${STORAGE_PUBLIC_BASE}/marketing-assets/banner-akcijos-1.jpg`,
  `${STORAGE_PUBLIC_BASE}/marketing-assets/banner-akcijos-2.jpg`,
]

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('akcijos')
  return {
    title: 'Akcijos ir Naujienos — PC Europa',
    description: t('pageDescription'),
  }
}

export default async function AkcijosPage() {
  const t = await getTranslations('akcijos')
  const DEFAULT_GRID_COPY = {
    filterAllLabel: t('filterAll'),
    filterStoresLabel: t('filterStores'),
    filterServicesLabel: t('filterServices'),
    filterFoodLabel: t('filterFood'),
    searchPlaceholder: t('searchPlaceholder'),
    loadMoreLabel: t('loadMore'),
  }

  const supabase = await createClient()
  const locale = await getLocale()

  const [bannerSlides, gridCopy, { data: promos }] = await Promise.all([
    getPuckBannerSlides('akcijos', DEFAULT_BANNER_SLIDES, locale),
    getPuckBlockProps('akcijos', 'AkcijosGridBlock', DEFAULT_GRID_COPY, locale),
    supabase
      .from('promos')
      .select('slug, image, title, title_en, starts_at, ends_at, category')
      .eq('published', true)
      .order('created_at', { ascending: false }),
  ])

  const items: PromoItem[] = (promos ?? []).map((p) => ({
    id: p.slug,
    image: p.image,
    title: locale === 'en' ? (p.title_en || p.title) : p.title,
    date: formatPromoDateRange(p.starts_at, p.ends_at, locale),
    href: `/akcijos/${p.slug}`,
    category: p.category,
  }))

  return (
    <main className="bg-[#f7f7f5] flex flex-col items-center min-h-screen font-[family-name:var(--font-jakarta)]">
      <Nav />

      <h1 className="sr-only">{t('pageTitle')}</h1>
      <PageBannerCarousel slides={bannerSlides} />

      {/* Promo grid with filters */}
      <section className="w-full max-w-[1332px] mx-auto px-4 py-8 md:py-10 lg:py-14">
        <AkcijosGrid items={items} {...gridCopy} />
      </section>

      <Footer />
    </main>
  )
}
