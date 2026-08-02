import { isNotNull, asc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { tenants } from '@/drizzle/schema'
import { ComingSoonInfiniteMenu } from '@/components/marketing/coming-soon-infinite-menu'
import type { InfiniteMenuItem } from '@/components/marketing/infinite-menu'

function sanitizeFrom(from: string | undefined): string {
  if (!from || !from.startsWith('/') || from.startsWith('//')) return '/'
  return from
}

export default async function UnderConstructionPage({
  searchParams
}: {
  searchParams: Promise<{ from?: string }>
}) {
  const { from } = await searchParams

  const rows = await db
    .select({
      id: tenants.id,
      slug: tenants.slug,
      storeName: tenants.storeName,
      logoUrl: tenants.logoUrl,
      galleryImages: tenants.galleryImages,
    })
    .from(tenants)
    .where(isNotNull(tenants.logoUrl))
    .orderBy(asc(tenants.storeName))

  // Gallery/cover photo is the disc background; the logo is overlaid on top,
  // always contain-fit so it's never stretched.
  const items: InfiniteMenuItem[] = rows.map((t) => ({
    image: t.galleryImages?.[0],
    logo: t.logoUrl ?? undefined,
    link: `/parduotuves/${t.slug}`,
    title: t.storeName,
    description: ''
  }))

  return <ComingSoonInfiniteMenu items={items} redirectTo={sanitizeFrom(from)} />
}
