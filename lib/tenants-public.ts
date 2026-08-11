// lib/tenants-public.ts — cached read of the public tenant directory.
// The marketing pages (parduotuves, restoranai, sportas, laisvalaikis,
// darbo-laikas, planas, dialogai) each queried tenants_public directly
// through the per-request cookie-bound Supabase client, which Next.js
// treats as fully dynamic — every page visit re-ran the query and
// re-served every tenant's logo/gallery image from Storage. unstable_cache
// decouples the read from per-request rendering so all seven pages share
// one cached result instead of hitting Postgres and Storage on every hit.
import { unstable_cache } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export type PublicTenant = Database['public']['Views']['tenants_public']['Row']

export const TENANTS_PUBLIC_CACHE_TAG = 'tenants-public'

export const getPublicTenants = unstable_cache(
  async (): Promise<PublicTenant[]> => {
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data } = await supabase
      .from('tenants_public')
      .select('id, slug, store_name, category, logo_url, gallery_images, description, weekday_hours, saturday_hours, sunday_hours, contact_phone, website_url')
      .order('store_name', { ascending: true })
    return data ?? []
  },
  ['tenants-public-directory'],
  { revalidate: 300, tags: [TENANTS_PUBLIC_CACHE_TAG] }
)

export async function getPublicTenantBySlug(slug: string): Promise<PublicTenant | null> {
  const tenants = await getPublicTenants()
  return tenants.find((t) => t.slug === slug) ?? null
}
