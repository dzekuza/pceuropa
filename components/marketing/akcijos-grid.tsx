'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { PromoCard, type PromoItem } from './promo-card'
import { AKCIJOS_STRINGS } from '@/lib/strings'

type FilterKey = 'all' | 'stores' | 'services' | 'food'

const PAGE_SIZE = 8

type Props = {
  items: PromoItem[]
  filterAllLabel?: string
  filterStoresLabel?: string
  filterServicesLabel?: string
  filterFoodLabel?: string
  searchPlaceholder?: string
  loadMoreLabel?: string
}

export function AkcijosGrid({
  items,
  filterAllLabel = AKCIJOS_STRINGS.filterAll,
  filterStoresLabel = AKCIJOS_STRINGS.filterStores,
  filterServicesLabel = AKCIJOS_STRINGS.filterServices,
  filterFoodLabel = AKCIJOS_STRINGS.filterFood,
  searchPlaceholder = AKCIJOS_STRINGS.searchPlaceholder,
  loadMoreLabel = AKCIJOS_STRINGS.loadMore,
}: Props) {
  const FILTERS = [
    { key: 'all', label: filterAllLabel },
    { key: 'stores', label: filterStoresLabel },
    { key: 'services', label: filterServicesLabel },
    { key: 'food', label: filterFoodLabel },
  ] as const
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')
  const [search, setSearch] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter((item) => {
      if (activeFilter !== 'all' && item.category !== activeFilter) return false
      if (q && !item.title.toLowerCase().includes(q)) return false
      return true
    })
  }, [items, search, activeFilter])

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  return (
    <div className="flex flex-col gap-8 lg:gap-10 w-full">
      {/* Filters + Search */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-wrap gap-2 lg:gap-3">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => {
                setActiveFilter(f.key)
                setVisibleCount(PAGE_SIZE)
              }}
              className={`rounded-full px-5 py-2.5 text-[14px] lg:text-[16px] font-normal leading-[20px] transition-[transform,opacity,background-color] duration-150 hover:opacity-80 active:scale-[0.97] whitespace-nowrap ${
                activeFilter === f.key
                  ? 'bg-black text-white'
                  : 'bg-white text-black border border-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-white rounded-full pl-5 pr-4 py-2.5 w-full md:w-[280px] lg:w-[337px] shrink-0">
          <Search className="size-5 text-[#575757] shrink-0" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setVisibleCount(PAGE_SIZE)
            }}
            className="flex-1 bg-transparent text-[#575757] text-[16px] leading-[24px] outline-none placeholder:text-[#575757] min-w-0"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
        {visible.map((item) => (
          <PromoCard key={item.id} item={item} />
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="bg-black text-white rounded-full px-7 py-4 text-[16px] lg:text-[18px] font-normal leading-[24px] transition-[transform,opacity] duration-150 hover:opacity-80 active:scale-[0.97]"
          >
            {loadMoreLabel}
          </button>
        </div>
      )}

      {/* Empty state */}
      {visible.length === 0 && (
        <p className="text-center text-[#575757] text-[16px] leading-[24px] py-12">
          Nieko nerasta.
        </p>
      )}
    </div>
  )
}
