import { Nav } from '@/components/marketing/nav'
import { Hero } from '@/components/marketing/hero'
import { QuickLinks } from '@/components/marketing/quick-links'
import { CategoriesSection } from '@/components/marketing/categories-section'
import { ActivitiesSection } from '@/components/marketing/activities-section'
import { PartnerLogos } from '@/components/marketing/partner-logos'
import { NewsSection } from '@/components/marketing/news-section'
import { SocialSection } from '@/components/marketing/social-section'
import { Footer } from '@/components/marketing/footer'

export default function LandingPage() {
  return (
    <main className="bg-white flex flex-col items-center min-h-screen font-[family-name:var(--font-jakarta)]">
      <Nav />
      <Hero />

      <QuickLinks />
      <CategoriesSection />
      <ActivitiesSection />
      <PartnerLogos />
      <NewsSection />
      <SocialSection />
      <Footer />
    </main>
  )
}
