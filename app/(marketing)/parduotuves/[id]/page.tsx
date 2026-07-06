import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Nav } from '@/components/marketing/nav'
import { Footer } from '@/components/marketing/footer'
import { ArrowIcon } from '@/components/marketing/ui/arrow-icon'
import { StoreGallery } from '@/components/marketing/store-gallery'
import { createClient } from '@/lib/supabase/server'
import { resizeSupabaseImage } from '@/lib/utils/supabase-image'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('tenants_public')
    .select('store_name, category')
    .eq('id', id)
    .maybeSingle()

  if (!data) return {}
  return {
    title: `${data.store_name} — PC Europa`,
    description: `${data.store_name} (${data.category ?? 'Parduotuvė'}) PC Europa prekybos centras`,
  }
}

const HOURS = [
  { days: 'I–V', hours: '10:00–21:00' },
  { days: 'VI', hours: '10:00–20:00' },
  { days: 'VII', hours: '10:00–20:00' },
]

function isOpen(): boolean {
  const now = new Date()
  const tz = 'Europe/Vilnius'

  const vilniusHour = parseInt(
    new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', hour12: false }).format(now),
    10,
  )
  const vilniusMinute = parseInt(
    new Intl.DateTimeFormat('en-US', { timeZone: tz, minute: 'numeric', hour12: false }).format(now),
    10,
  )
  const h = vilniusHour + vilniusMinute / 60

  // Derive weekday in Vilnius time — getDay() uses UTC which can be a different calendar day
  const vilniusDayName = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'long' }).format(now)
  const DAY_INDEX: Record<string, number> = {
    Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6,
  }
  const day = DAY_INDEX[vilniusDayName] ?? now.getDay()

  if (day >= 1 && day <= 5) return h >= 10 && h < 21
  return h >= 10 && h < 20
}

export default async function StoreDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: tenant } = await supabase
    .from('tenants_public')
    .select('id, store_name, category, logo_url, gallery_images, description')
    .eq('id', id)
    .single()

  if (!tenant) notFound()

  const open = isOpen()
  const images = (tenant.gallery_images ?? []) as string[]

  return (
    <main className="bg-[#f7f7f5] flex flex-col items-center min-h-screen font-[family-name:var(--font-jakarta)]">
      <Nav />

      <section className="w-full max-w-[1332px] mx-auto px-4 pt-4 pb-10 md:pb-14 flex flex-col gap-8">
        {/* Back */}
        <Link
          href="/parduotuves"
          className="inline-flex items-center gap-2 text-sm text-[#575757] hover:text-black transition-colors w-fit"
        >
          <ArrowIcon className="size-4 rotate-180" />
          Visos parduotuvės
        </Link>

        {/* Gallery */}
        <StoreGallery images={images} name={tenant.store_name} />

        {/* Info grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">

          {/* Left: name + description */}
          <div className="bg-white rounded-[40px] p-8 md:p-10 flex flex-col gap-6">
            <div className="flex items-start gap-5">
              {/* Logo */}
              {tenant.logo_url ? (
                <div className="h-[72px] w-[72px] rounded-[20px] overflow-hidden border border-[#ebebeb] shrink-0 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resizeSupabaseImage(tenant.logo_url, { width: 144, height: 144, fit: 'contain' })}
                    alt={`${tenant.store_name} logotipas`}
                    className="size-full object-contain p-1"
                  />
                </div>
              ) : (
                <div className="h-[72px] w-[72px] rounded-[20px] bg-[#f2f2f2] shrink-0 flex items-center justify-center">
                  <span className="font-bold text-[22px] text-black/20 tracking-tight select-none">
                    {tenant.store_name.slice(0, 2).toUpperCase()}
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-1 min-w-0 pt-1">
                {/* Status */}
                <div className="flex items-center gap-1.5">
                  <div className={`size-2 rounded-full shrink-0 ${open ? 'bg-[#22c55e]' : 'bg-[#ef4444]'}`} />
                  <span className="text-[#575757] text-sm leading-none">
                    {open ? 'Atidaryta' : 'Uždaryta'}
                  </span>
                </div>
                <h1 className="font-bold text-[28px] md:text-[36px] leading-[1.15] text-black tracking-tight">
                  {tenant.store_name}
                </h1>
                {tenant.category && (
                  <span className="text-[#575757] text-sm">{tenant.category}</span>
                )}
              </div>
            </div>

            {tenant.description && (
              <p className="text-[#575757] text-[15px] leading-relaxed">{tenant.description}</p>
            )}
          </div>

          {/* Right: hours */}
          <div className="bg-white rounded-[40px] p-8 flex flex-col gap-5">
            <h2 className="font-bold text-[18px] leading-6 text-black">Darbo laikas</h2>

            <div className="flex flex-col gap-3">
              {HOURS.map(({ days, hours }) => (
                <div key={days} className="flex items-center justify-between gap-4">
                  <span className="text-[#575757] text-[14px] w-[44px] shrink-0">{days}</span>
                  <div className="flex-1 border-b border-dashed border-[#e8e8e4]" />
                  <span className="text-black font-medium text-[14px] tabular-nums">{hours}</span>
                </div>
              ))}
            </div>

            <div className="h-px bg-[#f2f2f2]" />

            {/* Location hint */}
            <div className="flex flex-col gap-1">
              <p className="text-[#575757] text-[13px]">Adresas</p>
              <p className="font-medium text-[14px] text-black">Konstitucijos pr. 7A, Vilnius</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
