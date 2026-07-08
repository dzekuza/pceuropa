import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import sanitizeHtml from 'sanitize-html'
import { Nav } from '@/components/marketing/nav'
import { Footer } from '@/components/marketing/footer'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatPromoDateRange } from '@/lib/utils/format-promo-date'
import { ArrowIcon } from '@/components/marketing/ui/arrow-icon'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const supabase = createAdminClient()
  const { data: promos } = await supabase.from('promos').select('slug').eq('published', true)
  return (promos ?? []).map((p) => ({ slug: p.slug }))
}

async function getPromo(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('promos')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()
  return data
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const item = await getPromo(slug)
  if (!item) return {}
  const description = item.content
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160)
  return {
    title: `${item.title} — PC Europa`,
    description: description || formatPromoDateRange(item.starts_at, item.ends_at),
  }
}

export default async function PromoDetailPage({ params }: Props) {
  const { slug } = await params
  const item = await getPromo(slug)
  if (!item) notFound()

  const safeHtml = sanitizeHtml(item.content ?? '', {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt'],
    },
  })

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

        <div className="relative w-full max-h-[480px] rounded-[32px] lg:rounded-[40px] overflow-hidden bg-muted">
          {item.image && (
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-[480px] object-cover"
            />
          )}
        </div>

        <div className="flex flex-col gap-3 max-w-2xl">
          <p className="text-[#575757] text-base">{formatPromoDateRange(item.starts_at, item.ends_at)}</p>
          <h1 className="font-bold text-[32px] leading-[40px] text-black">{item.title}</h1>
        </div>

        {safeHtml && (
          <div
            className="prose prose-lg max-w-2xl text-black"
            dangerouslySetInnerHTML={{ __html: safeHtml }}
          />
        )}
      </section>

      <Footer />
    </main>
  )
}
