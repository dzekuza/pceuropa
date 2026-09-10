import type { Metadata } from 'next'
import { getTranslations, getLocale } from 'next-intl/server'
import { Nav } from '@/components/marketing/nav'
import { Footer } from '@/components/marketing/footer'
import { getPuckBlockProps } from '@/lib/page-content'
import { listToHtml, toRichListValue } from '@/lib/content-sections'
import { sanitizeRichText } from '@/lib/utils/sanitize-rich-text'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('taisykles')
  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
  }
}

export default async function TaisyklesPage() {
  const t = await getTranslations('taisykles')

  const DEFAULT_TAISYKLES_BLOCK = {
    heading: t('heading'),
    generalTitle: t('generalTitle'),
    generalItems: listToHtml(t.raw('generalItems') as string[]),
    securityTitle: t('securityTitle'),
    securityItems: listToHtml(t.raw('securityItems') as string[]),
    childrenTitle: t('childrenTitle'),
    childrenBody: t('childrenBody'),
    petsTitle: t('petsTitle'),
    petsBody: t('petsBody'),
    liabilityTitle: t('liabilityTitle'),
    liabilityBody: t('liabilityBody'),
  }

  const locale = await getLocale()
  const s = await getPuckBlockProps('taisykles', 'TaisyklesBlock', DEFAULT_TAISYKLES_BLOCK, locale)

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
            <div
              className="text-[#575757] leading-relaxed text-[15px] [&_ul]:list-disc [&_ul]:list-inside [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1 [&_ol]:list-decimal [&_ol]:list-inside [&_ol]:flex [&_ol]:flex-col [&_ol]:gap-1"
              dangerouslySetInnerHTML={{ __html: sanitizeRichText(toRichListValue(s.generalItems)) }}
            />
          </section>

          <section>
            <h2 className="font-bold text-[20px] text-black mt-8 mb-3">{s.securityTitle}</h2>
            <div
              className="text-[#575757] leading-relaxed text-[15px] [&_ul]:list-disc [&_ul]:list-inside [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1 [&_ol]:list-decimal [&_ol]:list-inside [&_ol]:flex [&_ol]:flex-col [&_ol]:gap-1"
              dangerouslySetInnerHTML={{ __html: sanitizeRichText(toRichListValue(s.securityItems)) }}
            />
          </section>

          <section>
            <h2 className="font-bold text-[20px] text-black mt-8 mb-3">{s.childrenTitle}</h2>
            <p className="text-[#575757] leading-relaxed text-[15px] whitespace-pre-line">{s.childrenBody}</p>
          </section>

          <section>
            <h2 className="font-bold text-[20px] text-black mt-8 mb-3">{s.petsTitle}</h2>
            <p className="text-[#575757] leading-relaxed text-[15px] whitespace-pre-line">{s.petsBody}</p>
          </section>

          <section>
            <h2 className="font-bold text-[20px] text-black mt-8 mb-3">{s.liabilityTitle}</h2>
            <p className="text-[#575757] leading-relaxed text-[15px] whitespace-pre-line">{s.liabilityBody}</p>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  )
}
