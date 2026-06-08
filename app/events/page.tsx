// app/events/page.tsx — Public Events & Promotions page
import { createClient } from '@/lib/supabase/server'
import type { PageContentMap } from '@/types/database'
import { MarketingShell } from '@/components/marketing/marketing-shell'
import { Calendar, ImageIcon } from 'lucide-react'

async function getContent(): Promise<PageContentMap> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('page_sections')
    .select('section_key, content_key, value')
    .eq('page_slug', 'events')

  const map: PageContentMap = {}
  for (const row of data ?? []) {
    if (!map[row.section_key]) map[row.section_key] = {}
    map[row.section_key][row.content_key] = row.value ?? ''
  }
  return map
}

export default async function EventsPage() {
  const content = await getContent()

  const hero = content['hero'] ?? {}
  const heroHeading = hero.heading || 'Renginiai ir akcijos'
  const heroSubtitle =
    hero.subtitle || 'Sekite naujausias akcijas ir renginius PC Europa pirkimų centre.'

  const events = (['event1', 'event2', 'event3'] as const)
    .map((key) => content[key] ?? {})
    .filter((e) => e.title)

  return (
    <MarketingShell currentSlug="events">
      {/* Hero */}
      <section className="bg-muted/40 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">{heroHeading}</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">{heroSubtitle}</p>
        </div>
      </section>

      {/* Events */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6">
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground gap-3">
              <Calendar className="h-12 w-12 opacity-30" />
              <p className="text-base">Šiuo metu renginių nėra. Grįžkite vėliau!</p>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event, i) => (
                <EventCard key={i} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>
    </MarketingShell>
  )
}

function EventCard({ event }: { event: Record<string, string> }) {
  return (
    <div className="flex flex-col rounded-2xl border bg-card shadow-sm overflow-hidden">
      {event.image_url ? (
        <div className="aspect-video overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.image_url}
            alt={event.title}
            className="h-full w-full object-cover"
            onError={undefined}
          />
        </div>
      ) : (
        <div className="aspect-video bg-muted flex items-center justify-center">
          <ImageIcon className="h-10 w-10 text-muted-foreground/30" />
        </div>
      )}
      <div className="flex flex-col gap-2 p-5 flex-1">
        {event.date && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {event.date}
          </p>
        )}
        <h3 className="font-bold text-base leading-snug">{event.title}</h3>
        {event.description && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {event.description}
          </p>
        )}
      </div>
    </div>
  )
}
