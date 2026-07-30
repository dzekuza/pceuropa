import { Nav } from '@/components/marketing/nav'
import { Footer } from '@/components/marketing/footer'
import { DialogaiSection } from '@/components/marketing/dialogai-section'
import { PlanasSection } from '@/components/marketing/planas-section'
import { DialogaiFoodCourtDirectory } from '@/components/marketing/dialogai-food-court-directory'
import { PageBannerCarousel } from '@/components/marketing/page-banner-carousel'
import { createClient } from '@/lib/supabase/server'
import { getPuckBannerSlides } from '@/lib/page-content'

export const metadata = {
  title: 'Dialogai Food Court — PC Europa',
  description:
    'Vieta susitikimams, skoniams ir trumpam atokvėpiui miesto ritme. „Dialogai" food court erdvėje laukia įvairūs skoniai, jauki atmosfera ir patogus laikas tiek greitiems pietums, tiek ilgesniems pokalbiams.',
}

const DEFAULT_BANNER_SLIDES = [
  'https://ybyyxcuvxuzrledbitky.supabase.co/storage/v1/object/public/marketing-assets/banner-dialogai-1.jpg',
  'https://ybyyxcuvxuzrledbitky.supabase.co/storage/v1/object/public/marketing-assets/banner-dialogai-2.jpg',
  'https://ybyyxcuvxuzrledbitky.supabase.co/storage/v1/object/public/marketing-assets/banner-dialogai-3.jpg',
]

export default async function DialogaiPage() {
  const supabase = await createClient()
  const bannerSlides = await getPuckBannerSlides('dialogai', DEFAULT_BANNER_SLIDES)
  const { data: tenants } = await supabase
    .from('tenants_public')
    .select('id, slug, store_name, category, logo_url, gallery_images')
    .in('category', ['Maistas ir restoranai', 'Maistas', 'Kavinės', 'Restoranai'])
    .order('store_name', { ascending: true })

  const places = (tenants ?? []).map((t) => ({
    id: t.id,
    slug: t.slug,
    name: t.store_name,
    category: t.category ?? 'Kita',
    logoUrl: t.logo_url ?? null,
    coverUrl: t.gallery_images?.[0] ?? null,
  }))

  return (
    <main className="bg-[#f7f7f5] flex flex-col items-center min-h-screen font-[family-name:var(--font-jakarta)]">
      <Nav />

      <h1 className="sr-only">Dialogai Food Court — PC Europa</h1>
      <PageBannerCarousel slides={bannerSlides} />

      {/* Food court directory grid */}
      <div className="w-full flex flex-col items-center">
        <DialogaiFoodCourtDirectory places={places} />
      </div>

      {/* Dialogai promo section */}
      <DialogaiSection />

      {/* Floor plan */}
      <div className="w-full bg-[#f7f7f5]">
        <PlanasSection stores={places} />
      </div>

      <Footer />
    </main>
  )
}
