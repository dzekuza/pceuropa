import type { Metadata } from 'next'
import { getTranslations, getLocale } from 'next-intl/server'
import { Nav } from '@/components/marketing/nav'
import { Footer } from '@/components/marketing/footer'
import { VisitorInfoBanner } from '@/components/marketing/visitor-info-banner'
import { HowToGetHereSection } from '@/components/marketing/how-to-get-here-section'
import { getPuckBannerSlides, getPuckBlockProps } from '@/lib/page-content'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('kaipAtvykti')
  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
  }
}

export default async function KaipAtvyktiPage() {
  const t = await getTranslations('kaipAtvykti')
  const tDarboLaikas = await getTranslations('darboLaikas')

  const defaultHowToGetHere = {
    heading: t('heading'),
    subtext: t('addressNote'),
    mapEmbedUrl: 'https://maps.google.com/maps?q=Europa,+Konstitucijos+pr.+7A,+Vilnius,+09308&t=&z=15&ie=UTF8&iwloc=&output=embed',
    mapLinkUrl: 'https://maps.google.com/?q=Europa,+Konstitucijos+pr.+7A,+Vilnius,+09308',
    viewRouteLabel: tDarboLaikas('viewRouteButton'),
    transportCards: tDarboLaikas.raw('transportCards') as { title: string; subtitle: string }[],
  }

  const locale = await getLocale()
  const bannerSlides = await getPuckBannerSlides('kaip-atvykti', [], locale)
  const howToGetHere = await getPuckBlockProps('kaip-atvykti', 'HowToGetHereBlock', defaultHowToGetHere, locale)

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
