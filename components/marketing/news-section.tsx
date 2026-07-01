'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { DisplayHeading } from './ui/typography'
import { ArrowIcon } from './ui/arrow-icon'

const news = [
  {
    image: 'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/news-1.jpg',
    title: 'Papildoma nuolaida Rieker!',
    date: 'Nuo 2026.03.25 iki 2026.03.29',
    href: '/akcijos/rieker',
    imageRounded: 'rounded-[40px]',
  },
  {
    image: 'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/news-2.jpg',
    title: 'Kvepia pavasariu',
    date: 'Nuo 2026.03.25 iki 2026.03.29',
    href: '/akcijos/pavasaris',
    imageRounded: 'rounded-[20px]',
  },
  {
    image: 'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/news-3.jpg',
    title: 'Kvepia pavasariu',
    date: 'Nuo 2026.03.25 iki 2026.03.29',
    href: '/akcijos/samsung',
    imageRounded: 'rounded-[20px]',
  },
  {
    image: 'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/news-4.jpg',
    title: 'Kvepia pavasariu',
    date: 'Nuo 2026.03.25 iki 2026.03.29',
    href: '/akcijos/vision-express',
    imageRounded: 'rounded-[20px]',
  },
]

export function NewsSection() {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'right' ? 320 : -320, behavior: 'smooth' })
  }

  return (
    <section className="flex flex-col gap-8 lg:gap-12 items-center w-full max-w-[1332px] mx-auto px-4 py-6 md:py-8 lg:py-12">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <DisplayHeading>Akcijos ir naujienos</DisplayHeading>
        <Link
          href="/akcijos"
          prefetch={false}
          className="hidden md:flex items-center gap-2"
          aria-label="Daugiau akcijų ir naujienų"
        >
          <span className="inline-flex items-center justify-center bg-black text-white rounded-full px-7 py-4 text-[18px] font-normal leading-[24px] font-['Geist'] transition-opacity duration-150 hover:opacity-80">
            Daugiau
          </span>
          <span className="group inline-flex items-center justify-center bg-black rounded-full size-[56px] transition-opacity duration-150 hover:opacity-80 active:scale-95">
            <ArrowIcon className="text-white size-6 transition-transform duration-150 group-hover:rotate-[-25deg]" />
          </span>
        </Link>
      </div>

      {/* Cards — 4-column grid on desktop, horizontal scroll on mobile */}
      <div className="relative w-full">
        {/* Mobile scroll */}
        <div
          ref={scrollRef}
          className="flex gap-4 lg:hidden overflow-x-auto scrollbar-hide snap-x snap-mandatory"
        >
          {news.map((item) => (
            <NewsCard key={item.href} item={item} />
          ))}
        </div>

        {/* Desktop 4-column grid */}
        <div className="hidden lg:grid grid-cols-4 gap-6">
          {news.map((item) => (
            <NewsCard key={item.href} item={item} />
          ))}
        </div>

        {/* Mobile chevrons */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-2 top-[118px] -translate-y-1/2 bg-black rounded-[20px] size-10 flex items-center justify-center rotate-180 transition-[transform,opacity] duration-150 hover:opacity-70 active:scale-90 z-10 lg:hidden"
          aria-label="Ankstesnis"
        >
          <ArrowIcon className="text-white size-5" />
        </button>
        <button
          onClick={() => scroll('right')}
          className="absolute right-2 top-[118px] -translate-y-1/2 bg-black rounded-[20px] size-10 flex items-center justify-center transition-[transform,opacity] duration-150 hover:opacity-70 active:scale-90 z-10 lg:hidden"
          aria-label="Kitas"
        >
          <ArrowIcon className="text-white size-5" />
        </button>
      </div>

      {/* Mobile "Daugiau" button */}
      <Link
        href="/akcijos"
        prefetch={false}
        className="md:hidden flex items-center gap-2"
      >
        <span className="inline-flex items-center justify-center bg-black text-white rounded-full px-6 py-3 text-[16px] font-normal leading-[24px]">
          Daugiau
        </span>
        <span className="inline-flex items-center justify-center bg-black rounded-full size-[48px]">
          <ArrowIcon className="text-white size-5" />
        </span>
      </Link>
    </section>
  )
}

type NewsItem = (typeof news)[number]

function NewsCard({ item }: { item: NewsItem }) {
  return (
    <Link
      href={item.href}
      prefetch={false}
      className="flex flex-col gap-6 shrink-0 group snap-start w-[280px] lg:w-auto"
    >
      {/* Image */}
      <div className={`relative w-full h-[236px] ${item.imageRounded} overflow-hidden`}>
        <img
          src={item.image}
          alt={item.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 [transition-timing-function:var(--ease-out)]"
        />
      </div>

      {/* Info row */}
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-2 min-w-0">
          <p className="font-bold text-[18px] leading-[24px] text-black font-['Plus_Jakarta_Sans'] break-words">
            {item.title}
          </p>
          <p className="font-normal text-[16px] leading-[24px] text-[#575757]">
            {item.date}
          </p>
        </div>
        <span className="inline-flex items-center justify-center bg-black rounded-full size-[56px] shrink-0 transition-opacity duration-150 group-hover:opacity-70">
          <ArrowIcon className="text-white size-6 transition-transform duration-150 group-hover:rotate-[-25deg]" />
        </span>
      </div>
    </Link>
  )
}
