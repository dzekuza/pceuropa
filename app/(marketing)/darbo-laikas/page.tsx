import { Nav } from '@/components/marketing/nav'
import { Footer } from '@/components/marketing/footer'
import { VisitorInfoBanner } from '@/components/marketing/visitor-info-banner'
import { OpeningHoursSection } from '@/components/marketing/opening-hours-section'
import { HowToGetHereSection } from '@/components/marketing/how-to-get-here-section'
import { PlanasSection } from '@/components/marketing/planas-section'
import { getPublicTenants } from '@/lib/tenants-public'
import { getPuckBannerSlides, getPuckBlockProps } from '@/lib/page-content'
import { DARBO_LAIKAS_STRINGS } from '@/lib/strings'
import type { StoreHoursCardProps } from '@/components/marketing/store-hours-card'

const DEFAULT_BANNER_SLIDES = [
  'https://ybyyxcuvxuzrledbitky.supabase.co/storage/v1/object/public/marketing-assets/darbo-laikas/banner.jpg',
]

const DEFAULT_OPENING_HOURS_TEXT = {
  heroHeading: DARBO_LAIKAS_STRINGS.heroHeading,
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

const WEEKDAY_LABEL = 'I–V'
const SATURDAY_LABEL = 'VI'
const SUNDAY_LABEL = 'VII'

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

// force-dynamic — Docker builds have no DATABASE_URL reachable at build
// time, so this page can't be pre-rendered; it must render per-request
// against the running container's DB instead.
export const dynamic = 'force-dynamic'

export default async function DarboLaikasPage() {
  const tenants = await getPublicTenants()
  const open = isCurrentlyOpen()
  const bannerSlides = await getPuckBannerSlides('darbo-laikas', DEFAULT_BANNER_SLIDES)
  const openingHoursText = await getPuckBlockProps('darbo-laikas', 'OpeningHoursBlock', DEFAULT_OPENING_HOURS_TEXT)
  const howToGetHere = await getPuckBlockProps('darbo-laikas', 'HowToGetHereBlock', DEFAULT_HOW_TO_GET_HERE)

  const stores: StoreHoursCardProps[] = tenants.map((t) => ({
    id: t.id,
    name: t.store_name,
    logoUrl: t.logo_url ?? null,
    logoAlt: t.store_name,
    coverUrl: t.gallery_images?.[0] ?? PLACEHOLDER_COVER,
    isOpen: open,
    weekdayHours: { days: WEEKDAY_LABEL, hours: t.weekday_hours ?? '10:00–21:00' },
    saturdayHours: { days: SATURDAY_LABEL, hours: t.saturday_hours ?? '10:00–20:00' },
    sundayHours: { days: SUNDAY_LABEL, hours: t.sunday_hours ?? '10:00–20:00' },
    href: `/parduotuves`,
  }))

  const planasStores = tenants.map((t) => ({
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
