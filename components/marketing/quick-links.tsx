import Link from 'next/link'
import { ArrowIcon } from './ui/arrow-icon'

const timerIcon = 'https://www.figma.com/api/mcp/asset/29d116cd-339b-441d-b2ce-7276e7b6152f'
const phoneIcon = 'https://www.figma.com/api/mcp/asset/bed7d8ac-53db-4ec1-879a-cb14b8a4be1f'
const mapIcon = 'https://www.figma.com/api/mcp/asset/bf6f25ae-9c96-4c95-b45b-04cc3ea7fe93'

const LINKS = [
  { icon: timerIcon, label: 'Parduotuvių darbo laikai', href: '/darbo-laikai', iconBg: 'bg-[#e6ffd1]' },
  { icon: phoneIcon, label: 'Kontaktai', href: '/kontaktai', iconBg: 'bg-[#fef3f9]' },
  { icon: mapIcon, label: 'Prekybos centro planas', href: '/planas', iconBg: 'bg-[#fdf567]' },
]

export function QuickLinks() {
  return (
    <section className="flex flex-col md:flex-row gap-3 w-full max-w-[1300px] mx-auto px-4 lg:px-0 py-6 md:py-8 lg:py-12">
      {LINKS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="bg-[#fafbfc] flex flex-1 items-center justify-between p-4 md:p-5 lg:p-6 rounded-[16px] lg:rounded-[20px] transition-[transform,background-color] duration-150 hover:bg-[#f0f1f2] active:scale-[0.97]"
        >
          <div className="flex items-center gap-3 lg:gap-4">
            <div className={`${item.iconBg} rounded-[8px] size-12 md:size-14 lg:size-[66px] relative overflow-hidden shrink-0`}>
              <img
                src={item.icon}
                alt=""
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-8 md:size-9 lg:size-12"
              />
            </div>
            <span className="font-medium text-[15px] md:text-[16px] lg:text-[18px] leading-[24px] text-black">
              {item.label}
            </span>
          </div>
          <ArrowIcon className="shrink-0" />
        </Link>
      ))}
    </section>
  )
}
