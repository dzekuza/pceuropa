// app/(dashboard)/admin/articles/akcijos/[id]/edit/page.tsx — Edit promo editor
// Server Component — Defense-in-depth auth check (middleware alone is not sufficient)
// CVE-2025-29927: middleware can be bypassed via x-middleware-subrequest header
export const dynamic = 'force-dynamic'

import { notFound, redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { promos } from '@/drizzle/schema'
import { PromoForm } from '@/components/promos/promo-form'
import type { Promo } from '@/types/database'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPromoPage({ params }: Props) {
  const { id } = await params
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') redirect('/login')

  const [row] = await db.select().from(promos).where(eq(promos.id, id)).limit(1)

  if (!row) notFound()

  const promo: Promo = {
    id: row.id,
    title: row.title,
    slug: row.slug,
    image: row.image,
    starts_at: row.startsAt,
    ends_at: row.endsAt,
    category: row.category as Promo['category'],
    published: row.published,
    content: row.content,
    created_at: row.createdAt ? row.createdAt.toISOString() : null,
    updated_at: row.updatedAt ? row.updatedAt.toISOString() : null,
  }

  return <PromoForm promo={promo} />
}
