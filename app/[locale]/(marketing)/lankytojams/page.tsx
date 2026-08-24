import type { Metadata } from 'next'
import { getTranslations, getLocale } from 'next-intl/server'
import { Nav } from '@/components/marketing/nav'
import { Footer } from '@/components/marketing/footer'
import { LankytojamsContent, type FaqItem } from '@/components/marketing/lankytojams-content'
import { PageBannerCarousel } from '@/components/marketing/page-banner-carousel'
import { getPuckBannerSlides, getPuckBlockProps } from '@/lib/page-content'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('lankytojams')
  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
  }
}

const DEFAULT_BANNER_SLIDES: string[] = []

export default async function LankytojamsPage() {
  const t = await getTranslations('lankytojams')

  const DEFAULT_LANKYTOJAMS_BLOCK = {
    heading: t('heading'),
    parkingTitle: t('parkingTitle'),
    parkingBody: t('parkingBody'),
    accessTitle: t('accessTitle'),
    accessPublicTransport: t('accessPublicTransport'),
    accessByCar: t('accessByCar'),
    amenitiesTitle: t('amenitiesTitle'),
    amenities: (t.raw('amenities') as string[]).map((value) => ({ value })),
    faqTitle: t('faqTitle'),
    faqItems: (t.raw('faqItems') as FaqItem[]).map((item) => ({ ...item })),
  }

  const locale = await getLocale()
  const bannerSlides = await getPuckBannerSlides('lankytojams', DEFAULT_BANNER_SLIDES, locale)
  const block = await getPuckBlockProps('lankytojams', 'LankytojamsBlock', DEFAULT_LANKYTOJAMS_BLOCK, locale)

  return (
    <main className="bg-[#f7f7f5] flex flex-col items-center min-h-screen font-[family-name:var(--font-jakarta)]">
      <Nav />

      <PageBannerCarousel slides={bannerSlides} />

      <LankytojamsContent
        heading={block.heading}
        parkingTitle={block.parkingTitle}
        parkingBody={block.parkingBody}
        accessTitle={block.accessTitle}
        accessPublicTransport={block.accessPublicTransport}
        accessByCar={block.accessByCar}
        amenitiesTitle={block.amenitiesTitle}
        amenities={block.amenities.map((a) => a.value)}
        faqTitle={block.faqTitle}
        faqItems={block.faqItems}
      />

      <Footer />
    </main>
  )
}
