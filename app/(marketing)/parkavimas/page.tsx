import type { Metadata } from 'next'
import { Nav } from '@/components/marketing/nav'
import { Footer } from '@/components/marketing/footer'
import { PARKAVIMAS_STRINGS } from '@/lib/strings'

export const metadata: Metadata = {
  title: PARKAVIMAS_STRINGS.pageTitle,
  description: PARKAVIMAS_STRINGS.pageDescription,
}

export default function ParkavimasPage() {
  const s = PARKAVIMAS_STRINGS

  return (
    <main className="bg-[#f7f7f5] flex flex-col items-center min-h-screen font-[family-name:var(--font-jakarta)]">
      <Nav />

      <div className="w-full max-w-[1332px] mx-auto px-4 py-10 md:py-14 flex flex-col gap-12">
        <h1 className="font-bold text-[36px] md:text-[48px] leading-tight text-black">
          {s.heading}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-white rounded-[24px] p-8 flex flex-col gap-4">
            <h2 className="font-bold text-[22px] text-black">{s.mainTitle}</h2>
            <p className="text-[#575757] leading-relaxed">{s.mainBody}</p>
          </section>

          <section className="bg-white rounded-[24px] p-8 flex flex-col gap-4">
            <h2 className="font-bold text-[22px] text-black">{s.evTitle}</h2>
            <p className="text-[#575757] leading-relaxed">{s.evBody}</p>
          </section>

          <section className="bg-white rounded-[24px] p-8 flex flex-col gap-4">
            <h2 className="font-bold text-[22px] text-black">{s.disabledTitle}</h2>
            <p className="text-[#575757] leading-relaxed">{s.disabledBody}</p>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  )
}
