import type React from 'react'
import { DisplayHeading } from './ui/typography'
import { ArrowIcon } from './ui/arrow-icon'

const SOCIALS = [
  { label: 'Instagram', href: 'https://instagram.com', bg: 'bg-[#fdf567]' },
  { label: 'Facebook', href: 'https://facebook.com', bg: 'bg-[#b4e5ff]' },
  { label: 'Tik Tok', href: 'https://tiktok.com', bg: 'bg-[#e6ffd1]' },
]

export interface SocialItem {
  label: string
  href: string
}

export interface SocialSectionProps {
  heading?: React.ReactNode
  socials?: SocialItem[]
}

function safeHref(href: string): string {
  try {
    const url = new URL(href)
    return ['https:', 'http:'].includes(url.protocol) ? href : '#'
  } catch { return '#' }
}

export function SocialSection({ heading, socials }: SocialSectionProps = {}) {
  const items = socials && socials.length > 0
    ? socials.map((s, i) => ({ ...SOCIALS[i % SOCIALS.length], ...s }))
    : SOCIALS

  return (
    <section className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 md:gap-8 w-full max-w-[1332px] mx-auto px-4 py-6 md:py-8 lg:py-12">
      <DisplayHeading>{heading || 'Sekite mus'}</DisplayHeading>
      <div className="flex flex-wrap gap-3">
        {items.map((social) => (
          <a
            key={social.label}
            href={safeHref(social.href)}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-3 lg:gap-[18px] ${social.bg} rounded-full px-4 lg:px-5 py-2.5 lg:py-[15px] text-[14px] lg:text-[16px] font-medium leading-[24px] text-black transition-[transform,opacity] duration-150 hover:opacity-80 active:scale-[0.97]`}
          >
            {social.label}
            <ArrowIcon />
          </a>
        ))}
      </div>
    </section>
  )
}
