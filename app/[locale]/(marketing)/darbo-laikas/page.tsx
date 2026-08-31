import { getTranslations, getLocale } from 'next-intl/server'
import { Nav } from '@/components/marketing/nav'
import { Footer } from '@/components/marketing/footer'
import { VisitorInfoBanner } from '@/components/marketing/visitor-info-banner'
import { OpeningHoursSection } from '@/components/marketing/opening-hours-section'
import { HowToGetHereSection } from '@/components/marketing/how-to-get-here-section'
import { PlanasSection } from '@/components/marketing/planas-section'
import { getPublicTenants } from '@/lib/tenants-public'
import { getPuckBannerSlides, getPuckBlockProps } from '@/lib/page-content'
import type { StoreHoursCardProps } from '@/components/marketing/store-hours-card'
import { STORAGE_PUBLIC_BASE } from '@/lib/utils/supabase-image'

const DEFAULT_BANNER_SLIDES = [
  `${STORAGE_PUBLIC_BASE}/marketing-assets/darbo-laikas/banner.jpg`,
]

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

export async function generateMetadata() {
  const t = await getTranslations('darboLaikas')
  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
  }
}

export default async function DarboLaikasPage() {
  const t = await getTranslations('darboLaikas')
  const locale = await getLocale()
  const tenants = await getPublicTenants()
  const open = isCurrentlyOpen()

  const defaultOpeningHoursText = {
    heroHeading: t('heroHeading'),
    searchPlaceholder: t('searchPlaceholder'),
    loadMoreButton: t('loadMoreButton'),
  }
  const defaultBannerHours = {
    cards: t.raw('bannerHoursCards') as { label: string; line1: string; line2?: string }[],
  }
  const defaultHowToGetHere = {
    heading: t('howToGetHereHeading'),
    subtext: t('howToGetHereSubtext'),
    mapEmbedUrl: 'https://maps.google.com/maps?q=Europa,+Konstitucijos+pr.+7A,+Vilnius,+09308&t=&z=15&ie=UTF8&iwloc=&output=embed',
    mapLinkUrl: 'https://maps.google.com/?q=Europa,+Konstitucijos+pr.+7A,+Vilnius,+09308',
    viewRouteLabel: t('viewRouteButton'),
    transportCards: t.raw('transportCards') as { title: string; subtitle: string }[],
  }

  const bannerSlides = await getPuckBannerSlides('darbo-laikas', DEFAULT_BANNER_SLIDES, locale)
  const bannerHours = await getPuckBlockProps('darbo-laikas', 'BannerHoursBlock', defaultBannerHours, locale)
  const openingHoursText = await getPuckBlockProps('darbo-laikas', 'OpeningHoursBlock', defaultOpeningHoursText, locale)
  const howToGetHere = await getPuckBlockProps('darbo-laikas', 'HowToGetHereBlock', defaultHowToGetHere, locale)

  const stores: StoreHoursCardProps[] = tenants.map((tenant) => ({
    id: tenant.id ?? '',
    name: (locale === 'en' ? tenant.store_name_en : null) || tenant.store_name || '',
    logoUrl: tenant.logo_url ?? null,
    logoAlt: (locale === 'en' ? tenant.store_name_en : null) || tenant.store_name || '',
    coverUrl: tenant.gallery_images?.[0] ?? PLACEHOLDER_COVER,
    isOpen: open,
    weekdayHours: { days: WEEKDAY_LABEL, hours: tenant.weekday_hours ?? '10:00–21:00' },
    saturdayHours: { days: SATURDAY_LABEL, hours: tenant.saturday_hours ?? '10:00–20:00' },
    sundayHours: { days: SUNDAY_LABEL, hours: tenant.sunday_hours ?? '10:00–20:00' },
    href: `/parduotuves/${tenant.slug}`,
  }))

  const planasStores = tenants.map((tenant) => ({
    id: tenant.id ?? '',
    name: (locale === 'en' ? tenant.store_name_en : null) || tenant.store_name || '',
    logoUrl: tenant.logo_url ?? null,
  }))

  return (
    <main className="bg-[#f7f7f5] flex flex-col items-center min-h-screen font-[family-name:var(--font-jakarta)]">
      <Nav />

      {/* Info banner — matches Figma "Nav / Banner" section (node 946:72) */}
      <div className="w-full max-w-[1332px] mx-auto px-4 pt-6 lg:pt-8">
        <VisitorInfoBanner
          heading={t('heroHeading')}
          variant="hours"
          backgroundImage={bannerSlides[0]}
        />
      </div>

      {/* Main content */}
      <div className="w-full max-w-[1332px] mx-auto px-4 py-10 md:py-14 flex flex-col gap-10 md:gap-14">
        <OpeningHoursSection stores={stores} {...openingHoursText} hoursCards={bannerHours.cards} />
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
