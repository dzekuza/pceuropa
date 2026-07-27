import { Nav } from '@/components/marketing/nav'
import { Footer } from '@/components/marketing/footer'
import { VisitorInfoBanner } from '@/components/marketing/visitor-info-banner'
import { OpeningHoursSection } from '@/components/marketing/opening-hours-section'
import { HowToGetHereSection } from '@/components/marketing/how-to-get-here-section'
import { PlanasSection } from '@/components/marketing/planas-section'
import { createClient } from '@/lib/supabase/server'
import { getPuckBannerSlides, getPuckBlockProps } from '@/lib/page-content'
import { DARBO_LAIKAS_STRINGS } from '@/lib/strings'
import type { StoreHoursCardProps } from '@/components/marketing/store-hours-card'

const DEFAULT_BANNER_SLIDES = [
  'https://ybyyxcuvxuzrledbitky.supabase.co/storage/v1/object/public/marketing-assets/darbo-laikas/banner.jpg',
]

const DEFAULT_OPENING_HOURS_TEXT = {
  heroHeading: DARBO_LAIKAS_STRINGS.heroHeading,
  heroSubtext1: DARBO_LAIKAS_STRINGS.heroSubtext1,
  heroSubtext2: DARBO_LAIKAS_STRINGS.heroSubtext2,
  heroSubtext3: DARBO_LAIKAS_STRINGS.heroSubtext3,
  searchPlaceholder: DARBO_LAIKAS_STRINGS.searchPlaceholder,
  loadMoreButton: DARBO_LAIKAS_STRINGS.loadMoreButton,
}

const DEFAULT_HOW_TO_GET_HERE = {
  heading: DARBO_LAIKAS_STRINGS.howToGetHereHeading,
  subtext: DARBO_LAIKAS_STRINGS.howToGetHereSubtext,
  mapEmbedUrl: 'https://maps.google.com/maps?q=Europa,+Konstitucijos+pr.+7A,+Vilnius,+09308&t=&z=15&ie=UTF8&iwloc=&output=embed',
  mapLinkUrl: 'https://maps.google.com/?q=Europa,+Konstitucijos+pr.+7A,+Vilnius,+09308',
  viewRouteLabel: DARBO_LAIKAS_STRINGS.viewRouteButton,
  transportCards: DARBO_LAIKAS_STRINGS.transportCards.map((c) => ({ ...c })),
}

export const metadata = {
  title: DARBO_LAIKAS_STRINGS.pageTitle,
  description: DARBO_LAIKAS_STRINGS.pageDescription,
}

// TODO: replace with permanent Supabase Storage URL (Figma MCP assets expire after 7 days)
const PLACEHOLDER_COVER: string | null = null

// NOTE: opening_hours is not yet a DB column — hardcoded per Figma design placeholders.
const DEFAULT_HOURS = {
  weekdayHours: { days: 'I–V', hours: '10:00–21:00' },
  weekendHours: { days: 'VI–VII', hours: '10:00–20:00' },
}

function isCurrentlyOpen(): boolean {
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

  return h >= 10 && h < 21
}

export default async function DarboLaikasPage() {
  const supabase = await createClient()
  const { data: tenants } = await supabase
    .from('tenants_public')
    .select('id, store_name, category, logo_url, gallery_images')
    .order('store_name', { ascending: true })

  const open = isCurrentlyOpen()
  const bannerSlides = await getPuckBannerSlides('darbo-laikas', DEFAULT_BANNER_SLIDES)
  const openingHoursText = await getPuckBlockProps('darbo-laikas', 'OpeningHoursBlock', DEFAULT_OPENING_HOURS_TEXT)
  const howToGetHere = await getPuckBlockProps('darbo-laikas', 'HowToGetHereBlock', DEFAULT_HOW_TO_GET_HERE)

  const stores: StoreHoursCardProps[] = (tenants ?? []).map((t) => ({
    id: t.id,
    name: t.store_name,
    logoUrl: t.logo_url ?? null,
    logoAlt: t.store_name,
    coverUrl: t.gallery_images?.[0] ?? PLACEHOLDER_COVER,
    isOpen: open,
    ...DEFAULT_HOURS,
    href: `/parduotuves`,
  }))

  const planasStores = (tenants ?? []).map((t) => ({
    id: t.id,
    name: t.store_name,
    logoUrl: t.logo_url ?? null,
  }))

  return (
    <main className="bg-[#f7f7f5] flex flex-col items-center min-h-screen font-[family-name:var(--font-jakarta)]">
      <Nav />

      {/* Info banner — matches Figma "Nav / Banner" section (node 946:72) */}
      <div className="w-full max-w-[1332px] mx-auto px-4 pt-6 lg:pt-8">
        <VisitorInfoBanner
          heading={DARBO_LAIKAS_STRINGS.heroHeading}
          variant="hours"
          backgroundImage={bannerSlides[0]}
        />
      </div>

      {/* Main content */}
      <div className="w-full max-w-[1332px] mx-auto px-4 py-10 md:py-14 flex flex-col gap-10 md:gap-14">
        <OpeningHoursSection stores={stores} {...openingHoursText} />
        <HowToGetHereSection {...howToGetHere} />
      </div>

      {/* Floor plan */}
      <div className="w-full bg-[#f7f7f5]">
        <PlanasSection stores={planasStores} />
      </div>

      <Footer />
    </main>
  )
}
