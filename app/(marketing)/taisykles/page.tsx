import type { Metadata } from 'next'
import { Nav } from '@/components/marketing/nav'
import { Footer } from '@/components/marketing/footer'
import { TAISYKLES_STRINGS } from '@/lib/strings'

export const metadata: Metadata = {
  title: TAISYKLES_STRINGS.pageTitle,
  description: TAISYKLES_STRINGS.pageDescription,
}

export default function TaisyklesPage() {
  const s = TAISYKLES_STRINGS

  return (
    <main className="bg-[#f7f7f5] flex flex-col items-center min-h-screen font-[family-name:var(--font-jakarta)]">
      <Nav />

      <div className="w-full max-w-[1332px] mx-auto px-4 py-10 md:py-14">
        <div className="max-w-3xl">
          <h1 className="font-bold text-[36px] md:text-[48px] leading-tight text-black mb-10">
            {s.heading}
          </h1>

          <section>
            <h2 className="font-bold text-[20px] text-black mt-8 mb-3">{s.generalTitle}</h2>
            <ul className="list-disc list-inside text-[#575757] leading-relaxed text-[15px] flex flex-col gap-1">
              {s.generalItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-[20px] text-black mt-8 mb-3">{s.securityTitle}</h2>
            <ul className="list-disc list-inside text-[#575757] leading-relaxed text-[15px] flex flex-col gap-1">
              {s.securityItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-[20px] text-black mt-8 mb-3">{s.childrenTitle}</h2>
            <p className="text-[#575757] leading-relaxed text-[15px]">{s.childrenBody}</p>
          </section>

          <section>
            <h2 className="font-bold text-[20px] text-black mt-8 mb-3">{s.petsTitle}</h2>
            <p className="text-[#575757] leading-relaxed text-[15px]">{s.petsBody}</p>
          </section>

          <section>
            <h2 className="font-bold text-[20px] text-black mt-8 mb-3">{s.liabilityTitle}</h2>
            <p className="text-[#575757] leading-relaxed text-[15px]">{s.liabilityBody}</p>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  )
}
