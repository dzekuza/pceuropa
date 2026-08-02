'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { DisplayHeading } from './ui/typography'
import { ArrowIcon } from './ui/arrow-icon'
import { NEWS_SECTION_STRINGS } from '@/lib/strings'
import { resizeImage } from '@/lib/storage/resize-image'

export type NewsSectionItem = {
  image: string
  title: string
  date: string
  href: string
}

type NewsSectionProps = {
  heading?: string
  ctaLabel?: string
  items?: NewsSectionItem[]
}

export function NewsSection({
  heading = NEWS_SECTION_STRINGS.heading,
  ctaLabel = NEWS_SECTION_STRINGS.ctaLabel,
  items = NEWS_SECTION_STRINGS.items as unknown as NewsSectionItem[],
}: NewsSectionProps) {
  const news = items.map((item, index) => ({
    ...item,
    imageRounded: index === 0 ? 'rounded-[40px]' : 'rounded-[20px]',
  }))
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
        <DisplayHeading>{heading}</DisplayHeading>
        <Link
          href="/akcijos"
          prefetch={false}
          className="hidden md:flex items-center gap-2"
          aria-label={`${ctaLabel} akcijų ir naujienų`}
        >
          <span className="inline-flex items-center justify-center bg-black text-white rounded-full px-7 py-4 text-[18px] font-normal leading-[24px] font-['Geist'] transition-opacity duration-150 hover:opacity-80">
            {ctaLabel}
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

      {/* Mobile CTA button */}
      <Link
        href="/akcijos"
        prefetch={false}
        className="md:hidden flex items-center gap-2"
      >
        <span className="inline-flex items-center justify-center bg-black text-white rounded-full px-6 py-3 text-[16px] font-normal leading-[24px]">
          {ctaLabel}
        </span>
        <span className="inline-flex items-center justify-center bg-black rounded-full size-[48px]">
          <ArrowIcon className="text-white size-5" />
        </span>
      </Link>
    </section>
  )
}

type NewsItem = NewsSectionItem & { imageRounded: string }

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
          src={resizeImage(item.image, { width: 500, height: 472, quality: 90 })}
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
