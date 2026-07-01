import { Car, SquareParking, Bike, Accessibility } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { DARBO_LAIKAS_STRINGS } from '@/lib/strings'
import { DisplayHeading } from './ui/typography'

const TRANSPORT_ICONS: LucideIcon[] = [Car, SquareParking, Bike, Accessibility]

export function HowToGetHereSection() {
  return (
    <section className="bg-white w-full rounded-[32px] lg:rounded-[40px] p-6 lg:p-10 flex flex-col gap-10">
      {/* Heading */}
      <div className="flex flex-col gap-4">
        <DisplayHeading>
          {DARBO_LAIKAS_STRINGS.howToGetHereHeading}
        </DisplayHeading>
        <p className="text-[#575757] text-base leading-6">
          {DARBO_LAIKAS_STRINGS.howToGetHereSubtext}
        </p>
      </div>

      {/* Map + cards */}
      <div className="flex flex-col lg:flex-row gap-10 items-stretch">
        {/* Map */}
        <div className="relative w-full lg:flex-1 rounded-3xl overflow-hidden h-[260px] md:h-[340px] lg:h-[428px]">
          <iframe
            src="https://maps.google.com/maps?q=Europa,+Konstitucijos+pr.+7A,+Vilnius,+09308&t=&z=15&ie=UTF8&iwloc=&output=embed"
            className="absolute inset-0 size-full border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={DARBO_LAIKAS_STRINGS.mapAlt}
          />
          {/* View route button */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <a
              href="https://maps.google.com/?q=Europa,+Konstitucijos+pr.+7A,+Vilnius,+09308"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border border-white text-black text-sm leading-4 font-normal px-7 py-3 rounded-full whitespace-nowrap hover:bg-white/90 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            >
              {DARBO_LAIKAS_STRINGS.viewRouteButton}
            </a>
          </div>
        </div>

        {/* Transport cards */}
        <div className="flex flex-col gap-3 w-full lg:w-[328px] shrink-0">
          {DARBO_LAIKAS_STRINGS.transportCards.map(({ title, subtitle }, index) => {
            const Icon = TRANSPORT_ICONS[index]
            return (
              <div
                key={title}
                className="bg-white flex gap-4 items-center p-4 rounded-3xl flex-1"
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
