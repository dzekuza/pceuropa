import type { Metadata } from 'next'
import { Nav } from '@/components/marketing/nav'
import { Footer } from '@/components/marketing/footer'
import { AkcijosGrid } from '@/components/marketing/akcijos-grid'
import { PageBannerCarousel } from '@/components/marketing/page-banner-carousel'
import { AKCIJOS_STRINGS } from '@/lib/strings'
import { createClient } from '@/lib/supabase/server'
import { formatPromoDateRange } from '@/lib/utils/format-promo-date'
import { getPuckBannerSlides, getPuckBlockProps } from '@/lib/page-content'
import type { PromoItem } from '@/components/marketing/promo-card'

const DEFAULT_BANNER_SLIDES = [
  'https://ybyyxcuvxuzrledbitky.supabase.co/storage/v1/object/public/marketing-assets/banner-akcijos-1.jpg',
  'https://ybyyxcuvxuzrledbitky.supabase.co/storage/v1/object/public/marketing-assets/banner-akcijos-2.jpg',
]

const DEFAULT_GRID_COPY = {
  filterAllLabel: AKCIJOS_STRINGS.filterAll,
  filterStoresLabel: AKCIJOS_STRINGS.filterStores,
  filterServicesLabel: AKCIJOS_STRINGS.filterServices,
  filterFoodLabel: AKCIJOS_STRINGS.filterFood,
  searchPlaceholder: AKCIJOS_STRINGS.searchPlaceholder,
  loadMoreLabel: AKCIJOS_STRINGS.loadMore,
}

export const metadata: Metadata = {
  title: 'Akcijos ir Naujienos — PC Europa',
  description: AKCIJOS_STRINGS.pageDescription,
}

export default async function AkcijosPage() {
  const bannerSlides = await getPuckBannerSlides('akcijos', DEFAULT_BANNER_SLIDES)
  const gridCopy = await getPuckBlockProps('akcijos', 'AkcijosGridBlock', DEFAULT_GRID_COPY)

  const supabase = await createClient()
  const { data: promos } = await supabase
    .from('promos')
    .select('slug, image, title, starts_at, ends_at, category')
    .eq('published', true)
    .order('created_at', { ascending: false })

  const items: PromoItem[] = (promos ?? []).map((p) => ({
    id: p.slug,
    image: p.image,
    title: p.title,
    date: formatPromoDateRange(p.starts_at, p.ends_at),
    href: `/akcijos/${p.slug}`,
    category: p.category,
  }))

  return (
    <main className="bg-[#f7f7f5] flex flex-col items-center min-h-screen font-[family-name:var(--font-jakarta)]">
      <Nav />

      <h1 className="sr-only">{AKCIJOS_STRINGS.pageTitle}</h1>
      <PageBannerCarousel slides={bannerSlides} />

      {/* Promo grid with filters */}
      <section className="w-full max-w-[1332px] mx-auto px-4 py-8 md:py-10 lg:py-14">
        <AkcijosGrid items={items} {...gridCopy} />
      </section>

      <Footer />
    </main>
  )
}
