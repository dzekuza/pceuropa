import Link from 'next/link'
import { ArrowIcon } from './ui/arrow-icon'
import { resizeImage } from '@/lib/storage/resize-image'

const parkingIcon = '/api/storage/marketing-assets/parking-icon.svg'
const phoneIcon = '/api/storage/marketing-assets/phone-icon.svg'
const mapIcon = '/api/storage/marketing-assets/map-icon.svg'

const LINKS = [
  { icon: parkingIcon, label: 'Parkavimas', href: '/parkavimas', iconBg: 'bg-[#e6ffd1]' },
  { icon: mapIcon, label: 'Prekybos centro planas', href: '/planas', iconBg: 'bg-[#fdf567]' },
  { icon: phoneIcon, label: 'Kontaktai', href: '/kontaktai', iconBg: 'bg-[#fef3f9]' },
]

export interface QuickLinkItem {
  label: string
  href: string
}

export interface QuickLinksProps {
  links?: QuickLinkItem[]
}

export function QuickLinks({ links }: QuickLinksProps = {}) {
  const items = links && links.length > 0
    ? links.map((l, i) => ({ ...LINKS[i % LINKS.length], ...l }))
    : LINKS

  return (
    <section className="flex flex-col md:flex-row gap-3 w-full max-w-[1332px] mx-auto px-4 py-6 md:py-8 lg:py-12">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          prefetch={false}
          className="group bg-white text-black flex flex-1 items-center justify-between p-4 md:p-5 lg:p-6 rounded-[20px] lg:rounded-[24px] transition-[transform,background-color] duration-150 hover:bg-[#f5f5f5] active:scale-[0.97]"
        >
          <div className="flex items-center gap-3 lg:gap-4">
            <div className={`${item.iconBg} rounded-[8px] size-12 md:size-14 lg:size-[66px] relative overflow-hidden shrink-0`}>
              <img
                src={resizeImage(item.icon, { width: 64, height: 64, fit: 'contain' })}
                alt=""
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-8 md:size-9 lg:size-12"
              />
            </div>
            <span className="font-medium text-[15px] md:text-[16px] lg:text-[18px] leading-[24px] text-black">
              {item.label}
            </span>
          </div>
          <ArrowIcon className="shrink-0 transition-transform duration-150 group-hover:rotate-[-25deg]" />
        </Link>
      ))}
    </section>
  )
}
