import type { Metadata } from 'next'
import { getTranslations, getLocale } from 'next-intl/server'
import { Nav } from '@/components/marketing/nav'
import { Footer } from '@/components/marketing/footer'
import { VisitorInfoBanner } from '@/components/marketing/visitor-info-banner'
import { getPuckBannerSlides, getPuckBlockProps } from '@/lib/page-content'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('kontaktai')
  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
  }
}

export default async function KontaktaiPage() {
  const t = await getTranslations('kontaktai')

  const defaultKontaktaiBlock = {
    heading: t('heading'),
    addressTitle: t('addressTitle'),
    address: t('address'),
    hoursTitle: t('hoursTitle'),
    hoursWeekdays: t('hoursWeekdays'),
    hoursSaturday: t('hoursSaturday'),
    hoursSunday: t('hoursSunday'),
    adminHoursTitle: t('adminHoursTitle'),
    adminHours: t('adminHours'),
  }

  const locale = await getLocale()
  const bannerSlides = await getPuckBannerSlides('kontaktai', [], locale)
  const s = await getPuckBlockProps('kontaktai', 'KontaktaiBlock', defaultKontaktaiBlock, locale)

  return (
    <main className="bg-[#f7f7f5] flex flex-col items-center min-h-screen font-[family-name:var(--font-jakarta)]">
      <Nav />

      {/* Info banner — matches darbo-laikas "Nav / Banner" section */}
      <div className="w-full max-w-[1332px] mx-auto px-4 pt-6 lg:pt-8">
        <VisitorInfoBanner heading={s.heading} {...(bannerSlides[0] ? { backgroundImage: bannerSlides[0] } : {})} />
      </div>

      <div className="w-full max-w-[1332px] mx-auto px-4 py-10 md:py-14 flex flex-col gap-12">
        <h1 className="font-bold text-[36px] md:text-[48px] leading-tight text-black">
          {s.heading}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Address */}
          <section className="bg-white rounded-[24px] p-8 flex flex-col gap-4">
            <h2 className="font-bold text-[22px] text-black">{s.addressTitle}</h2>
            <p className="text-[#575757] leading-relaxed whitespace-pre-line">{s.address}</p>
          </section>

          {/* Working hours */}
          <section className="bg-white rounded-[24px] p-8 flex flex-col gap-4">
            <h2 className="font-bold text-[22px] text-black">{s.hoursTitle}</h2>
            <ul className="flex flex-col gap-2">
              <li className="text-[#575757] leading-relaxed">{s.hoursWeekdays}</li>
              <li className="text-[#575757] leading-relaxed">{s.hoursSaturday}</li>
              <li className="text-[#575757] leading-relaxed">{s.hoursSunday}</li>
              <li className="text-[#575757] leading-relaxed">{s.adminHoursTitle}: {s.adminHours}</li>
            </ul>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  )
}
