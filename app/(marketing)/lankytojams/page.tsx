import type { Metadata } from 'next'
import { Nav } from '@/components/marketing/nav'
import { Footer } from '@/components/marketing/footer'
import { LANKYTOJAMS_STRINGS } from '@/lib/strings'

export const metadata: Metadata = {
  title: LANKYTOJAMS_STRINGS.pageTitle,
  description: LANKYTOJAMS_STRINGS.pageDescription,
}

export default function LankytojamsPage() {
  const s = LANKYTOJAMS_STRINGS

  return (
    <main className="bg-[#f7f7f5] flex flex-col items-center min-h-screen font-[family-name:var(--font-jakarta)]">
      <Nav />

      <div className="w-full max-w-[1332px] mx-auto px-4 py-10 md:py-14 flex flex-col gap-12">
        <h1 className="font-bold text-[36px] md:text-[48px] leading-tight text-black">
          {s.heading}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Parking */}
          <section className="bg-white rounded-[24px] p-8 flex flex-col gap-4">
            <h2 className="font-bold text-[22px] text-black">{s.parkingTitle}</h2>
            <p className="text-[#575757] leading-relaxed">{s.parkingBody}</p>
          </section>

          {/* Amenities */}
          <section className="bg-white rounded-[24px] p-8 flex flex-col gap-4">
            <h2 className="font-bold text-[22px] text-black">{s.amenitiesTitle}</h2>
            <ul className="flex flex-col gap-2">
              {s.amenities.map((item) => (
                <li key={item} className="flex items-center gap-3 text-[#575757]">
                  <span className="size-2 rounded-full bg-black shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* How to get here */}
        <section className="bg-white rounded-[24px] p-8 flex flex-col gap-4">
          <h2 className="font-bold text-[22px] text-black">{s.accessTitle}</h2>
          <p className="text-[#575757] leading-relaxed">{s.accessPublicTransport}</p>
          <p className="text-[#575757] leading-relaxed">{s.accessByCar}</p>
        </section>

        {/* FAQ */}
        <section className="flex flex-col gap-6">
          <h2 className="font-bold text-[28px] text-black">{s.faqTitle}</h2>
          <div className="flex flex-col gap-4">
            {s.faqItems.map((item) => (
              <div key={item.question} className="bg-white rounded-[24px] p-8 flex flex-col gap-3">
                <p className="font-bold text-[18px] text-black">{item.question}</p>
                <p className="text-[#575757] leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </main>
  )
}
