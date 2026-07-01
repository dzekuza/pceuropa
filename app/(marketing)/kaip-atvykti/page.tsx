import type { Metadata } from 'next'
import { Nav } from '@/components/marketing/nav'
import { Footer } from '@/components/marketing/footer'
import { KAIP_ATVYKTI_STRINGS } from '@/lib/strings'

export const metadata: Metadata = {
  title: KAIP_ATVYKTI_STRINGS.pageTitle,
  description: KAIP_ATVYKTI_STRINGS.pageDescription,
}

export default function KaipAtvyktiPage() {
  const s = KAIP_ATVYKTI_STRINGS

  return (
    <main className="bg-[#f7f7f5] flex flex-col items-center min-h-screen font-[family-name:var(--font-jakarta)]">
      <Nav />

      <div className="w-full max-w-[1332px] mx-auto px-4 py-10 md:py-14 flex flex-col gap-12">
        <h1 className="font-bold text-[36px] md:text-[48px] leading-tight text-black">
          {s.heading}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Public transport */}
          <section className="bg-white rounded-[24px] p-8 flex flex-col gap-4">
            <h2 className="font-bold text-[22px] text-black">{s.publicTransportTitle}</h2>
            <p className="text-[#575757] leading-relaxed">{s.publicTransport}</p>
          </section>

          {/* By car */}
          <section className="bg-white rounded-[24px] p-8 flex flex-col gap-4">
            <h2 className="font-bold text-[22px] text-black">{s.byCarTitle}</h2>
            <p className="text-[#575757] leading-relaxed">{s.byCar}</p>
          </section>

          {/* Address */}
          <section className="bg-white rounded-[24px] p-8 flex flex-col gap-4 md:col-span-2">
            <h2 className="font-bold text-[22px] text-black">{s.addressTitle}</h2>
            <p className="text-[#575757] leading-relaxed font-medium">{s.address}</p>
            <p className="text-[#575757] leading-relaxed">{s.addressNote}</p>
          </section>
        </div>

        {/* Map */}
        <div className="rounded-[24px] overflow-hidden h-[400px] md:h-[500px]">
          <iframe
            src="https://maps.google.com/maps?q=Europa,+Konstitucijos+pr.+7A,+Vilnius,+09308&t=&z=15&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="100%"
            className="border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={s.mapLabel}
          />
        </div>
      </div>

      <Footer />
    </main>
  )
}
