import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Nav } from '@/components/marketing/nav'
import { Footer } from '@/components/marketing/footer'
import { PROMO_ITEMS } from '@/lib/promo-data'
import { ArrowIcon } from '@/components/marketing/ui/arrow-icon'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return PROMO_ITEMS.map((item) => ({ slug: item.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const item = PROMO_ITEMS.find((p) => p.id === slug)
  if (!item) return {}
  return {
    title: `${item.title} — PC Europa`,
    description: item.date,
  }
}

export default async function PromoDetailPage({ params }: Props) {
  const { slug } = await params
  const item = PROMO_ITEMS.find((p) => p.id === slug)
  if (!item) notFound()

  return (
    <main className="bg-[#f7f7f5] flex flex-col items-center min-h-screen font-[family-name:var(--font-jakarta)]">
      <Nav />

      <section className="w-full max-w-[1332px] mx-auto px-4 py-10 md:py-14 flex flex-col gap-8">
        <Link
          href="/akcijos"
          className="inline-flex items-center gap-2 text-sm text-[#575757] hover:text-black transition-colors w-fit"
        >
          <ArrowIcon className="size-4 rotate-180" />
          Visos akcijos
        </Link>

        <div className="relative w-full max-h-[480px] rounded-[32px] lg:rounded-[40px] overflow-hidden">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-[480px] object-cover"
          />
        </div>

        <div className="flex flex-col gap-3 max-w-2xl">
          <p className="text-[#575757] text-base">{item.date}</p>
          <h1 className="font-bold text-[32px] leading-[40px] text-black">{item.title}</h1>
        </div>
      </section>

      <Footer />
    </main>
  )
}
