import type { Metadata } from 'next'
import { Nav } from '@/components/marketing/nav'
import { Footer } from '@/components/marketing/footer'
import { VisitorInfoBanner } from '@/components/marketing/visitor-info-banner'
import { HowToGetHereSection } from '@/components/marketing/how-to-get-here-section'
import { getPuckBannerSlides, getPuckBlockProps } from '@/lib/page-content'
import { KAIP_ATVYKTI_STRINGS, DARBO_LAIKAS_STRINGS } from '@/lib/strings'

const DEFAULT_HOW_TO_GET_HERE = {
  heading: KAIP_ATVYKTI_STRINGS.heading,
  subtext: KAIP_ATVYKTI_STRINGS.addressNote,
  mapEmbedUrl: 'https://maps.google.com/maps?q=Europa,+Konstitucijos+pr.+7A,+Vilnius,+09308&t=&z=15&ie=UTF8&iwloc=&output=embed',
  mapLinkUrl: 'https://maps.google.com/?q=Europa,+Konstitucijos+pr.+7A,+Vilnius,+09308',
  viewRouteLabel: DARBO_LAIKAS_STRINGS.viewRouteButton,
  transportCards: DARBO_LAIKAS_STRINGS.transportCards.map((c) => ({ ...c })),
}

export const metadata: Metadata = {
  title: KAIP_ATVYKTI_STRINGS.pageTitle,
  description: KAIP_ATVYKTI_STRINGS.pageDescription,
}

export default async function KaipAtvyktiPage() {
  const bannerSlides = await getPuckBannerSlides('kaip-atvykti', [])
  const howToGetHere = await getPuckBlockProps('kaip-atvykti', 'HowToGetHereBlock', DEFAULT_HOW_TO_GET_HERE)

  return (
    <main className="bg-[#f7f7f5] flex flex-col items-center min-h-screen font-[family-name:var(--font-jakarta)]">
      <Nav />

      <div className="w-full max-w-[1332px] mx-auto px-4 pt-6 lg:pt-8">
        <VisitorInfoBanner heading={howToGetHere.heading} {...(bannerSlides[0] ? { backgroundImage: bannerSlides[0] } : {})} />
      </div>

      <div className="w-full max-w-[1332px] mx-auto px-4 py-10 md:py-14">
        <HowToGetHereSection {...howToGetHere} />
      </div>

      <Footer />
    </main>
  )
}
