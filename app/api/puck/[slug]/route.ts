import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { PUCK_PAGES_CACHE_TAG } from '@/lib/page-content'
import type { Json } from '@/types/database'

const ALLOWED_SLUGS = new Set([
  'landing', 'akcijos', 'dialogai', 'restoranai',
  'parduotuves', 'sportas', 'laisvalaikis', 'darbo-laikas', 'lankytojams',
  'naujienos', 'nuoma-reklama', 'kontaktai', 'kaip-atvykti', 'parkavimas',
])

const EMPTY_DATA = { content: [], root: { props: {} }, zones: {} }
const LOCALES = new Set(['lt', 'en'])

function resolveLocale(req: NextRequest): 'lt' | 'en' {
  const locale = req.nextUrl.searchParams.get('locale')
  return locale && LOCALES.has(locale) ? (locale as 'lt' | 'en') : 'lt'
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  if (!ALLOWED_SLUGS.has(slug)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const locale = resolveLocale(req)
  const supabase = await createClient()
  const { data } = await supabase
    .from('puck_pages')
    .select('data')
    .eq('page_slug', slug)
    .single()

  const localized = data?.data as Partial<Record<'lt' | 'en', Json>> | null | undefined
  return NextResponse.json(localized?.[locale] ?? localized?.lt ?? EMPTY_DATA)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  if (!ALLOWED_SLUGS.has(slug)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const locale = resolveLocale(req)

  let body: Json
  try {
    body = await req.json() as Json
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from('puck_pages')
    .select('data')
    .eq('page_slug', slug)
    .single()

  const existingLocalized = (existing?.data as Partial<Record<'lt' | 'en', Json>> | null) ?? {}
  const merged = { ...existingLocalized, [locale]: body }

  const { error } = await supabase.from('puck_pages').upsert(
    { page_slug: slug, data: merged, updated_at: new Date().toISOString() },
    { onConflict: 'page_slug' }
  )

  if (error) {
    console.error('puck_pages upsert error:', error)
    return NextResponse.json({ error: 'Nepavyko išsaugoti' }, { status: 500 })
  }

  revalidateTag(PUCK_PAGES_CACHE_TAG, 'max')

  return NextResponse.json({ ok: true })
}
