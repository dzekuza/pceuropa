import type { Metadata } from 'next'
import Link from 'next/link'
import { Nav } from '@/components/marketing/nav'
import { Footer } from '@/components/marketing/footer'
import { PRIVATUMO_POLITIKA_STRINGS } from '@/lib/strings'

export const metadata: Metadata = {
  title: PRIVATUMO_POLITIKA_STRINGS.pageTitle,
  description: PRIVATUMO_POLITIKA_STRINGS.pageDescription,
}

export default function PrivatumoPoliitkaPage() {
  const s = PRIVATUMO_POLITIKA_STRINGS

  return (
    <main className="bg-[#f7f7f5] flex flex-col items-center min-h-screen font-[family-name:var(--font-jakarta)]">
      <Nav />

      <div className="w-full max-w-[1332px] mx-auto px-4 py-10 md:py-14">
        <div className="max-w-3xl">
          <h1 className="font-bold text-[36px] md:text-[48px] leading-tight text-black mb-10">
            {s.heading}
          </h1>

          <section>
            <h2 className="font-bold text-[20px] text-black mt-8 mb-3">{s.controllerTitle}</h2>
            <p className="text-[#575757] leading-relaxed text-[15px]">{s.controllerBody}</p>
          </section>

          <section>
            <h2 className="font-bold text-[20px] text-black mt-8 mb-3">{s.collectedTitle}</h2>
            <ul className="list-disc list-inside text-[#575757] leading-relaxed text-[15px] flex flex-col gap-1">
              {s.collectedItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-[20px] text-black mt-8 mb-3">{s.usageTitle}</h2>
            <ul className="list-disc list-inside text-[#575757] leading-relaxed text-[15px] flex flex-col gap-1">
              {s.usageItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-[20px] text-black mt-8 mb-3">{s.retentionTitle}</h2>
            <p className="text-[#575757] leading-relaxed text-[15px]">{s.retentionBody}</p>
          </section>

          <section>
            <h2 className="font-bold text-[20px] text-black mt-8 mb-3">{s.rightsTitle}</h2>
            <ul className="list-disc list-inside text-[#575757] leading-relaxed text-[15px] flex flex-col gap-1">
              {s.rightsItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="text-[#575757] leading-relaxed text-[15px] mt-3">{s.rightsContact}</p>
          </section>

          <section>
            <h2 className="font-bold text-[20px] text-black mt-8 mb-3">{s.cookiesTitle}</h2>
            <p className="text-[#575757] leading-relaxed text-[15px]">
              {s.cookiesBody}
              <Link href={s.cookiesLinkHref} className="underline hover:text-black transition-colors">
                {s.cookiesLinkText}
              </Link>
              .
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  )
}
