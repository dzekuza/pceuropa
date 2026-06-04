'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { ArrowIcon } from './ui/arrow-icon'

const BASE = 'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets'

const SLIDES = [
  { src: `${BASE}/hero-bg.jpg`,          alt: 'PC Europa' },
  { src: `${BASE}/activities-coffee.jpg`, alt: 'PC Europa — laisvalaikis' },
  { src: `${BASE}/categories-1.jpg`,      alt: 'PC Europa — akcijos' },
  { src: `${BASE}/news-1.jpg`,            alt: 'PC Europa — naujienos' },
]

export function Hero() {
  const [current, setCurrent] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const count = SLIDES.length

  const go = useCallback((index: number) => {
    setCurrent((index + count) % count)
  }, [count])

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % count)
    }, 3000)
  }, [count])

  useEffect(() => {
    startTimer()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [startTimer])

  const handleNav = (dir: number) => {
    go(current + dir)
    startTimer()
  }

  const handleDot = (i: number) => {
    go(i)
    startTimer()
  }

  return (
    <div className="w-full max-w-[1332px] mx-auto px-4 lg:px-4 pt-4 lg:pt-6">
      <div
        className="relative h-[240px] md:h-[340px] lg:h-[460px] w-full overflow-hidden rounded-[20px] md:rounded-[32px] lg:rounded-[40px]"
        onMouseEnter={() => { if (timerRef.current) clearInterval(timerRef.current) }}
        onMouseLeave={startTimer}
      >
        {/* Slides */}
        {SLIDES.map((slide, i) => (
          <img
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
            style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
          />
        ))}

        {/* Dots — bottom center */}
        <div className="absolute bottom-4 lg:bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 lg:gap-2 z-10">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => handleDot(i)}
              aria-label={`Skaidrė ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-6 lg:w-8 h-2 bg-[#fdf567]'
                  : 'w-2 h-2 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>

        {/* Prev / Next — bottom right, desktop only */}
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
      </div>
    </div>
  )
}
