import type { Metadata } from 'next'
import { Nav } from '@/components/marketing/nav'
import { Footer } from '@/components/marketing/footer'
import { SLAPUKU_POLITIKA_STRINGS } from '@/lib/strings'

export const metadata: Metadata = {
  title: SLAPUKU_POLITIKA_STRINGS.pageTitle,
  description: SLAPUKU_POLITIKA_STRINGS.pageDescription,
}

export default function SlapukuPolitikaPage() {
  const s = SLAPUKU_POLITIKA_STRINGS

  return (
    <main className="bg-[#f7f7f5] flex flex-col items-center min-h-screen font-[family-name:var(--font-jakarta)]">
      <Nav />

      <div className="w-full max-w-[1332px] mx-auto px-4 py-10 md:py-14">
        <div className="max-w-3xl">
          <h1 className="font-bold text-[36px] md:text-[48px] leading-tight text-black mb-10">
            {s.heading}
          </h1>

          <section>
            <h2 className="font-bold text-[20px] text-black mt-8 mb-3">{s.whatTitle}</h2>
            <p className="text-[#575757] leading-relaxed text-[15px]">{s.whatBody}</p>
          </section>

          <section>
            <h2 className="font-bold text-[20px] text-black mt-8 mb-3">{s.typesTitle}</h2>

            <p className="font-bold text-[15px] text-black mt-4 mb-1">{s.necessaryLabel}</p>
            <p className="text-[#575757] leading-relaxed text-[15px]">{s.necessaryBody}</p>

            <p className="font-bold text-[15px] text-black mt-4 mb-1">{s.analyticsLabel}</p>
            <p className="text-[#575757] leading-relaxed text-[15px]">{s.analyticsBody}</p>

            <p className="font-bold text-[15px] text-black mt-4 mb-1">{s.marketingLabel}</p>
            <p className="text-[#575757] leading-relaxed text-[15px]">{s.marketingBody}</p>
          </section>

          <section>
            <h2 className="font-bold text-[20px] text-black mt-8 mb-3">{s.controlTitle}</h2>
            <p className="text-[#575757] leading-relaxed text-[15px]">{s.controlBody}</p>
          </section>

          <section>
            <h2 className="font-bold text-[20px] text-black mt-8 mb-3">{s.contactTitle}</h2>
            <p className="text-[#575757] leading-relaxed text-[15px]">{s.contactBody}</p>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  )
}
