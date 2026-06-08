// app/hours/page.tsx — Public Opening Hours page
import { createClient } from '@/lib/supabase/server'
import type { PageContentMap } from '@/types/database'
import { MarketingShell } from '@/components/marketing/marketing-shell'
import { Clock } from 'lucide-react'

async function getContent(): Promise<PageContentMap> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('page_sections')
    .select('section_key, content_key, value')
    .eq('page_slug', 'hours')

  const map: PageContentMap = {}
  for (const row of data ?? []) {
    if (!map[row.section_key]) map[row.section_key] = {}
    map[row.section_key][row.content_key] = row.value ?? ''
  }
  return map
}

export default async function HoursPage() {
  const content = await getContent()

  const hero = content['hero'] ?? {}
  const schedule = content['schedule'] ?? {}

  const heading = hero.heading || 'Darbo laikas'
  const subtitle = hero.subtitle || 'Laukiame Jūsų kiekvieną dieną'
  const note = hero.note || ''

  const rows = [
    {
      label: schedule.weekdays_label || 'Pirmadienis – Penktadienis',
      hours: schedule.weekdays_hours || '10:00 – 21:00',
    },
    {
      label: schedule.saturday_label || 'Šeštadienis',
      hours: schedule.saturday_hours || '10:00 – 21:00',
    },
    {
      label: schedule.sunday_label || 'Sekmadienis',
      hours: schedule.sunday_hours || '10:00 – 20:00',
    },
    {
      label: schedule.holidays_label || 'Valstybinės šventės',
      hours: schedule.holidays_hours || '11:00 – 18:00',
    },
  ]

  return (
    <MarketingShell currentSlug="hours">
      {/* Hero */}
      <section className="bg-muted/40 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Clock className="h-7 w-7 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">{heading}</h1>
          <p className="text-lg text-muted-foreground">{subtitle}</p>
        </div>
      </section>

      {/* Schedule */}
      <section className="py-16">
        <div className="mx-auto max-w-lg px-6">
          <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
            {rows.map((row, i) => (
              <div
                key={i}
                className={`flex items-center justify-between px-6 py-4 ${
                  i < rows.length - 1 ? 'border-b' : ''
                }`}
              >
                <span className="text-sm font-medium">{row.label}</span>
                <span className="text-sm text-muted-foreground tabular-nums">{row.hours}</span>
              </div>
            ))}
          </div>

          {note && (
            <p className="mt-6 text-sm text-muted-foreground text-center leading-relaxed">{note}</p>
          )}
        </div>
      </section>
    </MarketingShell>
  )
}
