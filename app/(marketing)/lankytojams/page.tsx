import type { Metadata } from 'next'
import { Nav } from '@/components/marketing/nav'
import { Footer } from '@/components/marketing/footer'
import { LankytojamsContent } from '@/components/marketing/lankytojams-content'
import { PageBannerCarousel } from '@/components/marketing/page-banner-carousel'
import { getPuckBannerSlides, getPuckBlockProps } from '@/lib/page-content'
import { LANKYTOJAMS_STRINGS } from '@/lib/strings'

export const metadata: Metadata = {
  title: LANKYTOJAMS_STRINGS.pageTitle,
  description: LANKYTOJAMS_STRINGS.pageDescription,
}

const DEFAULT_BANNER_SLIDES: string[] = []

const DEFAULT_LANKYTOJAMS_BLOCK = {
  heading: LANKYTOJAMS_STRINGS.heading,
  parkingTitle: LANKYTOJAMS_STRINGS.parkingTitle,
  parkingBody: LANKYTOJAMS_STRINGS.parkingBody,
  accessTitle: LANKYTOJAMS_STRINGS.accessTitle,
  accessPublicTransport: LANKYTOJAMS_STRINGS.accessPublicTransport,
  accessByCar: LANKYTOJAMS_STRINGS.accessByCar,
  amenitiesTitle: LANKYTOJAMS_STRINGS.amenitiesTitle,
  amenities: LANKYTOJAMS_STRINGS.amenities.map((value) => ({ value })),
  faqTitle: LANKYTOJAMS_STRINGS.faqTitle,
  faqItems: LANKYTOJAMS_STRINGS.faqItems.map((item) => ({ ...item })),
}

// force-dynamic — Docker builds have no DATABASE_URL reachable at build
// time, so this page can't be pre-rendered; it must render per-request
// against the running container's DB instead.
export const dynamic = 'force-dynamic'

export default async function LankytojamsPage() {
  const bannerSlides = await getPuckBannerSlides('lankytojams', DEFAULT_BANNER_SLIDES)
  const block = await getPuckBlockProps('lankytojams', 'LankytojamsBlock', DEFAULT_LANKYTOJAMS_BLOCK)

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
