import type { Data } from '@measured/puck'
import { QuickLinks } from '@/components/marketing/quick-links'
import { CategoriesSection } from '@/components/marketing/categories-section'
import { ActivitiesSection } from '@/components/marketing/activities-section'
import { PartnerLogos } from '@/components/marketing/partner-logos'
import { NewsSection } from '@/components/marketing/news-section'
import { SocialSection } from '@/components/marketing/social-section'
import { Hero } from '@/components/marketing/hero'
import { PageBannerCarousel } from '@/components/marketing/page-banner-carousel'
import type { PuckBlocks } from './puck-config'

type BlockEntry = Data['content'][number]

const ALLOWED_IMAGE_HOSTNAMES = new Set(
  [
    process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : null,
    'localhost',
  ].filter((hostname): hostname is string => hostname !== null),
)

function isSafeImageUrl(url: unknown): url is string {
  if (typeof url !== 'string' || url === '') return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' && ALLOWED_IMAGE_HOSTNAMES.has(parsed.hostname)
  } catch {
    return false
  }
}

function safeString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

// Renders a single Puck block as its real marketing component.
// Used on public pages — runs server-side so async components work.
export function renderPuckBlock(block: BlockEntry, index: number) {
  const type = block.type as keyof PuckBlocks
  const props = (block.props ?? {}) as Record<string, unknown>
  const key = (typeof props.id === 'string' ? props.id : undefined) ?? index

  switch (type) {
    case 'PageBanner': {
      const slides = [props.slide1, props.slide2, props.slide3, props.slide4].filter(isSafeImageUrl)
      return <PageBannerCarousel key={key} slides={slides} />
    }
    case 'Hero': {
      const rawSlides = Array.isArray(props.slides) ? props.slides : []
      const slides = (rawSlides as unknown[]).flatMap((slide) => {
        if (
          slide !== null &&
          typeof slide === 'object' &&
          isSafeImageUrl((slide as Record<string, unknown>).src)
        ) {
          const s = slide as Record<string, unknown>
          return [{ src: s.src as string, alt: safeString(s.alt) ?? '' }]
        }
        return []
      })
      return (
        <Hero
          key={key}
          title={safeString(props.title) || undefined}
          subtitle={safeString(props.subtitle) || undefined}
          slides={slides.length ? slides : undefined}
        />
      )
    }
    case 'QuickLinks':
      return <QuickLinks key={key} links={props.links as PuckBlocks['QuickLinks']['links']} />
    case 'CategoriesSection': {
      const rawCategories = Array.isArray(props.categories) ? props.categories : []
      const categories = (rawCategories as unknown[]).flatMap((cat) => {
        if (
          cat !== null &&
          typeof cat === 'object' &&
          'title' in cat &&
          'href' in cat &&
          'image' in cat &&
          isSafeImageUrl((cat as Record<string, unknown>).image)
        ) {
          return [cat as PuckBlocks['CategoriesSection']['categories'][number]]
        }
        return []
      })
      return (
        <CategoriesSection
          key={key}
          heading={safeString(props.heading) ?? ''}
          categories={categories}
        />
      )
    }
    case 'ActivitiesSection':
      return (
        <ActivitiesSection
          key={key}
          leisureTag={safeString(props.leisureTag)}
          leisureHeading={safeString(props.leisureHeading)}
          leisureDescription={safeString(props.leisureDescription)}
          leisureImage={isSafeImageUrl(props.leisureImage) ? props.leisureImage : undefined}
          sportsHeading={safeString(props.sportsHeading)}
          sportsImage1={isSafeImageUrl(props.sportsImage1) ? props.sportsImage1 : undefined}
          sportsImage2={isSafeImageUrl(props.sportsImage2) ? props.sportsImage2 : undefined}
          sportsImage3={isSafeImageUrl(props.sportsImage3) ? props.sportsImage3 : undefined}
          petsHeading={safeString(props.petsHeading)}
          petsDescription={safeString(props.petsDescription)}
          petImage={isSafeImageUrl(props.petImage) ? props.petImage : undefined}
        />
      )
    case 'PartnerLogos':
      return <PartnerLogos key={key} />
    case 'NewsSection': {
      const rawItems = Array.isArray(props.items) ? props.items : []
      const items = (rawItems as unknown[]).flatMap((item) => {
        if (
          item !== null &&
          typeof item === 'object' &&
          'title' in item &&
          'date' in item &&
          'href' in item &&
          isSafeImageUrl((item as Record<string, unknown>).image)
        ) {
          return [item as PuckBlocks['NewsSection']['items'][number]]
        }
        return []
      })
      return (
        <NewsSection
          key={key}
          heading={safeString(props.heading)}
          ctaLabel={safeString(props.ctaLabel)}
          items={items.length ? items : undefined}
        />
      )
    }
    case 'SocialSection':
      return (
        <SocialSection
          key={key}
          heading={safeString(props.heading) ?? ''}
          socials={props.socials as PuckBlocks['SocialSection']['socials']}
        />
      )
    // Preview-only blocks — render nothing on public pages (content is already rendered by the page)
    case 'OpeningHoursBlock':
    case 'HowToGetHereBlock':
    case 'StoresDirectoryBlock':
    case 'LankytojamsBlock':
    case 'AkcijosGridBlock':
    case 'DialogaiFoodCourtBlock':
      return null
    default:
      return null
  }
}
