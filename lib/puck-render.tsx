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

// Renders a single Puck block as its real marketing component.
// Used on public pages — runs server-side so async components work.
export function renderPuckBlock(block: BlockEntry, index: number) {
  const type = block.type as keyof PuckBlocks
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const props = (block.props ?? {}) as any

  switch (type) {
    case 'PageBanner': {
      const slides = [props.slide1, props.slide2, props.slide3, props.slide4].filter(Boolean) as string[]
      return <PageBannerCarousel key={index} slides={slides} />
    }
    case 'Hero':
      return <Hero key={index} title={props.title || undefined} subtitle={props.subtitle || undefined} />
    case 'QuickLinks':
      return <QuickLinks key={index} links={props.links} />
    case 'CategoriesSection':
      return <CategoriesSection key={index} heading={props.heading} categories={props.categories} />
    case 'ActivitiesSection':
      return (
        <ActivitiesSection
          key={index}
          leisureTag={props.leisureTag}
          leisureHeading={props.leisureHeading}
          leisureDescription={props.leisureDescription}
          leisureImage={props.leisureImage}
          sportsHeading={props.sportsHeading}
          petsHeading={props.petsHeading}
          petsDescription={props.petsDescription}
          petImage={props.petImage}
        />
      )
    case 'PartnerLogos':
      return <PartnerLogos key={index} />
    case 'NewsSection':
      return <NewsSection key={index} />
    case 'SocialSection':
      return <SocialSection key={index} heading={props.heading} socials={props.socials} />
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
