import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { Json } from '@/types/database'

const ALLOWED_SLUGS = new Set([
  'landing', 'akcijos', 'dialogai', 'restoranai',
  'parduotuves', 'sportas', 'laisvalaikis', 'darbo-laikas', 'lankytojams',
  'naujienos', 'nuoma-reklama',
])

const EMPTY_DATA = { content: [], root: { props: {} }, zones: {} }

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  if (!ALLOWED_SLUGS.has(slug)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const supabase = await createClient()
  const { data } = await supabase
    .from('puck_pages')
    .select('data')
    .eq('page_slug', slug)
    .single()

  return NextResponse.json(data?.data ?? EMPTY_DATA)
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

  let body: Json
  try {
    body = await req.json() as Json
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { error } = await supabase.from('puck_pages').upsert(
    { page_slug: slug, data: body, updated_at: new Date().toISOString() },
    { onConflict: 'page_slug' }
  )

  if (error) {
    console.error('puck_pages upsert error:', error)
    return NextResponse.json({ error: 'Nepavyko išsaugoti' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
