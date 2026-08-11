import { Nav } from '@/components/marketing/nav'
import { Footer } from '@/components/marketing/footer'
import { StoresDirectory } from '@/components/marketing/stores-directory'
import { PlanasSection } from '@/components/marketing/planas-section'
import { PageBannerCarousel } from '@/components/marketing/page-banner-carousel'
import { getPublicTenants } from '@/lib/tenants-public'
import { getPuckBannerSlides } from '@/lib/page-content'
import { normalizeCategory } from '@/lib/constants'

export const metadata = {
  title: 'Parduotuvės ir Paslaugos — PC Europa',
  description: 'Visos PC Europa parduotuvės ir paslaugos vienoje vietoje.',
}

const DEFAULT_BANNER_SLIDES = [
  'https://ybyyxcuvxuzrledbitky.supabase.co/storage/v1/object/public/marketing-assets/banner-parduotuves-wide.jpg',
]

export default async function ParduotuvesPage() {
  const bannerSlides = await getPuckBannerSlides('parduotuves', DEFAULT_BANNER_SLIDES)
  const tenants = await getPublicTenants()

  const stores = tenants.map((t) => ({
    id: t.id,
    slug: t.slug,
    name: t.store_name,
    category: normalizeCategory(t.category),
    logoUrl: t.logo_url ?? null,
    coverUrl: t.gallery_images?.[0] ?? null,
  }))

  return (
    <main className="bg-[#f7f7f5] flex flex-col items-center min-h-screen font-[family-name:var(--font-jakarta)]">
      <Nav />

      <h1 className="sr-only">Parduotuvės ir Paslaugos — PC Europa</h1>
      <PageBannerCarousel slides={bannerSlides} />

      {/* Stores directory */}
      <div className="w-full flex flex-col items-center">
        <StoresDirectory stores={stores} excludeCategories={['Maistas ir restoranai', 'Dialogai']} />
      </div>

      {/* Floor plan */}
      <div className="w-full bg-[#f7f7f5]">
        <PlanasSection stores={stores.filter((s) => s.category !== 'Maistas ir restoranai' && s.category !== 'Dialogai')} />
      </div>

      <Footer />
    </main>
  )
}
