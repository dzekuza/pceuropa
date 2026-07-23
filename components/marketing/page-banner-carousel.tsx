'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { ArrowIcon } from './ui/arrow-icon'
import { resizeSupabaseImage } from '@/lib/utils/supabase-image'

interface PageBannerCarouselProps {
  slides: (string | null)[]
}

export function PageBannerCarousel({ slides }: PageBannerCarouselProps) {
  const valid = slides.filter((s): s is string => !!s)
  const count = valid.length

  const [current, setCurrent] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const go = useCallback((index: number) => {
    setCurrent((index + count) % count)
  }, [count])

  const startTimer = useCallback(() => {
    if (count <= 1) return
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % count), 3000)
  }, [count])

  useEffect(() => {
    startTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [startTimer])

  const handleNav = (dir: number) => { go(current + dir); startTimer() }
  const handleDot = (i: number) => { go(i); startTimer() }

  return (
    <div className="w-full max-w-[1332px] mx-auto px-4 pt-4 lg:pt-6">
      <div
        className="relative h-[240px] md:h-[340px] lg:h-[460px] w-full overflow-hidden rounded-[20px] md:rounded-[32px] lg:rounded-[40px]"
        onMouseEnter={() => { if (timerRef.current) clearInterval(timerRef.current) }}
        onMouseLeave={startTimer}
      >
        {count === 0 ? (
          <div className="absolute inset-0 bg-[#e8e8e5]" />
        ) : (
          valid.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={resizeSupabaseImage(src, { width: 1600, height: 920, quality: 90 })}
              alt=""
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
              style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
            />
          ))
        )}

        {count > 1 && (
          <>
            {/* Dots */}
            <div className="absolute bottom-4 lg:bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 lg:gap-2 z-10">
              {valid.map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleDot(i)}
                  aria-label={`Skaidrė ${i + 1}`}
                  className={`inline-flex items-center justify-center transition-all duration-300 group h-6 ${
                    i === current ? 'w-6 lg:w-8' : 'w-6'
                  }`}
                >
                  <span className={`rounded-full block h-2 transition-all duration-300 ${
                    i === current
                      ? 'w-6 lg:w-8 bg-[#fdf567]'
                      : 'w-2 bg-white/50 group-hover:bg-white/80'
                  }`} />
                </button>
              ))}
            </div>

            {/* Prev / Next — desktop only */}
            <div className="hidden lg:flex absolute bottom-6 right-6 gap-3 z-10">
              <button
                onClick={() => handleNav(-1)}
                className="bg-black rounded-full p-4 rotate-180 transition-[transform,opacity] duration-150 hover:opacity-70 active:scale-90"
                aria-label="Ankstesnis"
              >
                <ArrowIcon className="text-white size-6" />
              </button>
              <button
                onClick={() => handleNav(1)}
                className="bg-black rounded-full p-4 transition-[transform,opacity] duration-150 hover:opacity-70 active:scale-90"
                aria-label="Kitas"
              >
                <ArrowIcon className="text-white size-6" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
