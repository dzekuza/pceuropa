import { Nav } from '@/components/marketing/nav'
import { Footer } from '@/components/marketing/footer'
import { StoresDirectory } from '@/components/marketing/stores-directory'
import { PlanasSection } from '@/components/marketing/planas-section'
import { PageBannerCarousel } from '@/components/marketing/page-banner-carousel'
import { createClient } from '@/lib/supabase/server'
import { LAISVALAIKIS_STRINGS } from '@/lib/strings'
import { getPuckBannerSlides } from '@/lib/page-content'

export const metadata = {
  title: LAISVALAIKIS_STRINGS.pageTitle,
  description: LAISVALAIKIS_STRINGS.pageDescription,
}

const BASE = 'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets'
const DEFAULT_BANNER_SLIDES = [`${BASE}/hero-bg.jpg`, `${BASE}/activities-coffee.jpg`]

export default async function LaisvalaikisPage() {
  const supabase = await createClient()
  const bannerSlides = await getPuckBannerSlides('laisvalaikis', DEFAULT_BANNER_SLIDES)
  const { data: tenants } = await supabase
    .from('tenants_public')
    .select('id, store_name, category, logo_url, gallery_images')
    .eq('category', 'Laisvalaikis')
    .order('store_name', { ascending: true })

  const stores = (tenants ?? []).map((t) => ({
    id: t.id,
    name: t.store_name,
    category: t.category ?? 'Laisvalaikis',
    logoUrl: t.logo_url ?? null,
    coverUrl: t.gallery_images?.[0] ?? null,
  }))

  const planasStores = stores.map((s) => ({
    id: s.id,
    name: s.name,
    logoUrl: s.logoUrl,
  }))

  return (
    <main className="bg-[#f7f7f5] flex flex-col items-center min-h-screen font-[family-name:var(--font-jakarta)]">
      <Nav />

      <h1 className="sr-only">Laisvalaikis — PC Europa</h1>
      <PageBannerCarousel slides={bannerSlides} />

      {/* Leisure & entertainment directory */}
      <div className="w-full flex flex-col items-center">
        <StoresDirectory stores={stores} />
      </div>

      {/* Floor plan */}
      <div className="w-full bg-[#f7f7f5]">
        <PlanasSection stores={planasStores} />
      </div>

      <Footer />
    </main>
  )
}
