'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, X } from 'lucide-react'

type Store = {
  id: string
  name: string
  category: string
  logoUrl: string | null
  coverUrl: string | null
}

interface StoresDirectoryProps {
  stores: Store[]
  excludeCategories?: string[]
}

type CategoryConfig = {
  colorBg: string
  textColor: string
}

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  'Drabužiai':                { colorBg: '#b4e5ff', textColor: '#0a3a52' },
  'Grožis':                   { colorBg: '#fce4f5', textColor: '#5c1a4a' },
  'Maistas ir restoranai':    { colorBg: '#e6ffd1', textColor: '#1a4a0a' },
  'Maistas':                  { colorBg: '#e6ffd1', textColor: '#1a4a0a' },
  'Technologijos':             { colorBg: '#e0e0ff', textColor: '#1a1a6e' },
  'Paslaugos':                { colorBg: '#ffe8dc', textColor: '#5c2a0a' },
  'Sportas':                  { colorBg: '#fdf567', textColor: '#3a3200' },
  'Namai':                    { colorBg: '#f0ede6', textColor: '#3a3220' },
  'Kita':                     { colorBg: '#e8e8e8', textColor: '#444444' },
}

const FALLBACK_COLORS: CategoryConfig[] = [
  { colorBg: '#d4f0e8', textColor: '#0a3a28' },
  { colorBg: '#f5e6d4', textColor: '#5c3a0a' },
  { colorBg: '#e8d4f5', textColor: '#3a0a5c' },
  { colorBg: '#f5f0d4', textColor: '#5c520a' },
]

function getCategoryConfig(category: string, index: number): CategoryConfig {
  return CATEGORY_CONFIG[category] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length]
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return name.slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

function StoreCard({ store, colorConfig }: { store: Store; colorConfig: CategoryConfig }) {
  return (
    <Link href={`/parduotuves/${store.id}`} className="group bg-white flex flex-col gap-4 items-start p-4 rounded-[32px] lg:rounded-[40px] cursor-pointer transition-shadow duration-200 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
      {/* Top row: status + name on left, logo on right */}
      <div className="flex gap-4 items-start w-full">
        <div className="flex flex-col flex-1 min-w-0">
          {/* Status */}
          <div className="flex gap-[10px] items-center">
            <div className="size-2 rounded-full bg-[#22c55e] shrink-0" />
            <p className="font-normal leading-6 text-[#575757] text-base">Atidaryta</p>
          </div>
          {/* Store name */}
          <p className="font-bold font-[family-name:var(--font-jakarta)] leading-6 text-[18px] text-black truncate w-full">
            {store.name}
          </p>
        </div>

        {/* Logo */}
        {store.logoUrl ? (
          <div className="h-14 w-[53px] overflow-hidden rounded-xl shrink-0 bg-white border border-[#ebebeb]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={store.logoUrl} alt={`${store.name} logotipas`} className="size-full object-contain" />
          </div>
        ) : (
          <div
            className="h-14 w-[53px] rounded-xl flex items-center justify-center shrink-0 font-bold text-[13px]"
            // Runtime color from category map — Tailwind cannot handle dynamic arbitrary values
            style={{ backgroundColor: colorConfig.colorBg, color: colorConfig.textColor }}
          >
            {getInitials(store.name)}
          </div>
        )}
      </div>

      {/* Cover image */}
      <div className="relative h-[204px] rounded-[24px] w-full overflow-hidden shrink-0">
        {store.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={store.coverUrl}
            alt=""
            className="absolute inset-0 size-full object-cover rounded-[24px] transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className="absolute inset-0 rounded-[24px] flex items-center justify-center"
            // Runtime color from category map — Tailwind cannot handle dynamic arbitrary values
            style={{ backgroundColor: colorConfig.colorBg }}
          >
            <span
              className="font-bold text-[44px] leading-none tracking-[-2px] select-none opacity-40"
              // Runtime color from category map — Tailwind cannot handle dynamic arbitrary values
              style={{ color: colorConfig.textColor }}
            >
              {getInitials(store.name)}
            </span>
          </div>
        )}
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/36 rounded-[24px] pointer-events-none" />
        {/* Hours overlay */}
        <div className="absolute bottom-3 left-3 flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-white/70 text-[11px] leading-[16px] w-[36px] whitespace-nowrap">I–V</span>
            <span className="text-white text-[11px] leading-[16px]">10:00–21:00</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/70 text-[11px] leading-[16px] w-[36px] whitespace-nowrap">VI–VII</span>
            <span className="text-white text-[11px] leading-[16px]">10:00–20:00</span>
          </div>
        </div>
        {/* Arrow button */}
        <div className="absolute bottom-3 right-3 bg-white border border-white flex items-center justify-center p-4 rounded-full">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </Link>
  )
}

export function StoresDirectory({ stores, excludeCategories = [] }: StoresDirectoryProps) {
  const [activeCategory, setActiveCategory] = useState('Visos')
  const [search, setSearch] = useState('')

  const visibleStores = useMemo(
    () => excludeCategories.length ? stores.filter((s) => !excludeCategories.includes(s.category)) : stores,
    [stores, excludeCategories],
  )

  const categories = useMemo(() => {
    const unique = Array.from(new Set(visibleStores.map((s) => s.category))).sort()
    return ['Visos', ...unique]
  }, [visibleStores])

  const categoryIndexMap = useMemo(() => {
    const map: Record<string, number> = {}
    categories.slice(1).forEach((cat, i) => { map[cat] = i })
    return map
  }, [categories])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return visibleStores.filter((s) => {
      const matchCat = activeCategory === 'Visos' || s.category === activeCategory
      const matchSearch = !q || s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
      return matchCat && matchSearch
    })
  }, [visibleStores, activeCategory, search])

  return (
    <section className="w-full max-w-[1332px] mx-auto px-4 py-8 md:py-10 lg:py-14">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between mb-8 md:mb-10">
        {/* Search — full width on mobile, fixed on desktop */}
        <div className="relative w-full md:order-last md:shrink-0 md:w-[280px] lg:w-[337px]">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 size-6 text-[#575757] pointer-events-none" />
          <input
            type="text"
            placeholder="Paieška"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white rounded-full pl-[52px] pr-5 py-[10px] text-[16px] text-[#575757] placeholder:text-[#575757] outline-none focus:ring-2 focus:ring-black/10 transition-shadow duration-150"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-black/30 hover:text-black/60 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter pills — horizontal scroll on mobile, wrap on desktop */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap md:flex-1">
          {categories.map((cat) => {
            const isActive = activeCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 inline-flex items-center rounded-full px-7 py-3 text-[14px] leading-[20px] transition-[background-color,color] duration-150 active:scale-[0.97] whitespace-nowrap border ${isActive ? 'bg-black text-white border-black' : 'bg-white text-black border-[#e5e5e3]'}`}
              >
                {cat === 'Visos' ? 'Visi' : cat}
              </button>
            )
          })}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {filtered.map((store) => (
            <StoreCard
              key={store.id}
              store={store}
              colorConfig={getCategoryConfig(store.category, categoryIndexMap[store.category] ?? 0)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-[#f2f2f2] rounded-full size-16 flex items-center justify-center mb-4">
            <Search size={24} className="text-black/30" />
          </div>
          <p className="font-semibold text-[18px] text-black mb-1">Nieko nerasta</p>
          <p className="text-[14px] text-black/40">
            Bandykite keisti paieškos užklausą arba kategoriją
          </p>
        </div>
      )}
    </section>
  )
}
