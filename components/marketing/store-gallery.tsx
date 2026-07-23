'use client'

import { useState, useCallback } from 'react'
import { resizeSupabaseImage } from '@/lib/utils/supabase-image'

interface StoreGalleryProps {
  images: string[]
  name: string
}

export function StoreGallery({ images, name }: StoreGalleryProps) {
  const [active, setActive] = useState(0)

  const prev = useCallback(() => setActive((i) => (i - 1 + images.length) % images.length), [images.length])
  const next = useCallback(() => setActive((i) => (i + 1) % images.length), [images.length])

  if (images.length === 0) {
    return (
      <div className="relative w-full h-[320px] md:h-[480px] rounded-[32px] lg:rounded-[40px] bg-[#e8e8e4] flex items-center justify-center overflow-hidden">
        <span className="font-bold text-[64px] text-black/10 tracking-[-3px] select-none">
          {name.slice(0, 2).toUpperCase()}
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative w-full h-[320px] md:h-[480px] rounded-[32px] lg:rounded-[40px] overflow-hidden bg-[#e8e8e4]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={active}
          src={resizeSupabaseImage(images[active], { width: 1200, height: 960, quality: 90 })}
          alt={`${name} — nuotrauka ${active + 1}`}
          className="absolute inset-0 size-full object-cover"
        />

        {/* Nav arrows — only when multiple images */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Ankstesnė nuotrauka"
              className="absolute left-4 top-1/2 -translate-y-1/2 size-11 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-colors shadow-sm"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M19 12H5M5 12L11 18M5 12L11 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={next}
              aria-label="Kita nuotrauka"
              className="absolute right-4 top-1/2 -translate-y-1/2 size-11 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-colors shadow-sm"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`Nuotrauka ${i + 1}`}
                  className={`rounded-full transition-all duration-200 ${i === active ? 'bg-white w-5 h-1.5' : 'bg-white/50 size-1.5'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails — only when 2+ images */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Peržiūrėti nuotrauką ${i + 1}`}
              className={`relative shrink-0 h-[72px] w-[100px] rounded-[16px] overflow-hidden transition-all duration-150 ${
                i === active ? 'ring-2 ring-black' : 'opacity-60 hover:opacity-100'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resizeSupabaseImage(src, { width: 200, height: 144 })} alt="" loading="lazy" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
