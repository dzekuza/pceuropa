import { createAdminClient } from '@/lib/supabase/admin'
import { ArrowIcon } from './ui/arrow-icon'
import Link from 'next/link'

type Tenant = { id: string; store_name: string; logo_url: string }

function LogoCard({ tenant }: { tenant: Tenant | undefined }) {
  if (!tenant) return <div className="bg-white rounded-[20px]" />
  return (
    <Link
      href="/parduotuves"
      prefetch={false}
      className="bg-white rounded-[20px] flex items-center justify-center overflow-hidden transition-[transform,box-shadow] duration-150 hover:shadow-md active:scale-[0.97]"
    >
      <img
        src={tenant.logo_url}
        alt={tenant.store_name}
        className="h-16 w-auto max-w-[80%] object-contain"
      />
    </Link>
  )
}

function FeaturedCard({ tenant }: { tenant: Tenant | undefined }) {
  if (!tenant) return <div className="bg-white rounded-[20px] row-span-2" />
  return (
    <Link
      href="/parduotuves"
      prefetch={false}
      className="bg-white rounded-[20px] row-span-2 relative flex items-center justify-center overflow-hidden transition-[transform,box-shadow] duration-150 hover:shadow-md active:scale-[0.97]"
    >
      <img
        src={tenant.logo_url}
        alt={tenant.store_name}
        className="h-24 w-auto max-w-[70%] object-contain"
      />
      <span className="absolute top-3 right-3 bg-[#fdf567] rounded-full p-2.5 flex items-center justify-center">
        <ArrowIcon className="size-4" />
      </span>
    </Link>
  )
}

export async function PartnerLogos() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('tenants')
    .select('id, store_name, logo_url')
    .not('logo_url', 'is', null)
    .order('store_name')

  const tenants = (data ?? []) as Tenant[]

  const featuredIdx = tenants.findIndex((t) =>
    t.store_name.toLowerCase().includes('gym')
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
        <FeaturedCard tenant={featured} />
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
