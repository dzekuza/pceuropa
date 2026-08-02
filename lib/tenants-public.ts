// lib/tenants-public.ts — cached read of the public tenant directory.
// The marketing pages (parduotuves, restoranai, sportas, laisvalaikis,
// darbo-laikas, planas, dialogai) each queried tenants_public directly
// through the per-request cookie-bound Supabase client, which Next.js
// treats as fully dynamic — every page visit re-ran the query and
// re-served every tenant's logo/gallery image from Storage. unstable_cache
// decouples the read from per-request rendering so all seven pages share
// one cached result instead of hitting Postgres on every hit.
//
// Ported from the Supabase `tenants_public` view (a security-invoker view
// restricted to public-safe columns, backed by the `tenants_anon_public_select`
// RLS policy) to a direct Drizzle select of the same column subset. There is
// no anon/authenticated role distinction on the self-hosted Postgres
// connection this app uses, so the view's only remaining purpose — hiding
// non-public columns (user_id, login_password, company_code, rent_eur,
// space_m2, operator) from anonymous callers — is enforced here simply by
// never selecting those columns, same effect without the extra view layer.
import { unstable_cache } from 'next/cache'
import { asc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { tenants } from '@/drizzle/schema'
import type { Database } from '@/types/database'

export type PublicTenant = Database['public']['Views']['tenants_public']['Row']

export const TENANTS_PUBLIC_CACHE_TAG = 'tenants-public'

export const getPublicTenants = unstable_cache(
  async (): Promise<PublicTenant[]> => {
    const rows = await db
      .select({
        id: tenants.id,
        slug: tenants.slug,
        storeName: tenants.storeName,
        category: tenants.category,
        logoUrl: tenants.logoUrl,
        galleryImages: tenants.galleryImages,
        description: tenants.description,
        weekdayHours: tenants.weekdayHours,
        saturdayHours: tenants.saturdayHours,
        sundayHours: tenants.sundayHours,
      })
      .from(tenants)
      .orderBy(asc(tenants.storeName))

    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      store_name: row.storeName,
      category: row.category,
      logo_url: row.logoUrl,
      gallery_images: row.galleryImages,
      description: row.description,
      weekday_hours: row.weekdayHours,
      saturday_hours: row.saturdayHours,
      sunday_hours: row.sundayHours,
    }))
  },
  ['tenants-public-directory'],
  { revalidate: 300, tags: [TENANTS_PUBLIC_CACHE_TAG] }
)

export async function getPublicTenantBySlug(slug: string): Promise<PublicTenant | null> {
  const tenants = await getPublicTenants()
  return tenants.find((t) => t.slug === slug) ?? null
}
