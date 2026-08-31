import { Nav } from '@/components/marketing/nav'
import { Footer } from '@/components/marketing/footer'
import { createClient } from '@/lib/supabase/server'
import { renderPuckBlock } from '@/lib/puck-render'
import { formatPromoDateRange } from '@/lib/utils/format-promo-date'
import { getLocale } from 'next-intl/server'
import type { ContentBlock, ContentData } from '@/lib/content-sections'
import type { NewsSectionItem } from '@/components/marketing/news-section'

type LocalizedPuckData = Partial<Record<'lt' | 'en', ContentData>>

const DEFAULT_BLOCKS: ContentBlock[] = [
  { type: 'Hero', props: { id: 'default-hero', title: '', subtitle: '' } },
  { type: 'QuickLinks', props: { id: 'default-quicklinks' } },
  { type: 'CategoriesSection', props: { id: 'default-categories' } },
  { type: 'ActivitiesSection', props: { id: 'default-activities' } },
  { type: 'PartnerLogos', props: { id: 'default-partners' } },
  { type: 'NewsSection', props: { id: 'default-news' } },
  { type: 'SocialSection', props: { id: 'default-social' } },
]

export default async function LandingPage() {
  const locale = await getLocale()
  const supabase = await createClient()

  const [{ data: puckRow }, { data: promos }] = await Promise.all([
    supabase.from('puck_pages').select('data').eq('page_slug', 'landing').single(),
    supabase
      .from('promos')
      .select('slug, image, title, title_en, starts_at, ends_at')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(4),
  ])

  const newsItems: NewsSectionItem[] = (promos ?? [])
    .filter((p): p is typeof p & { image: string } => Boolean(p.image))
    .map((p) => ({
      image: p.image,
      title: locale === 'en' ? (p.title_en || p.title) : p.title,
      date: formatPromoDateRange(p.starts_at, p.ends_at, locale),
      href: `/akcijos/${p.slug}`,
    }))

  const localized = puckRow?.data as unknown as LocalizedPuckData | null
  const puckData = localized?.[locale as 'lt' | 'en'] ?? localized?.lt ?? null
  const blocks = (
    puckData?.content && puckData.content.length > 0 ? puckData.content : DEFAULT_BLOCKS
  ).map((block) =>
    block.type === 'NewsSection'
      ? { ...block, props: { ...block.props, items: newsItems } }
      : block
  )

  return (
    <main className="bg-[#f7f7f5] flex flex-col items-center min-h-screen font-[family-name:var(--font-jakarta)]">
      <Nav />
      {blocks.map((block, i) => renderPuckBlock(block, i))}
      <Footer />
    </main>
  )
}
