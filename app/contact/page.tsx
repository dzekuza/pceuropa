// app/contact/page.tsx — Public Contact page
import { createClient } from '@/lib/supabase/server'
import type { PageContentMap } from '@/types/database'
import { MarketingShell } from '@/components/marketing/marketing-shell'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

async function getContent(): Promise<PageContentMap> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('page_sections')
    .select('section_key, content_key, value')
    .eq('page_slug', 'contact')

  const map: PageContentMap = {}
  for (const row of data ?? []) {
    if (!map[row.section_key]) map[row.section_key] = {}
    map[row.section_key][row.content_key] = row.value ?? ''
  }
  return map
}

export default async function ContactPage() {
  const content = await getContent()

  const hero = content['hero'] ?? {}
  const info = content['info'] ?? {}
  const map = content['map'] ?? {}

  const heroHeading = hero.heading || 'Susisiekite su mumis'
  const heroSubtitle =
    hero.subtitle || 'Esame pasiruošę atsakyti į Jūsų klausimus ir padėti.'

  const address = info.address || 'Naugarduko g. 76, Vilnius'
  const phone = info.phone || '+370 5 123 4567'
  const email = info.email || 'info@pceuropa.lt'
  const hours = info.hours || 'I–VII: 10:00–21:00'

  const mapEmbedUrl = map.embed_url || ''
  const mapNote = map.note || ''

  return (
    <MarketingShell currentSlug="contact">
      {/* Hero */}
      <section className="bg-muted/40 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">{heroHeading}</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">{heroSubtitle}</p>
        </div>
      </section>

      {/* Contact cards */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <InfoCard icon={<MapPin className="h-5 w-5" />} label="Adresas" value={address} />
            <InfoCard
              icon={<Phone className="h-5 w-5" />}
              label="Telefonas"
              value={phone}
              href={`tel:${phone.replace(/\s/g, '')}`}
            />
            <InfoCard
              icon={<Mail className="h-5 w-5" />}
              label="El. paštas"
              value={email}
              href={`mailto:${email}`}
            />
            <InfoCard icon={<Clock className="h-5 w-5" />} label="Darbo laikas" value={hours} />
          </div>
        </div>
      </section>

      {/* Map */}
      {(mapEmbedUrl || mapNote) && (
        <section className="pb-20">
          <div className="mx-auto max-w-5xl px-6 flex flex-col gap-4">
            {mapEmbedUrl && (
              <div className="overflow-hidden rounded-2xl border shadow-sm aspect-video">
                <iframe
                  src={mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Žemėlapis"
                />
              </div>
            )}
            {mapNote && (
              <p className="text-sm text-muted-foreground text-center">{mapNote}</p>
            )}
          </div>
        </section>
      )}
    </MarketingShell>
  )
}

function InfoCard({
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
        <a href={href} className="text-sm font-medium hover:text-primary transition-colors leading-snug">
          {value}
        </a>
      ) : (
        <p className="text-sm font-medium leading-snug">{value}</p>
      )}
    </div>
  )
}
