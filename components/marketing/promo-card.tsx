import Link from 'next/link'
import { ArrowIcon } from './ui/arrow-icon'
import { resizeImage } from '@/lib/storage/resize-image'

export type PromoCategory = 'stores' | 'services' | 'food'

export type PromoItem = {
  id: string
  image: string | null
  title: string
  date: string
  href: string
  category: PromoCategory
}

export function PromoCard({ item }: { item: PromoItem }) {
  return (
    <Link
      href={item.href}
      prefetch={false}
      className="flex flex-col gap-6 group"
    >
      {/* Image */}
      <div className="relative w-full h-[236px] rounded-[32px] lg:rounded-[40px] overflow-hidden shrink-0 bg-muted">
        {item.image && (
          <img
            src={resizeImage(item.image, { width: 500, height: 472, quality: 90 })}
            alt={item.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 [transition-timing-function:var(--ease-out)]"
          />
        )}
      </div>

      {/* Info row */}
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-2 min-w-0">
          <p className="font-bold text-[18px] leading-[24px] text-black font-[family-name:var(--font-jakarta)] break-words">
            {item.title}
          </p>
          <p className="font-normal text-[16px] leading-[24px] text-[#575757]">
            {item.date}
          </p>
        </div>
        <span className="inline-flex items-center justify-center bg-black rounded-full size-[56px] shrink-0 transition-opacity duration-150 group-hover:opacity-70 active:scale-95">
          <ArrowIcon className="text-white size-6 transition-transform duration-150 group-hover:rotate-[-25deg]" />
        </span>
      </div>
    </Link>
  )
}
