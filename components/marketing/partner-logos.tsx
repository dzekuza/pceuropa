import { createAdminClient } from '@/lib/supabase/admin'
import { LogoCard } from './logo-card'
import Link from 'next/link'

type Tenant = { id: string; store_name: string; logo_url: string }

export async function PartnerLogos() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('tenants')
    .select('id, store_name, logo_url')
    .not('logo_url', 'is', null)
    .order('store_name')

  const tenants = (data ?? []) as Tenant[]

  const featuredIdx = tenants.findIndex((t) =>
    t.store_name.toLowerCase().includes('lemon gym')
  )
  const featured = tenants[featuredIdx >= 0 ? featuredIdx : 0]
  const rest = tenants.filter((t) => t.id !== featured?.id).slice(0, 8)

  return (
    <section className="w-full max-w-[1332px] mx-auto px-4 py-4 lg:py-6">
      {/* Desktop — 5-col grid, featured center spans 2 rows */}
      <div className="hidden lg:grid grid-cols-5 grid-rows-2 gap-3 h-[220px]">
        {/* Cols 1-2, rows auto-fill around featured */}
        <LogoCard tenant={rest[0]} />
        <LogoCard tenant={rest[1]} />
        {/* Featured — col 3, row-span-2 (explicit) */}
        <LogoCard tenant={featured} featured />
        {/* Cols 4-5 row 1 */}
        <LogoCard tenant={rest[2]} />
        <LogoCard tenant={rest[3]} />
        {/* Cols 1-2 row 2 */}
        <LogoCard tenant={rest[4]} />
        <LogoCard tenant={rest[5]} />
        {/* Cols 4-5 row 2 */}
        <LogoCard tenant={rest[6]} />
        <LogoCard tenant={rest[7]} />
      </div>

      {/* Mobile / tablet — horizontal scroll */}
      <div className="lg:hidden overflow-x-auto scrollbar-hide">
        <div className="flex gap-3 w-max">
          {tenants.slice(0, 12).map((t) => (
            <Link
              key={t.id}
              href="/parduotuves"
      prefetch={false}
              className="bg-white rounded-[16px] flex items-center justify-center h-[90px] w-[140px] shrink-0 overflow-hidden"
            >
              <img
                src={t.logo_url}
                alt={t.store_name}
                className="h-12 w-auto max-w-[75%] object-contain"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
