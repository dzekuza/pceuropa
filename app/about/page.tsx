// app/about/page.tsx — Public About Us page
import { createClient } from '@/lib/supabase/server'
import type { PageContentMap } from '@/types/database'
import { MarketingShell } from '@/components/marketing/marketing-shell'
import { Building2 } from 'lucide-react'

async function getContent(): Promise<PageContentMap> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('page_sections')
    .select('section_key, content_key, value')
    .eq('page_slug', 'about')

  const map: PageContentMap = {}
  for (const row of data ?? []) {
    if (!map[row.section_key]) map[row.section_key] = {}
    map[row.section_key][row.content_key] = row.value ?? ''
  }
  return map
}

export default async function AboutPage() {
  const content = await getContent()

  const hero = content['hero'] ?? {}
  const story = content['story'] ?? {}
  const stats = content['stats'] ?? {}

  const heroHeading = hero.heading || 'Apie PC Europa'
  const heroTagline = hero.tagline || 'Jūsų mėgstamiausias pirkimų centras'
  const heroImage = hero.image_url || ''

  const storyHeading = story.heading || 'Mūsų istorija'
  const storyDescription =
    story.description ||
    'PC Europa – tai modernaus gyvenimo centras, kuriame susijungia apsipirkimas, gastronomija ir laisvalaikis. Mes nuolat stengiamės tobulinti lankytojų patirtį ir pasiūlyti geriausius prekių ženklus.'
  const storyImage = story.image_url || ''

  const stat1Value = stats.stat1_value || '15+'
  const stat1Label = stats.stat1_label || 'Metai rinkoje'
  const stat2Value = stats.stat2_value || '80+'
  const stat2Label = stats.stat2_label || 'Parduotuvių'
  const stat3Value = stats.stat3_value || '2M+'
  const stat3Label = stats.stat3_label || 'Lankytojų per metus'

  return (
    <MarketingShell currentSlug="about">
      {/* Hero */}
      <section
        className="relative flex min-h-[40vh] items-center justify-center overflow-hidden"
        style={
          heroImage
            ? { backgroundImage: `url(${heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : {}
        }
      >
        {heroImage && <div className="absolute inset-0 bg-black/55" />}
        <div className={`relative z-10 mx-auto max-w-3xl px-6 py-20 text-center ${heroImage ? 'text-white' : ''}`}>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">{heroHeading}</h1>
          <p className="text-lg opacity-90">{heroTagline}</p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid grid-cols-3 gap-8 text-center">
            <StatItem value={stat1Value} label={stat1Label} />
            <StatItem value={stat2Value} label={stat2Label} />
            <StatItem value={stat3Value} label={stat3Label} />
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            {storyImage ? (
              <div className="overflow-hidden rounded-2xl shadow-lg aspect-video order-last md:order-first">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={storyImage} alt={storyHeading} className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl bg-muted flex items-center justify-center aspect-video order-last md:order-first">
                <Building2 className="h-20 w-20 text-muted-foreground/30" />
              </div>
            )}
            <div>
              <h2 className="text-3xl font-bold mb-4">{storyHeading}</h2>
              <p className="text-muted-foreground leading-relaxed text-base">{storyDescription}</p>
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  )
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-4xl font-extrabold">{value}</p>
      <p className="text-sm opacity-80">{label}</p>
    </div>
  )
}
