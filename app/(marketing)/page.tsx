import { Nav } from '@/components/marketing/nav'
import { Footer } from '@/components/marketing/footer'
import { createClient } from '@/lib/supabase/server'
import { renderPuckBlock } from '@/lib/puck-render'
import { formatPromoDateRange } from '@/lib/utils/format-promo-date'
import type { ContentBlock, ContentData } from '@/lib/content-sections'
import type { NewsSectionItem } from '@/components/marketing/news-section'

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
  const supabase = await createClient()

  const [{ data: puckRow }, { data: promos }] = await Promise.all([
    supabase.from('puck_pages').select('data').eq('page_slug', 'landing').single(),
    supabase
      .from('promos')
      .select('slug, image, title, starts_at, ends_at')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(4),
  ])

  const newsItems: NewsSectionItem[] = (promos ?? [])
    .filter((p): p is typeof p & { image: string } => Boolean(p.image))
    .map((p) => ({
      image: p.image,
      title: p.title,
      date: formatPromoDateRange(p.starts_at, p.ends_at),
      href: `/akcijos/${p.slug}`,
    }))

  const puckData = puckRow?.data as unknown as ContentData | null
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
