'use client'

import { useState, useMemo } from 'react'
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
    <div className="group bg-white rounded-[20px] overflow-hidden border border-[#ebebeb] hover:border-[#d0d0d0] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] active:scale-[0.98] cursor-pointer">
      {/* Cover / banner area */}
      <div
        className="h-[100px] md:h-[120px] flex items-center justify-center relative overflow-hidden"
        style={store.coverUrl ? undefined : { backgroundColor: colorConfig.colorBg }}
      >
        {store.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={store.coverUrl}
            alt=""
            className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span
            className="font-bold text-[38px] md:text-[44px] leading-none tracking-[-2px] select-none transition-transform duration-300 group-hover:scale-110"
            style={{ color: colorConfig.textColor, opacity: 0.55 }}
          >
            {getInitials(store.name)}
          </span>
        )}
      </div>

      {/* Card body */}
      <div className="p-4 flex items-center gap-3">
        {/* Logo */}
        {store.logoUrl ? (
          <div className="size-10 rounded-xl overflow-hidden border border-[#ebebeb] bg-white shrink-0 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={store.logoUrl} alt={`${store.name} logotipas`} className="size-full object-contain p-0.5" />
          </div>
        ) : (
          <div
            className="size-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-[13px]"
            style={{ backgroundColor: colorConfig.colorBg, color: colorConfig.textColor }}
          >
            {getInitials(store.name)}
          </div>
        )}

        <div className="flex flex-col gap-1 min-w-0">
          <p className="font-semibold text-[15px] md:text-[16px] leading-[20px] text-black truncate">
            {store.name}
          </p>
          <span
            className="inline-flex items-center rounded-full px-2.5 py-[3px] text-[12px] font-medium leading-[18px] w-fit"
            style={{ backgroundColor: colorConfig.colorBg, color: colorConfig.textColor }}
          >
            {store.category}
          </span>
        </div>
      </div>
    </div>
  )
}

export function StoresDirectory({ stores }: StoresDirectoryProps) {
  const [activeCategory, setActiveCategory] = useState('Visos')
  const [search, setSearch] = useState('')

  const categories = useMemo(() => {
    const unique = Array.from(new Set(stores.map((s) => s.category))).sort()
    return ['Visos', ...unique]
  }, [stores])

  const categoryIndexMap = useMemo(() => {
    const map: Record<string, number> = {}
    categories.slice(1).forEach((cat, i) => { map[cat] = i })
    return map
  }, [categories])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return stores.filter((s) => {
      const matchCat = activeCategory === 'Visos' || s.category === activeCategory
      const matchSearch = !q || s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
      return matchCat && matchSearch
    })
  }, [stores, activeCategory, search])

  return (
    <section className="w-full max-w-[1300px] mx-auto px-4 lg:px-0 py-8 md:py-10 lg:py-14">
      <div className="flex flex-col gap-4 mb-8 md:mb-10">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 lg:mx-0 lg:px-0 lg:flex-wrap">
          {categories.map((cat) => {
            const isActive = activeCategory === cat
            const config = cat !== 'Visos' ? getCategoryConfig(cat, categoryIndexMap[cat]) : null
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="shrink-0 inline-flex items-center rounded-full px-4 py-[7px] text-[14px] font-medium leading-[20px] transition-[transform,opacity,background-color,box-shadow] duration-150 active:scale-[0.97] whitespace-nowrap"
                style={
                  isActive
                    ? {
                        backgroundColor: config ? config.colorBg : '#181818',
                        color: config ? config.textColor : '#ffffff',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                      }
                    : { backgroundColor: '#f2f2f2', color: '#555' }
                }
              >
                {cat === 'Visos' ? 'Visos kategorijos' : cat}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-[360px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-black/30 pointer-events-none" />
            <input
              type="text"
              placeholder="Ieškoti parduotuvės..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#f2f2f2] rounded-full pl-10 pr-10 py-[9px] text-[14px] font-medium text-black placeholder:text-black/30 outline-none focus:ring-2 focus:ring-[#181818]/10 transition-shadow duration-150"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-black/30 hover:text-black/60 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <p className="text-[14px] text-black/40 font-medium whitespace-nowrap">
            {filtered.length} {filtered.length === 1 ? 'parduotuvė' : filtered.length < 10 ? 'parduotuvės' : 'parduotuvių'}
          </p>
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
