import { createAdminClient } from '@/lib/supabase/admin'
import { ComingSoonInfiniteMenu } from '@/components/marketing/coming-soon-infinite-menu'
import type { InfiniteMenuItem } from '@/components/marketing/infinite-menu'

type Tenant = { id: string; slug: string; store_name: string; logo_url: string; gallery_images: string[] | null }

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

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('tenants')
    .select('id, slug, store_name, logo_url, gallery_images')
    .not('logo_url', 'is', null)
    .order('store_name')

  const tenants = (data ?? []) as Tenant[]

  // Gallery/cover photo is the disc background; the logo is overlaid on top,
  // always contain-fit so it's never stretched.
  const items: InfiniteMenuItem[] = tenants.map((t) => ({
    image: t.gallery_images?.[0],
    logo: t.logo_url,
    link: `/parduotuves/${t.slug}`,
    title: t.store_name,
    description: ''
  }))

  return <ComingSoonInfiniteMenu items={items} redirectTo={sanitizeFrom(from)} />
}
