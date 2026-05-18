'use client'

import { useState, useMemo } from 'react'
import { Search, X } from 'lucide-react'

type Store = {
  id: number
  name: string
  category: string
  floor: string
}

const STORES: Store[] = [
  // Drabužiai
  { id: 1, name: 'Lindex', category: 'Drabužiai', floor: '1 aukštas' },
  { id: 2, name: 'H&M', category: 'Drabužiai', floor: '1 aukštas' },
  { id: 3, name: 'Zara', category: 'Drabužiai', floor: '2 aukštas' },
  { id: 4, name: 'Reserved', category: 'Drabužiai', floor: '1 aukštas' },
  { id: 5, name: 'Mango', category: 'Drabužiai', floor: '2 aukštas' },
  { id: 6, name: 'New Yorker', category: 'Drabužiai', floor: '1 aukštas' },
  // Grožis
  { id: 7, name: 'Douglas', category: 'Grožis', floor: '1 aukštas' },
  { id: 8, name: 'Watsons', category: 'Grožis', floor: '1 aukštas' },
  { id: 9, name: 'Yves Rocher', category: 'Grožis', floor: '2 aukštas' },
  { id: 10, name: 'Inglot', category: 'Grožis', floor: '1 aukštas' },
  // Maistas
  { id: 11, name: 'Maxima', category: 'Maistas', floor: '0 aukštas' },
  { id: 12, name: 'Hesburger', category: 'Maistas', floor: '0 aukštas' },
  { id: 13, name: 'Caffè Nero', category: 'Maistas', floor: '1 aukštas' },
  // Technologijos
  { id: 14, name: 'Euronics', category: 'Technologijos', floor: '2 aukštas' },
  { id: 15, name: 'Samsung', category: 'Technologijos', floor: '1 aukštas' },
  { id: 16, name: 'iStyle', category: 'Technologijos', floor: '1 aukštas' },
  // Paslaugos
  { id: 17, name: 'Luminor', category: 'Paslaugos', floor: '1 aukštas' },
  { id: 18, name: 'Foto centras', category: 'Paslaugos', floor: '1 aukštas' },
  { id: 19, name: 'Optika Lux', category: 'Paslaugos', floor: '2 aukštas' },
  { id: 20, name: 'DPD', category: 'Paslaugos', floor: '0 aukštas' },
  // Sportas
  { id: 21, name: 'Decathlon', category: 'Sportas', floor: '0 aukštas' },
  { id: 22, name: 'SportMax', category: 'Sportas', floor: '1 aukštas' },
  // Namai
  { id: 23, name: 'JYSK', category: 'Namai', floor: '2 aukštas' },
  { id: 24, name: 'Kerama', category: 'Namai', floor: '2 aukštas' },
  { id: 25, name: 'Porta', category: 'Namai', floor: '2 aukštas' },
]

type CategoryConfig = {
  label: string
  colorBg: string
  textColor: string
}

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  Drabužiai:    { label: 'Drabužiai',     colorBg: '#b4e5ff', textColor: '#0a3a52' },
  Grožis:       { label: 'Grožis',        colorBg: '#fce4f5', textColor: '#5c1a4a' },
  Maistas:      { label: 'Maistas',       colorBg: '#e6ffd1', textColor: '#1a4a0a' },
  Technologijos:{ label: 'Technologijos', colorBg: '#e0e0ff', textColor: '#1a1a6e' },
  Paslaugos:    { label: 'Paslaugos',     colorBg: '#ffe8dc', textColor: '#5c2a0a' },
  Sportas:      { label: 'Sportas',       colorBg: '#fdf567', textColor: '#3a3200' },
  Namai:        { label: 'Namai',         colorBg: '#f0ede6', textColor: '#3a3220' },
}

const ALL_CATEGORIES = ['Visos', ...Object.keys(CATEGORY_CONFIG)]

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return name.slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

function StoreCard({ store }: { store: Store }) {
  const config = CATEGORY_CONFIG[store.category] ?? { colorBg: '#f0f0f0', textColor: '#333' }

  return (
    <div className="group bg-white rounded-[20px] overflow-hidden border border-[#ebebeb] hover:border-[#d0d0d0] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] active:scale-[0.98] cursor-pointer">
      {/* Colored top area */}
      <div
        className="h-[100px] md:h-[120px] flex items-center justify-center relative overflow-hidden"
        style={{ backgroundColor: config.colorBg }}
      >
        <span
          className="font-bold text-[38px] md:text-[44px] leading-none tracking-[-2px] select-none transition-transform duration-300 group-hover:scale-110"
          style={{ color: config.textColor, opacity: 0.55 }}
        >
          {getInitials(store.name)}
        </span>
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col gap-2">
        <p className="font-semibold text-[15px] md:text-[16px] leading-[22px] text-black">
          {store.name}
        </p>
        <div className="flex items-center justify-between gap-2">
          <span
            className="inline-flex items-center rounded-full px-2.5 py-[3px] text-[12px] font-medium leading-[18px]"
            style={{ backgroundColor: config.colorBg, color: config.textColor }}
          >
            {store.category}
          </span>
          <span className="text-[12px] text-black/40 font-medium whitespace-nowrap">
            {store.floor}
          </span>
        </div>
      </div>
    </div>
  )
}

export function StoresDirectory() {
  const [activeCategory, setActiveCategory] = useState('Visos')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return STORES.filter((s) => {
      const matchCat = activeCategory === 'Visos' || s.category === activeCategory
      const matchSearch = !q || s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
      return matchCat && matchSearch
    })
  }, [activeCategory, search])

  return (
    <section className="w-full max-w-[1300px] mx-auto px-4 lg:px-0 py-8 md:py-10 lg:py-14">
      {/* Filter bar */}
      <div className="flex flex-col gap-4 mb-8 md:mb-10">
        {/* Category pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 lg:mx-0 lg:px-0 lg:flex-wrap">
          {ALL_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat
            const config = cat !== 'Visos' ? CATEGORY_CONFIG[cat] : null
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
                    : {
                        backgroundColor: '#f2f2f2',
                        color: '#555',
                      }
                }
              >
                {cat === 'Visos' ? 'Visos kategorijos' : config?.label}
              </button>
            )
          })}
        </div>

        {/* Search + count row */}
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

      {/* Store grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {filtered.map((store) => (
            <StoreCard key={store.id} store={store} />
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
