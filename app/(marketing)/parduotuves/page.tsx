import Link from 'next/link'
import { Nav } from '@/components/marketing/nav'
import { Footer } from '@/components/marketing/footer'
import { StoresDirectory } from '@/components/marketing/stores-directory'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Parduotuvės ir Paslaugos — PC Europa',
  description: 'Visos PC Europa parduotuvės ir paslaugos vienoje vietoje.',
}

export default async function ParduotuvesPage() {
  const supabase = await createClient()
  const { data: tenants } = await supabase
    .from('tenants_public')
    .select('id, store_name, category, logo_url, gallery_images')
    .order('store_name', { ascending: true })

  const stores = (tenants ?? []).map((t) => ({
    id: t.id,
    name: t.store_name,
    category: t.category ?? 'Kita',
    logoUrl: t.logo_url ?? null,
    coverUrl: t.gallery_images?.[0] ?? null,
  }))

  return (
    <main className="bg-[#f7f7f5] flex flex-col items-center min-h-screen font-[family-name:var(--font-jakarta)]">
      <Nav />

      {/* Page banner */}
      <div className="w-full bg-[#181818] md:rounded-b-[16px]">
        <div className="max-w-[1300px] mx-auto px-4 lg:px-0 pt-8 pb-10 md:pt-10 md:pb-14">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-5 md:mb-6">
            <Link
              href="/"
              className="text-white/40 text-[13px] font-medium hover:text-white/70 transition-colors duration-150"
            >
              Pagrindinis
            </Link>
            <span className="text-white/20 text-[13px]">/</span>
            <span className="text-white/70 text-[13px] font-medium">Parduotuvės</span>
          </div>

          {/* Heading */}
          <h1 className="font-bold text-[32px] md:text-[44px] lg:text-[58px] leading-[1.05] tracking-[-1.5px] md:tracking-[-2px] lg:tracking-[-2.5px] text-white mb-3 md:mb-4">
            Parduotuvės{' '}
            <span className="text-[#fdf567]">&amp; paslaugos</span>
          </h1>
          <p className="text-white/50 text-[14px] md:text-[16px] leading-[26px] max-w-[440px]">
            Mada, grožis, technologijos ir kasdieniai atradimai — visa tai rasi PC Europa.
          </p>
        </div>
      </div>

      {/* Stores directory */}
      <div className="w-full bg-[#f7f7f5] flex flex-col items-center">
        <StoresDirectory stores={stores} />
      </div>

      <Footer />
    </main>
  )
}
