import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { puckPages, pageSections } from '@/drizzle/schema'

/** Returns banner slides from the Puck PageBanner block for a page, with fallback to defaults. */
export async function getPuckBannerSlides(
  slug: string,
  defaults: string[],
): Promise<string[]> {
  const [row] = await db
    .select({ data: puckPages.data })
    .from(puckPages)
    .where(eq(puckPages.pageSlug, slug))
    .limit(1)

  if (!row?.data) return defaults

  const puckData = row.data as { content?: Array<{ type: string; props?: Record<string, unknown> }> }
  const bannerBlock = puckData.content?.find((b) => b.type === 'PageBanner')
  if (!bannerBlock) return defaults

  const p = bannerBlock.props ?? {}
  return [p.slide1, p.slide2, p.slide3, p.slide4].filter(Boolean) as string[]
}

/** Returns a Puck block's saved props for a page/type, shallow-merged over defaults (empty/missing values keep the default). */
export async function getPuckBlockProps<T extends Record<string, unknown>>(
  slug: string,
  blockType: string,
  defaults: T,
): Promise<T> {
  const [row] = await db
    .select({ data: puckPages.data })
    .from(puckPages)
    .where(eq(puckPages.pageSlug, slug))
    .limit(1)

  const puckData = row?.data as { content?: Array<{ type: string; props?: Record<string, unknown> }> } | undefined
  const block = puckData?.content?.find((b) => b.type === blockType)
  if (!block?.props) return defaults

  const merged: Record<string, unknown> = { ...defaults }
  for (const key of Object.keys(defaults)) {
    const value = block.props[key]
    const isEmpty = value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)
    if (!isEmpty) merged[key] = value
  }
  return merged as T
}

export type CmsSections = Record<string, Record<string, string>>

export async function getPageContent(slug: string): Promise<CmsSections> {
  const rows = await db
    .select({
      sectionKey: pageSections.sectionKey,
      contentKey: pageSections.contentKey,
      value: pageSections.value,
    })
    .from(pageSections)
    .where(eq(pageSections.pageSlug, slug))

  const sections: CmsSections = {}
  for (const row of rows) {
    if (!sections[row.sectionKey]) sections[row.sectionKey] = {}
    sections[row.sectionKey][row.contentKey] = row.value ?? ''
  }
  return sections
}

/** Returns CMS banner slides (slide_1…slide_N) with fallback to hardcoded defaults. */
export function resolveBannerSlides(
  sections: CmsSections,
  defaults: string[],
  max = 6,
): string[] {
  const banner = sections.banner ?? {}
  const cms: string[] = []
  for (let i = 1; i <= max; i++) {
    const url = banner[`slide_${i}`]
    if (url) cms.push(url)
  }
  return cms.length ? cms : defaults
}

/** Returns CMS hero slides (slide_1…slide_N) with fallback to hardcoded defaults. */
export function resolveHeroSlides(
  sections: CmsSections,
  defaults: Array<{ src: string; alt: string }>,
): Array<{ src: string; alt: string }> {
  const hero = sections.hero ?? {}
  const cms: Array<{ src: string; alt: string }> = []
  for (let i = 1; i <= defaults.length + 2; i++) {
    const url = hero[`slide_${i}`]
    if (url) cms.push({ src: url, alt: `PC Europa — ${i}` })
  }
  return cms.length ? cms : defaults
}
