export interface HoursCardData {
  label: string
  line1: string
  line2?: string
}

interface HoursCardsGridProps {
  cards: HoursCardData[]
  className?: string
}

/** Opening hours: first card renders as a bold headline, the rest as plain inline columns below it. */
export function HoursCardsGrid({ cards, className = '' }: HoursCardsGridProps) {
  if (cards.length === 0) return null

  const [headline, ...items] = cards
  const headlineHours = [headline.line1, headline.line2].filter(Boolean).join(' · ')

  return (
    <div className={`bg-[#f5f5f5] rounded-3xl px-6 py-8 sm:px-10 sm:py-10 flex flex-col items-center gap-8 ${className}`}>
      <p className="font-bold text-lg sm:text-2xl uppercase tracking-tight text-black text-center">
        {headline.label.replace(/:$/, '')} {headlineHours} val.
      </p>

      {items.length > 0 && (
        <div className="flex flex-wrap justify-center gap-x-10 gap-y-6">
          {items.map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-1 min-w-[110px]">
              <p className="text-sm font-medium text-black text-center whitespace-nowrap">{item.label.replace(/:$/, '')}</p>
              <p className="text-xs text-[#575757] text-center whitespace-nowrap">{item.line1}</p>
              {item.line2 && <p className="text-xs text-[#575757] text-center whitespace-nowrap">{item.line2}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
