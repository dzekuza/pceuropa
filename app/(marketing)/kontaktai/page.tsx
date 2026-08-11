import type { Metadata } from 'next'
import { Nav } from '@/components/marketing/nav'
import { Footer } from '@/components/marketing/footer'
import { VisitorInfoBanner } from '@/components/marketing/visitor-info-banner'
import { getPuckBannerSlides, getPuckBlockProps } from '@/lib/page-content'
import { KONTAKTAI_STRINGS } from '@/lib/strings'

const DEFAULT_KONTAKTAI_BLOCK = {
  heading: KONTAKTAI_STRINGS.heading,
  addressTitle: KONTAKTAI_STRINGS.addressTitle,
  address: KONTAKTAI_STRINGS.address,
  hoursTitle: KONTAKTAI_STRINGS.hoursTitle,
  hoursWeekdays: KONTAKTAI_STRINGS.hoursWeekdays,
  hoursSaturday: KONTAKTAI_STRINGS.hoursSaturday,
  hoursSunday: KONTAKTAI_STRINGS.hoursSunday,
  adminHoursTitle: KONTAKTAI_STRINGS.adminHoursTitle,
  adminHours: KONTAKTAI_STRINGS.adminHours,
}

export const metadata: Metadata = {
  title: KONTAKTAI_STRINGS.pageTitle,
  description: KONTAKTAI_STRINGS.pageDescription,
}

export default async function KontaktaiPage() {
  const bannerSlides = await getPuckBannerSlides('kontaktai', [])
  const s = await getPuckBlockProps('kontaktai', 'KontaktaiBlock', DEFAULT_KONTAKTAI_BLOCK)

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
