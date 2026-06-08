import { Nav } from '@/components/marketing/nav'
import { Hero } from '@/components/marketing/hero'
import { QuickLinks } from '@/components/marketing/quick-links'
import { CategoriesSection } from '@/components/marketing/categories-section'
import { ActivitiesSection } from '@/components/marketing/activities-section'
import { PartnerLogos } from '@/components/marketing/partner-logos'
import { NewsSection } from '@/components/marketing/news-section'
import { SocialSection } from '@/components/marketing/social-section'
import { Footer } from '@/components/marketing/footer'
import { getPageContent, resolveHeroSlides } from '@/lib/page-content'
import { createClient } from '@/lib/supabase/server'
import { renderPuckBlock } from '@/lib/puck-render'
import type { Data } from '@measured/puck'

const DEFAULT_BLOCKS: Data['content'] = [
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
  const cms = await getPageContent('landing')
  const heroSlides = resolveHeroSlides(cms, [])

  const { data: puckRow } = await supabase
    .from('puck_pages')
    .select('data')
    .eq('page_slug', 'landing')
    .single()

  const puckData = puckRow?.data as Data | null
  const blocks =
    puckData?.content && puckData.content.length > 0
      ? puckData.content
      : DEFAULT_BLOCKS

  // Inject CMS hero slides into any Hero block from Puck
  const resolvedBlocks = blocks.map((block) => {
    if (block.type !== 'Hero') return block
    return {
      ...block,
      props: {
        ...block.props,
        slides: heroSlides.length ? heroSlides : undefined,
      },
    }
  })

  return (
    <main className="bg-[#f7f7f5] flex flex-col items-center min-h-screen font-[family-name:var(--font-jakarta)]">
      <Nav />
      {resolvedBlocks.map((block, i) => renderPuckBlock(block, i))}
      <Footer />
    </main>
  )
}
