import { unstable_cache } from 'next/cache'
import { createClient as createAnonClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type PuckContent = { content?: Array<{ type: string; props?: Record<string, unknown> }> }
type Locale = 'lt' | 'en'
type PuckPageRow = Partial<Record<Locale, PuckContent>>

export const PUCK_PAGES_CACHE_TAG = 'puck-pages'

/** Cached read of a Puck page's saved JSON, nested per locale as { lt: {...}, en: {...} }.
 * Public content — read via the plain anon client (not the cookie-bound one) so all
 * pages/requests share one cache entry per slug instead of each hitting Postgres
 * individually. Invalidated by revalidateTag on save. */
const getPuckPageRow = unstable_cache(
  async (slug: string): Promise<PuckPageRow | null> => {
    const supabase = createAnonClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data } = await supabase
      .from('puck_pages')
      .select('data')
      .eq('page_slug', slug)
      .single()

    return (data?.data as PuckPageRow | null) ?? null
  },
  ['puck-page-data'],
  { revalidate: 300, tags: [PUCK_PAGES_CACHE_TAG] }
)

function normalizeLocale(locale: string): Locale {
  return locale === 'en' ? 'en' : 'lt'
}

async function getPuckPageData(slug: string, locale: string): Promise<PuckContent | null> {
  const row = await getPuckPageRow(slug)
  return row?.[normalizeLocale(locale)] ?? row?.lt ?? null
}

/** Returns banner slides from the Puck PageBanner block for a page, with fallback to defaults. */
export async function getPuckBannerSlides(
  slug: string,
  defaults: string[],
  locale: string = 'lt',
): Promise<string[]> {
  const puckData = await getPuckPageData(slug, locale)
  const bannerBlock = puckData?.content?.find((b) => b.type === 'PageBanner')
  if (!bannerBlock) return defaults

  const p = bannerBlock.props ?? {}
  return [p.slide1, p.slide2, p.slide3, p.slide4].filter(Boolean) as string[]
}

/** Returns a Puck block's saved props for a page/type, shallow-merged over defaults (empty/missing values keep the default). */
export async function getPuckBlockProps<T extends Record<string, unknown>>(
  slug: string,
  blockType: string,
  defaults: T,
  locale: string = 'lt',
): Promise<T> {
  const puckData = await getPuckPageData(slug, locale)
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

export async function getPageContent(slug: string, locale: string = 'lt'): Promise<CmsSections> {
  const supabase = createAnonClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data } = await supabase
    .from('page_sections')
    .select('section_key, content_key, value')
    .eq('page_slug', slug)
    .eq('locale', normalizeLocale(locale))

  const sections: CmsSections = {}
  for (const row of data ?? []) {
    if (!sections[row.section_key]) sections[row.section_key] = {}
    sections[row.section_key][row.content_key] = row.value ?? ''
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
