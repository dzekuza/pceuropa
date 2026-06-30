import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { DARBO_LAIKAS_STRINGS } from '@/lib/strings'

export type HoursEntry = {
  days: string
  hours: string
}

export type StoreHoursCardProps = {
  id: string
  name: string
  logoUrl: string | null
  logoAlt: string
  coverUrl: string | null
  isOpen: boolean
  weekdayHours: HoursEntry
  weekendHours: HoursEntry
  href: string
}

function StatusDot({ isOpen }: { isOpen: boolean }) {
  return (
    <span
      className={`inline-block size-2 rounded-full shrink-0 ${isOpen ? 'bg-[#22c55e]' : 'bg-red-400'}`}
      aria-hidden
    />
  )
}

export function StoreHoursCard({
  name,
  logoUrl,
  logoAlt,
  coverUrl,
  isOpen,
  weekdayHours,
  weekendHours,
  href,
}: StoreHoursCardProps) {
  const statusLabel = isOpen
    ? DARBO_LAIKAS_STRINGS.openStatus
    : DARBO_LAIKAS_STRINGS.closedStatus

  return (
    <article className="bg-white flex flex-col gap-4 items-start p-4 rounded-[32px] lg:rounded-[40px] w-full">
      {/* Top row: status + name + logo */}
      <div className="flex gap-4 items-start w-full">
        <div className="flex flex-col flex-1 min-w-0 items-start">
          <div className="flex gap-2.5 items-center w-full">
            <StatusDot isOpen={isOpen} />
            <span className="text-[#575757] text-base leading-6 font-normal">{statusLabel}</span>
          </div>
          <p className="font-bold text-[18px] leading-6 text-black font-[family-name:var(--font-jakarta)] w-full truncate">
            {name}
          </p>
        </div>
        {logoUrl && (
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg flex items-center justify-center">
            <img
              src={logoUrl}
              alt={logoAlt}
              className="size-full object-contain"
            />
          </div>
        )}
      </div>

      {/* Cover image with hours overlay + arrow button */}
      <div className="relative w-full h-[204px] rounded-3xl overflow-hidden shrink-0">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[#e5e5e3]" />
        )}
        <div className="absolute inset-0 bg-black/36 rounded-3xl" aria-hidden />

        {/* Hours overlay */}
        <div className="absolute bottom-3 left-4 text-white text-xs leading-4 font-normal space-y-0.5">
          <div className="flex gap-6">
            <span className="w-16">{weekdayHours.days}</span>
            <span>{weekdayHours.hours}</span>
          </div>
          <div className="flex gap-6">
            <span className="w-16">{weekendHours.days}</span>
            <span>{weekendHours.hours}</span>
          </div>
        </div>

        {/* Arrow button */}
        <Link
          href={href}
          prefetch={false}
          className="absolute bottom-3 right-3 bg-white border border-white rounded-full p-4 flex items-center justify-center hover:bg-white/90 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          aria-label={`Peržiūrėti ${name}`}
        >
          <ArrowRight size={24} aria-hidden className="text-black" />
        </Link>
      </div>
    </article>
  )
}
