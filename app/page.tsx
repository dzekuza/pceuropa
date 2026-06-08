// app/page.tsx — Public landing page for PC Europa
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { PageContentMap } from '@/types/database'
import { MarketingShell } from '@/components/marketing/marketing-shell'
import { MapPin, Phone, Mail, Building2 } from 'lucide-react'

async function getPageContent(slug: string): Promise<PageContentMap> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('page_sections')
    .select('section_key, content_key, value')
    .eq('page_slug', slug)

  const map: PageContentMap = {}
  for (const row of data ?? []) {
    if (!map[row.section_key]) map[row.section_key] = {}
    map[row.section_key][row.content_key] = row.value ?? ''
  }
  return map
}

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const role = user.app_metadata?.role
    redirect(role === 'admin' ? '/admin' : '/seller')
  }

  const content = await getPageContent('landing')

  const hero = content['hero'] ?? {}
  const about = content['about'] ?? {}
  const contact = content['contact'] ?? {}

  const heroTitle = hero.title || 'PC Europa'
  const heroSubtitle =
    hero.subtitle || 'Šiuolaikiškas pirkimų centras — vieta apsipirkimui, poilsiui ir laisvalaikiui.'
  const heroCtaText = hero.cta_text || 'Sužinoti daugiau'
  const heroImage = hero.image_url || ''

  const aboutHeading = about.heading || 'Apie mus'
  const aboutDescription =
    about.description ||
    'PC Europa – tai modernus pirkimų centras, kuriame rasite plačią parduotuvių, restoranų ir paslaugų įvairovę. Mūsų tikslas – suteikti lankytojams malonią ir patogią patirtį.'
  const aboutImage = about.image_url || ''

  const contactHeading = contact.heading || 'Susisiekite su mumis'
  const contactAddress = contact.address || 'Naugarduko g. 76, Vilnius'
  const contactPhone = contact.phone || '+370 5 123 4567'
  const contactEmail = contact.email || 'info@pceuropa.lt'

  return (
    <MarketingShell currentSlug="landing">
      {/* Hero */}
      <section
        className="relative flex min-h-[70vh] items-center justify-center overflow-hidden"
        style={
          heroImage
            ? { backgroundImage: `url(${heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : {}
        }
      >
        {heroImage && <div className="absolute inset-0 bg-black/50" />}
        <div className={`relative z-10 mx-auto max-w-3xl px-6 py-24 text-center ${heroImage ? 'text-white' : ''}`}>
          <h1 className="text-5xl font-extrabold tracking-tight leading-tight mb-4">{heroTitle}</h1>
          <p className="text-xl leading-relaxed mb-8 max-w-xl mx-auto opacity-90">{heroSubtitle}</p>
          <a
            href="#about"
            className="inline-flex items-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow hover:opacity-90 transition-opacity"
          >
            {heroCtaText}
          </a>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 bg-muted/40">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">{aboutHeading}</h2>
              <p className="text-muted-foreground leading-relaxed text-base">{aboutDescription}</p>
            </div>
            {aboutImage ? (
              <div className="overflow-hidden rounded-2xl shadow-lg aspect-video">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={aboutImage} alt={aboutHeading} className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl bg-muted flex items-center justify-center aspect-video">
                <Building2 className="h-20 w-20 text-muted-foreground/30" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-bold text-center mb-12">{contactHeading}</h2>
          <div className="grid gap-6 sm:grid-cols-3 max-w-2xl mx-auto">
            <ContactCard icon={<MapPin className="h-5 w-5" />} label="Adresas" value={contactAddress} />
            <ContactCard
              icon={<Phone className="h-5 w-5" />}
              label="Telefonas"
              value={contactPhone}
              href={`tel:${contactPhone.replace(/\s/g, '')}`}
            />
            <ContactCard
              icon={<Mail className="h-5 w-5" />}
              label="El. paštas"
              value={contactEmail}
              href={`mailto:${contactEmail}`}
            />
          </div>
        </div>
      </section>
    </MarketingShell>
  )
}

function ContactCard({
  icon, label, value, href,
}: {
  icon: React.ReactNode
  label: string
  value: string
  href?: string
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border bg-card p-6 text-center shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      {href ? (
        <a href={href} className="text-sm font-medium hover:text-primary transition-colors">{value}</a>
      ) : (
        <p className="text-sm font-medium">{value}</p>
      )}
    </div>
  )
}
