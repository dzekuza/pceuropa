import type { Metadata } from 'next'
import { Nav } from '@/components/marketing/nav'
import { Footer } from '@/components/marketing/footer'
import { AkcijosGrid } from '@/components/marketing/akcijos-grid'
import { PageBannerCarousel } from '@/components/marketing/page-banner-carousel'
import type { PromoItem } from '@/components/marketing/promo-card'
import { AKCIJOS_STRINGS } from '@/lib/strings'

const BANNER_SLIDES: (string | null)[] = [
  'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/banner-akcijos-1.jpg',
  'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/banner-akcijos-2.jpg',
]

export const metadata: Metadata = {
  title: 'Akcijos ir Naujienos — PC Europa',
  description: AKCIJOS_STRINGS.pageDescription,
}

// Hardcoded promo items — replace with Supabase query when promo table is available
const PROMO_ITEMS: PromoItem[] = [
  {
    id: '1',
    image:
      'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/news-1.jpg',
    title: 'Papildoma nuolaida Rieker!',
    date: 'Nuo 2026.03.25 iki 2026.03.29',
    href: '/akcijos/rieker',
  },
  {
    id: '2',
    image:
      'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/news-2.jpg',
    title: 'Kvepia pavasariu',
    date: 'Nuo 2026.03.25 iki 2026.03.29',
    href: '/akcijos/pavasaris',
  },
  {
    id: '3',
    image:
      'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/news-3.jpg',
    title: 'Samsung naujienos',
    date: 'Nuo 2026.03.25 iki 2026.03.29',
    href: '/akcijos/samsung',
  },
  {
    id: '4',
    image:
      'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/news-4.jpg',
    title: 'Vision Express akcija',
    date: 'Nuo 2026.03.25 iki 2026.03.29',
    href: '/akcijos/vision-express',
  },
  {
    id: '5',
    image:
      'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/news-1.jpg',
    title: 'Nauja kolekcija Lindex',
    date: 'Nuo 2026.04.01 iki 2026.04.14',
    href: '/akcijos/lindex',
  },
  {
    id: '6',
    image:
      'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/news-2.jpg',
    title: 'Vasaros išpardavimas',
    date: 'Nuo 2026.06.01 iki 2026.06.30',
    href: '/akcijos/vasara',
  },
  {
    id: '7',
    image:
      'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/news-3.jpg',
    title: 'Sporto prekių nuolaidos',
    date: 'Nuo 2026.05.15 iki 2026.05.31',
    href: '/akcijos/sportas',
  },
  {
    id: '8',
    image:
      'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/news-4.jpg',
    title: 'Caffeine kavos diena',
    date: 'Nuo 2026.06.10 iki 2026.06.10',
    href: '/akcijos/caffeine',
  },
  {
    id: '9',
    image:
      'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/news-1.jpg',
    title: 'IKI maisto akcija',
    date: 'Nuo 2026.06.05 iki 2026.06.11',
    href: '/akcijos/iki',
  },
  {
    id: '10',
    image:
      'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/news-2.jpg',
    title: 'Miyako sushi akcija',
    date: 'Nuo 2026.06.01 iki 2026.06.07',
    href: '/akcijos/miyako',
  },
]

export default function AkcijosPage() {
  return (
    <main className="bg-[#f7f7f5] flex flex-col items-center min-h-screen font-[family-name:var(--font-jakarta)]">
      <Nav />

      <h1 className="sr-only">{AKCIJOS_STRINGS.pageTitle}</h1>
      <PageBannerCarousel slides={BANNER_SLIDES} />

      {/* Promo grid with filters */}
      <section className="w-full max-w-[1332px] mx-auto px-4 py-8 md:py-10 lg:py-14">
        <AkcijosGrid items={PROMO_ITEMS} />
      </section>

      <Footer />
    </main>
  )
}
