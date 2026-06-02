'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { DisplayHeading } from './ui/typography'
import { ArrowIcon } from './ui/arrow-icon'

const news = [
  {
    image: 'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/news-1.jpg',
    title: 'Kvepia pavasariu',
    subtitle: 'Atrinktam namų jaukumo asortimentui – 20%*',
    date: 'Nuo 2026.03.25 iki 2026.03.29',
    href: '/akcijos/pavasaris',
  },
  {
    image: 'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/news-2.jpg',
    title: 'Samsung Salonas',
    subtitle: 'Iki -20% nuolaida atrinktoms prekėms!',
    date: 'Nuo 2026.03.27 iki 2026.03.29',
    href: '/akcijos/samsung',
  },
  {
    image: 'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/news-3.jpg',
    title: 'Vision Express',
    subtitle: 'Atrinktam namų jaukumo asortimentui – 20%*',
    date: 'Nuo 2026.03.25 iki 2026.03.29',
    href: '/akcijos/vision-express',
  },
]

export function NewsSection() {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'right' ? 360 : -360, behavior: 'smooth' })
  }

  return (
    <section className="flex flex-col gap-8 md:gap-10 lg:gap-12 items-center w-full max-w-[1330px] mx-auto px-4 lg:px-0 py-6 md:py-8 lg:py-12">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <DisplayHeading>Akcijos ir naujienos</DisplayHeading>
        <Link
          href="/akcijos"
          className="hidden md:inline-flex items-center gap-2 lg:gap-[18px] bg-[#fdf567] rounded-full px-4 lg:px-5 py-2.5 lg:py-[15px] text-[14px] lg:text-[16px] font-medium leading-[24px] text-black transition-[transform,opacity] duration-150 hover:opacity-80 active:scale-[0.97] shrink-0"
        >
          Daugiau
          <ArrowIcon />
        </Link>
      </div>

      {/* Cards — horizontal scroll with absolute chevrons */}
      <div className="relative w-full">
        <div
          ref={scrollRef}
          className="flex gap-4 md:gap-6 lg:gap-10 w-full overflow-x-auto scrollbar-hide snap-x snap-mandatory"
        >
          {news.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col gap-3 lg:gap-4 shrink-0 group snap-start w-[280px] md:w-[340px] lg:w-auto"
            >
              <div className="relative w-full lg:size-[416px] aspect-square rounded-[16px] lg:rounded-[20px] overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 [transition-timing-function:var(--ease-out)]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-bold text-[20px] md:text-[24px] lg:text-[32px] leading-[1.3] lg:leading-[40px] tracking-[-0.5px] lg:tracking-[-1.5px] text-black">
                  {item.title}
                </h3>
                <p className="font-bold text-[14px] md:text-[16px] lg:text-[18px] leading-[1.4] lg:leading-[32px] text-black">
                  {item.subtitle}
                </p>
                <p className="font-normal text-[14px] md:text-[15px] lg:text-[16px] leading-[24px] text-black">
                  {item.date}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Chevrons — absolute over the image area */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-2 top-[140px] md:top-[170px] lg:top-[208px] -translate-y-1/2 bg-black rounded-[20px] lg:rounded-[24px] size-10 lg:size-12 flex items-center justify-center rotate-180 transition-[transform,opacity] duration-150 hover:opacity-70 active:scale-90 z-10"
          aria-label="Ankstesnis"
        >
          <ArrowIcon className="text-white size-5 lg:size-[22px]" />
        </button>
        <button
          onClick={() => scroll('right')}
          className="absolute right-2 top-[140px] md:top-[170px] lg:top-[208px] -translate-y-1/2 bg-black rounded-[20px] lg:rounded-[24px] size-10 lg:size-12 flex items-center justify-center transition-[transform,opacity] duration-150 hover:opacity-70 active:scale-90 z-10"
          aria-label="Kitas"
        >
          <ArrowIcon className="text-white size-5 lg:size-[22px]" />
        </button>
      </div>

      {/* Mobile learn more button */}
      <Link
        href="/akcijos"
        className="md:hidden inline-flex items-center gap-2 bg-[#fdf567] rounded-full px-4 py-2.5 text-[14px] font-medium leading-[24px] text-black transition-[transform,opacity] duration-150 hover:opacity-80 active:scale-[0.97]"
      >
        Daugiau
        <ArrowIcon />
      </Link>
    </section>
  )
}
