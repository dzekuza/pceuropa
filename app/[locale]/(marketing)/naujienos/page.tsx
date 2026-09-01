import type { Metadata } from 'next'
import { getTranslations, getLocale } from 'next-intl/server'
import { Nav } from '@/components/marketing/nav'
import { Footer } from '@/components/marketing/footer'
import { PageBannerCarousel } from '@/components/marketing/page-banner-carousel'
import { ArticlesGrid } from '@/components/articles/articles-grid'
import { getPuckBannerSlides } from '@/lib/page-content'
import { createClient } from '@/lib/supabase/server'
import { STORAGE_PUBLIC_BASE } from '@/lib/utils/supabase-image'

const DEFAULT_BANNER_SLIDES = [
  `${STORAGE_PUBLIC_BASE}/marketing-assets/banner-akcijos-1.jpg`,
  `${STORAGE_PUBLIC_BASE}/marketing-assets/banner-akcijos-2.jpg`,
]

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('naujienos')
  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
  }
}

export const revalidate = 300

export default async function NaujienosPage() {
  const t = await getTranslations('naujienos')
  const locale = await getLocale()
  const [bannerSlides, supabase] = await Promise.all([
    getPuckBannerSlides('naujienos', DEFAULT_BANNER_SLIDES, locale),
    createClient(),
  ])

  const { data: articles } = await supabase
    .from('articles')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false })

  return (
    <main className="bg-[#f7f7f5] flex flex-col items-center min-h-screen font-[family-name:var(--font-jakarta)]">
      <Nav />
      <h1 className="sr-only">{t('pageTitle')}</h1>
      <PageBannerCarousel slides={bannerSlides} />
      <section className="w-full flex-1 max-w-[1332px] mx-auto px-4 py-8 md:py-10 lg:py-14">
        <ArticlesGrid articles={articles ?? []} />
      </section>
      <Footer />
    </main>
  )
}
