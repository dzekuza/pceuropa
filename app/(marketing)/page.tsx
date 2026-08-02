import { eq } from 'drizzle-orm'
import { Nav } from '@/components/marketing/nav'
import { Footer } from '@/components/marketing/footer'
import { db } from '@/lib/db'
import { puckPages } from '@/drizzle/schema'
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

// force-dynamic — Docker builds have no DATABASE_URL reachable at build
// time, so this page can't be pre-rendered; it must render per-request
// against the running container's DB instead.
export const dynamic = 'force-dynamic'

export default async function LandingPage() {
  const [puckRow] = await db
    .select({ data: puckPages.data })
    .from(puckPages)
    .where(eq(puckPages.pageSlug, 'landing'))
    .limit(1)

  const puckData = puckRow?.data as Data | null
  const blocks =
    puckData?.content && puckData.content.length > 0
      ? puckData.content
      : DEFAULT_BLOCKS

  return (
    <main className="bg-[#f7f7f5] flex flex-col items-center min-h-screen font-[family-name:var(--font-jakarta)]">
      <Nav />
      {blocks.map((block, i) => renderPuckBlock(block, i))}
      <Footer />
    </main>
  )
}
