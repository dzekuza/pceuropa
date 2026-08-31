import type React from 'react'
import { Link } from '@/i18n/navigation'
import { ArrowIcon } from './ui/arrow-icon'
import { resizeSupabaseImage, STORAGE_PUBLIC_BASE } from '@/lib/utils/supabase-image'

const imgCat1 = `${STORAGE_PUBLIC_BASE}/marketing-assets/categories-1.jpg`
const imgCat2 = `${STORAGE_PUBLIC_BASE}/marketing-assets/categories-2.jpg`
const imgCat3 = `${STORAGE_PUBLIC_BASE}/marketing-assets/categories-3.jpg`
const imgCat4 = `${STORAGE_PUBLIC_BASE}/marketing-assets/categories-4.jpg`

const CATEGORIES = [
  { title: 'Akcijos ir naujienos', href: '/akcijos', image: imgCat1 },
  { title: 'Dialogai maisto erdvė', href: '/dialogai', image: imgCat3 },
  { title: 'Restoranai ir kavinės', href: '/restoranai', image: imgCat2 },
  { title: 'Parduotuvės ir paslaugos', href: '/parduotuves', image: imgCat4 },
]

export interface CategoryItem {
  title: string
  href: string
  image: string
}

export interface CategoriesSectionProps {
  heading?: React.ReactNode
  categories?: CategoryItem[]
}

export function CategoriesSection({ heading, categories }: CategoriesSectionProps = {}) {
  const items = categories && categories.length > 0 ? categories : CATEGORIES
  const h = heading || 'Čia rasite'

  return (
    <section className="w-full max-w-[1332px] mx-auto px-4 py-2 md:py-4">
      <div className="bg-white flex flex-col gap-6 lg:gap-12 p-5 md:p-8 lg:p-[40px] rounded-[24px] lg:rounded-[32px]">
        {/* Header */}
        <div className="flex flex-row items-end justify-between gap-4">
          <h2 className="text-[36px] lg:text-[48px] font-bold leading-[1.2] lg:leading-[60px] tracking-[-2px] lg:tracking-[-2.5px] text-black">
            {h}
          </h2>
        </div>

        {/* 4 category cards */}
        <div className="grid grid-cols-2 lg:flex gap-3 lg:gap-6">
          {items.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              prefetch={false}
              className="relative flex flex-col justify-end h-[160px] md:h-[220px] lg:h-[280px] rounded-[16px] lg:rounded-[24px] overflow-hidden group lg:flex-1 lg:min-w-0 lg:transition-[flex-grow] lg:duration-500 lg:ease-out-custom lg:hover:flex-[2.2]"
            >
              <img
                src={resizeSupabaseImage(cat.image, { width: 500, height: 560, quality: 90 })}
                alt={cat.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ease-out-custom"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,0,0.21)] via-transparent to-[rgba(0,0,0,0.7)] from-0% via-50%" />
              <div className="relative flex items-center justify-between px-3 md:px-4 py-3 md:py-4 gap-2">
                <p className="font-bold text-[14px] md:text-[16px] lg:text-[20px] leading-[1.2] lg:leading-[24px] tracking-[-0.5px] text-[#f5f5f5] w-[60%]">
                  {cat.title}
                </p>
                <span className="bg-[#fdf567] text-black rounded-full p-2.5 md:p-3 lg:p-4 flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:scale-110">
                  <ArrowIcon className="size-3.5 md:size-4 lg:size-6 transition-transform duration-150 group-hover:rotate-[-25deg]" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
