import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { puckPages } from '@/drizzle/schema'
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

  const [row] = await db
    .select({ data: puckPages.data })
    .from(puckPages)
    .where(eq(puckPages.pageSlug, slug))
    .limit(1)

  return NextResponse.json(row?.data ?? EMPTY_DATA)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  if (!ALLOWED_SLUGS.has(slug)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const session = await auth()

  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Json
  try {
    body = await req.json() as Json
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  try {
    await db
      .insert(puckPages)
      .values({ pageSlug: slug, data: body, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: puckPages.pageSlug,
        set: { data: body, updatedAt: new Date() },
      })
  } catch (error) {
    console.error('puck_pages upsert error:', error)
    return NextResponse.json({ error: 'Nepavyko išsaugoti' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
