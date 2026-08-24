'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Search } from 'lucide-react'
import { StoreHoursCard, type StoreHoursCardProps } from '@/components/marketing/store-hours-card'
import { HoursCardsGrid, type HoursCardData } from '@/components/marketing/hours-cards-grid'

const PAGE_SIZE = 8

type Store = Omit<StoreHoursCardProps, never>

type OpeningHoursSectionProps = {
  stores: Store[]
  heroHeading?: string
  searchPlaceholder?: string
  loadMoreButton?: string
  hoursCards?: HoursCardData[]
}

export function OpeningHoursSection({
  stores,
  heroHeading: heroHeadingProp,
  searchPlaceholder: searchPlaceholderProp,
  loadMoreButton: loadMoreButtonProp,
  hoursCards = [],
}: OpeningHoursSectionProps) {
  const t = useTranslations('darboLaikas')
  const heroHeading = heroHeadingProp ?? t('heroHeading')
  const searchPlaceholder = searchPlaceholderProp ?? t('searchPlaceholder')
  const loadMoreButton = loadMoreButtonProp ?? t('loadMoreButton')
  const [query, setQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return stores
    return stores.filter((s) => s.name.toLowerCase().includes(q))
  }, [stores, query])

  const visible = filtered.slice(0, visibleCount)
  const hasMore = filtered.length > visibleCount

  return (
    <section className="w-full">
      {/* Heading + search row */}
      <div className="flex items-end justify-between gap-6 mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-[32px] md:text-[40px] lg:text-[48px] leading-[1.1] lg:leading-[60px] tracking-[-1.5px] lg:tracking-[-2.5px] text-black font-[family-name:var(--font-jakarta)]">
            {heroHeading}
          </h1>
        </div>

        {/* Search pill */}
        <label className="hidden lg:flex bg-white gap-2 items-center pl-4 pr-5 py-2.5 rounded-full shrink-0 w-[337px] cursor-text">
          <Search size={24} className="shrink-0 text-[#575757]" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setVisibleCount(PAGE_SIZE)
            }}
            placeholder={searchPlaceholder}
            className="flex-1 bg-transparent text-[#575757] text-base leading-6 outline-none placeholder:text-[#575757]"
            aria-label={searchPlaceholder}
          />
        </label>
      </div>

      {/* Opening-hours cards — own full-width row, separate from search */}
      {hoursCards.length > 0 && <HoursCardsGrid cards={hoursCards} className="mb-6" />}

      {/* Mobile search */}
      <label className="lg:hidden flex bg-white gap-2 items-center px-4 py-2.5 rounded-full mb-6 cursor-text">
        <Search size={24} className="shrink-0 text-[#575757]" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setVisibleCount(PAGE_SIZE)
          }}
          placeholder={searchPlaceholder}
          className="flex-1 bg-transparent text-[#575757] text-base leading-6 outline-none placeholder:text-[#575757]"
          aria-label={searchPlaceholder}
        />
      </label>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {visible.map((store) => (
          <StoreHoursCard key={store.id} {...store} />
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center mt-10">
          <button
            type="button"
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="bg-white text-black font-normal text-sm leading-4 px-7 py-4 rounded-full border border-[#e5e5e3] hover:bg-[#f0f0ee] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            {loadMoreButton}
          </button>
        </div>
      )}
    </section>
  )
}
