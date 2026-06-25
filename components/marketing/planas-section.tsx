'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'

const MAP_IMAGE: string | null = null

const FLOORS = ['Pirmas aukštas', 'Antras aukštas', 'Trečias aukštas'] as const
type Floor = (typeof FLOORS)[number]

type Store = {
  id: string
  name: string
  logoUrl: string | null
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return name.slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

export function PlanasSection({ stores }: { stores: Store[] }) {
  const [activeFloor, setActiveFloor] = useState<Floor>('Pirmas aukštas')
  const [search, setSearch] = useState('')

  const filtered = stores.filter((s) =>
    !search.trim() || s.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <section className="w-full max-w-[1332px] mx-auto px-4 py-8 lg:py-12">
      {/* Heading */}
      <h2 className="font-bold text-[32px] md:text-[40px] lg:text-[48px] leading-[1.1] tracking-[-2px] lg:tracking-[-2.5px] text-black mb-6">
        Prekybos centro planas
      </h2>

      <div className="flex gap-6 items-start">
        {/* Left sidebar */}
        <div className="shrink-0 w-full lg:w-[424px] flex flex-col gap-8 lg:h-[692px]">
          {/* Search */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 size-6 text-[#575757] pointer-events-none" />
              <input
                type="text"
                placeholder="Paieška"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white rounded-full pl-[52px] pr-5 py-[10px] text-[16px] text-[#575757] placeholder:text-[#575757] outline-none focus:ring-2 focus:ring-black/10 transition-shadow"
              />
            </div>
          </div>

          {/* Store list */}
          <div className="flex flex-col gap-1 overflow-y-auto flex-1 scrollbar-none">
            {filtered.map((store) => (
              <div
                key={store.id}
                className="bg-white flex items-center justify-between px-4 py-2 rounded-[24px]"
              >
                <div className="flex items-center gap-[17px] flex-1 min-w-0">
                  {/* Logo */}
                  {store.logoUrl ? (
                    <div className="size-14 rounded-[12px] overflow-hidden bg-white border border-[#ebebeb] shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={store.logoUrl}
                        alt={`${store.name} logotipas`}
                        className="size-full object-contain p-1"
                      />
                    </div>
                  ) : (
                    <div className="size-14 rounded-[12px] bg-[#f2f2f2] flex items-center justify-center shrink-0 font-bold text-[13px] text-black/40">
                      {getInitials(store.name)}
                    </div>
                  )}
                  <p className="font-bold text-[18px] leading-[24px] text-black truncate">
                    {store.name}
                  </p>
                </div>
                {/* Status dot */}
                <span className="size-2 rounded-full bg-[#22c55e] shrink-0 ml-4" />
              </div>
            ))}
          </div>
        </div>

        {/* Map + floor switcher */}
        <div className="hidden lg:block flex-1 relative rounded-[24px] overflow-hidden h-[692px]">
          {MAP_IMAGE ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={MAP_IMAGE} alt="Prekybos centro planas" className="size-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-[#e8e8e5]" />
          )}

          {/* Floor switcher */}
          <div className="absolute top-4 right-4 flex flex-col gap-1">
            {[...FLOORS].reverse().map((floor) => (
              <button
                key={floor}
                onClick={() => setActiveFloor(floor)}
                className={`px-7 py-3 rounded-full text-[14px] font-medium leading-[16px] transition-[background-color,color] duration-150 whitespace-nowrap ${
                  activeFloor === floor
                    ? 'bg-black text-white'
                    : 'bg-white text-black'
                }`}
              >
                {floor}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
