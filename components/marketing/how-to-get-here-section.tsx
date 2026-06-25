import { Car, SquareParking, Bike, Accessibility } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { DARBO_LAIKAS_STRINGS } from '@/lib/strings'

// TODO: replace with permanent Supabase Storage URL
const mapImage: string | null = null

const TRANSPORT_ICONS: LucideIcon[] = [Car, SquareParking, Bike, Accessibility]

export function HowToGetHereSection() {
  return (
    <section className="bg-white w-full rounded-[32px] lg:rounded-[40px] p-6 lg:p-10 flex flex-col gap-10">
      {/* Heading */}
      <div className="flex flex-col gap-4">
        <h2 className="font-bold text-[32px] md:text-[40px] lg:text-[48px] leading-[1.1] lg:leading-[60px] tracking-[-1.5px] lg:tracking-[-2.5px] text-black font-[family-name:var(--font-jakarta)]">
          {DARBO_LAIKAS_STRINGS.howToGetHereHeading}
        </h2>
        <p className="text-[#575757] text-base leading-6">
          {DARBO_LAIKAS_STRINGS.howToGetHereSubtext}
        </p>
      </div>

      {/* Map + cards */}
      <div className="flex flex-col lg:flex-row gap-10 items-start">
        {/* Map */}
        <div className="relative w-full lg:flex-1 rounded-3xl overflow-hidden h-[260px] md:h-[340px] lg:h-[428px]">
          {mapImage
            ? <img src={mapImage} alt={DARBO_LAIKAS_STRINGS.mapAlt} className="absolute inset-0 size-full object-cover" /> // eslint-disable-line @next/next/no-img-element
            : <div className="absolute inset-0 bg-[#e8e8e5]" aria-label={DARBO_LAIKAS_STRINGS.mapAlt} />}
          {/* View route button */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <a
              href="https://maps.google.com/?q=PC+Europa+Vilnius"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border border-white text-black text-sm leading-4 font-normal px-7 py-3 rounded-full whitespace-nowrap hover:bg-white/90 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            >
              {DARBO_LAIKAS_STRINGS.viewRouteButton}
            </a>
          </div>
        </div>

        {/* Transport cards */}
        <div className="flex flex-col gap-6 w-full lg:w-[328px] shrink-0">
          {DARBO_LAIKAS_STRINGS.transportCards.map(({ title, subtitle }, index) => {
            const Icon = TRANSPORT_ICONS[index]
            return (
              <div
                key={title}
                className="bg-white border border-[#f0f0ee] flex gap-4 items-center p-4 rounded-3xl"
              >
                <span className="size-12 shrink-0 flex items-center justify-center text-black" aria-hidden>
                  <Icon size={28} strokeWidth={1.5} />
                </span>
                <div className="flex flex-col gap-1">
                  <p className="font-bold text-[18px] leading-6 text-black font-[family-name:var(--font-jakarta)]">
                    {title}
                  </p>
                  <p className="text-[#575757] text-base leading-6">{subtitle}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
