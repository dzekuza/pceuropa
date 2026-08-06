import type { Metadata } from 'next'
import { Nav } from '@/components/marketing/nav'
import { Footer } from '@/components/marketing/footer'
import { VisitorInfoBanner } from '@/components/marketing/visitor-info-banner'
import { getPuckBannerSlides } from '@/lib/page-content'
import { KONTAKTAI_STRINGS } from '@/lib/strings'

const DEFAULT_BANNER_SLIDES = [
  '/api/storage/marketing-assets/darbo-laikas/banner.jpg',
]

export const metadata: Metadata = {
  title: KONTAKTAI_STRINGS.pageTitle,
  description: KONTAKTAI_STRINGS.pageDescription,
}

// force-dynamic — Docker builds have no DATABASE_URL reachable at build
// time, so this page can't be pre-rendered; it must render per-request
// against the running container's DB instead.
export const dynamic = 'force-dynamic'

export default async function KontaktaiPage() {
  const s = KONTAKTAI_STRINGS
  const bannerSlides = await getPuckBannerSlides('kontaktai', DEFAULT_BANNER_SLIDES)

  return (
    <main className="bg-[#f7f7f5] flex flex-col items-center min-h-screen font-[family-name:var(--font-jakarta)]">
      <Nav />

      {/* Info banner — matches darbo-laikas "Nav / Banner" section */}
      <div className="w-full max-w-[1332px] mx-auto px-4 pt-6 lg:pt-8">
        <VisitorInfoBanner backgroundImage={bannerSlides[0]} />
      </div>

      <div className="w-full max-w-[1332px] mx-auto px-4 py-10 md:py-14 flex flex-col gap-12">
        <h1 className="font-bold text-[36px] md:text-[48px] leading-tight text-black">
          {s.heading}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Address */}
          <section className="bg-white rounded-[24px] p-8 flex flex-col gap-4">
            <h2 className="font-bold text-[22px] text-black">{s.addressTitle}</h2>
            <p className="text-[#575757] leading-relaxed">{s.address}</p>
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
