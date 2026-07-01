'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, X } from 'lucide-react'
import { CardArrowButton } from './ui/card-arrow-button'

type Place = {
  id: string
  name: string
  category: string
  logoUrl: string | null
  coverUrl: string | null
}

interface DialogaiFoodCourtDirectoryProps {
  places: Place[]
  allowCategories?: string[]
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return name.slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

function PlaceCard({ place }: { place: Place }) {
  return (
    <Link
      href={`/parduotuves/${place.id}`}
      className="group bg-white rounded-[32px] lg:rounded-[40px] p-4 flex flex-col gap-4 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-[transform,box-shadow] duration-200"
      aria-label={place.name}
    >
      {/* Top row: info + logo */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-[#22c55e] shrink-0" />
            <span className="text-[#575757] text-[14px] leading-[24px]">Atidaryta</span>
          </div>
          <p className="font-bold text-[18px] leading-[24px] text-black truncate">
            {place.name}
          </p>
        </div>

        {place.logoUrl ? (
          <div className="size-14 rounded-[16px] overflow-hidden bg-white border border-[#ebebeb] shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={place.logoUrl}
              alt={`${place.name} logotipas`}
              className="size-full object-contain p-1"
            />
          </div>
        ) : (
          <div className="size-14 rounded-[16px] bg-[#f2f2f2] flex items-center justify-center shrink-0 font-bold text-[15px] text-black/40">
            {getInitials(place.name)}
          </div>
        )}
      </div>

      {/* Cover image */}
      <div className="relative h-[180px] md:h-[204px] rounded-[24px] overflow-hidden bg-[#e8e8e8]">
        {place.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={place.coverUrl}
            alt=""
            className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-bold text-[48px] text-black/10">{getInitials(place.name)}</span>
          </div>
        )}

        {place.coverUrl && (
          <div className="absolute inset-0 bg-black/36 rounded-[24px]" />
        )}

        <CardArrowButton />
      </div>
    </Link>
  )
}

export function DialogaiFoodCourtDirectory({ places, allowCategories }: DialogaiFoodCourtDirectoryProps) {
  const [search, setSearch] = useState('')

  const visiblePlaces = allowCategories?.length ? places.filter((p) => allowCategories.includes(p.category)) : places

  const filtered = visiblePlaces.filter((p) => {
    const q = search.toLowerCase().trim()
    return !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
  })

  return (
    <section className="w-full max-w-[1332px] mx-auto px-4 py-8 md:py-10 lg:py-14">
      {/* Search row */}
      <div className="flex justify-end mb-8 md:mb-10">
        <div className="relative w-full sm:w-[280px] lg:w-[337px]">
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
              aria-label="Išvalyti paiešką"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {filtered.map((p) => (
            <PlaceCard key={p.id} place={p} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-[#f2f2f2] rounded-full size-16 flex items-center justify-center mb-4">
            <Search size={24} className="text-black/30" />
          </div>
          <p className="font-semibold text-[18px] text-black mb-1">Nieko nerasta</p>
          <p className="text-[14px] text-black/40">
            Bandykite keisti paieškos užklausą
          </p>
        </div>
      )}
    </section>
  )
}
