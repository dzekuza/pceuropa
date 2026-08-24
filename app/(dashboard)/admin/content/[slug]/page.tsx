import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ContentEditor } from '@/components/admin/content-editor'
import { ALLOWED_SLUGS, DEFAULT_DATA, FALLBACK_DATA, PREVIEW_URLS, type ContentBlock, type ContentData } from '@/lib/content-sections'

interface Props {
  params: Promise<{ slug: string }>
}

// Section order/membership always follows DEFAULT_DATA (blocks aren't reorderable in
// this editor) — saved props are substituted in per type so newly added default
// sections (e.g. a block added after a page was first saved) still show up.
function mergeWithDefaults(saved: ContentBlock[], defaults: ContentBlock[]): ContentBlock[] {
  const savedByType = new Map(saved.map((block) => [block.type, block]))
  return defaults.map((defaultBlock) => savedByType.get(defaultBlock.type) ?? defaultBlock)
}

export default async function AdminContentEditPage({ params }: Props) {
  const { slug } = await params

  if (!ALLOWED_SLUGS.has(slug)) notFound()

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.app_metadata?.role !== 'admin') {
    redirect('/login')
  }

  const { data } = await supabase
    .from('puck_pages')
    .select('data')
    .eq('page_slug', slug)
    .single()

  const localized = data?.data as unknown as Partial<Record<'lt' | 'en', ContentData>> | null
  const defaults = DEFAULT_DATA[slug] ?? FALLBACK_DATA

  const contentByLocale: Record<'lt' | 'en', ContentBlock[]> = {
    lt: localized?.lt ? mergeWithDefaults(localized.lt.content, defaults.content) : defaults.content,
    en: localized?.en ? mergeWithDefaults(localized.en.content, defaults.content) : defaults.content,
  }

  return (
    <ContentEditor
      contentByLocale={contentByLocale}
      pageSlug={slug}
      previewUrl={PREVIEW_URLS[slug]}
    />
  )
}
