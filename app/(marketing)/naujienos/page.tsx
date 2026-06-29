import type { Metadata } from 'next'
import { Nav } from '@/components/marketing/nav'
import { Footer } from '@/components/marketing/footer'
import { PageBannerCarousel } from '@/components/marketing/page-banner-carousel'
import { ArticlesGrid } from '@/components/articles/articles-grid'
import { NAUJIENOS_STRINGS } from '@/lib/strings'
import { getPuckBannerSlides } from '@/lib/page-content'
import { createClient } from '@/lib/supabase/server'

const DEFAULT_BANNER_SLIDES = [
  'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/banner-akcijos-1.jpg',
  'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/banner-akcijos-2.jpg',
]

export const metadata: Metadata = {
  title: NAUJIENOS_STRINGS.pageTitle,
  description: NAUJIENOS_STRINGS.pageDescription,
}

export const dynamic = 'force-dynamic'

export default async function NaujienosPage() {
  const [bannerSlides, supabase] = await Promise.all([
    getPuckBannerSlides('naujienos', DEFAULT_BANNER_SLIDES),
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
      <h1 className="sr-only">{NAUJIENOS_STRINGS.pageTitle}</h1>
      <PageBannerCarousel slides={bannerSlides} />
      <section className="w-full max-w-[1332px] mx-auto px-4 py-8 md:py-10 lg:py-14">
        <ArticlesGrid articles={articles ?? []} />
      </section>
      <Footer />
    </main>
  )
}
