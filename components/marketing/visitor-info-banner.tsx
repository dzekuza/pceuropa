import { DARBO_LAIKAS_STRINGS } from '@/lib/strings'
import { resizeSupabaseImage } from '@/lib/utils/supabase-image'

const bannerBg = 'https://ybyyxcuvxuzrledbitky.supabase.co/storage/v1/object/public/marketing-assets/darbo-laikas/banner.jpg'

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  )
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.88a8.27 8.27 0 0 0 4.83 1.55V7a4.86 4.86 0 0 1-1.06-.31z" />
    </svg>
  )
}

const SOCIAL_LINKS = [
  { href: 'https://facebook.com/pceuropa', Icon: FacebookIcon, label: 'Facebook' },
  { href: 'https://instagram.com/pceuropa', Icon: InstagramIcon, label: 'Instagram' },
  { href: 'https://tiktok.com/@pceuropa', Icon: TikTokIcon, label: 'TikTok' },
]

export function VisitorInfoBanner() {
  return (
    <div className="relative w-full rounded-[32px] lg:rounded-[40px] overflow-hidden flex items-center justify-between pl-6 lg:pl-10 pr-4 py-4 min-h-[292px]">
      {/* Background */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={resizeSupabaseImage(bannerBg, { width: 1200, height: 600, quality: 90 })} alt="" className="absolute inset-0 size-full object-cover rounded-[32px] lg:rounded-[40px]" aria-hidden />
      <div className="absolute inset-0 bg-black/25 rounded-[32px] lg:rounded-[40px]" aria-hidden />

      {/* Left — heading + social icons */}
      <div className="relative flex flex-col gap-12 items-start w-[280px] md:w-[335px] shrink-0">
        <h2 className="font-bold text-[32px] md:text-[40px] lg:text-[48px] leading-[1.1] lg:leading-[60px] tracking-[-1.5px] lg:tracking-[-2.5px] text-white font-[family-name:var(--font-jakarta)]">
          {DARBO_LAIKAS_STRINGS.bannerHeading}
        </h2>
        <div className="flex gap-4 items-center">
          {SOCIAL_LINKS.map(({ href, Icon, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#f5f5f5] size-12 rounded-full flex items-center justify-center text-black hover:opacity-80 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              aria-label={label}
            >
              <Icon />
            </a>
          ))}
        </div>
      </div>

      {/* Right — contact cards */}
      <div className="relative hidden sm:flex flex-col gap-5 p-4 rounded-[40px] w-[311px] shrink-0">
        <div className="bg-[#f5f5f5] flex gap-4 items-center p-4 rounded-3xl">
          <div className="flex flex-col gap-2">
            <p className="text-[#575757] text-xs leading-4">{DARBO_LAIKAS_STRINGS.contactAdminLabel}</p>
            <div className="text-black text-base leading-6">
              <p>{DARBO_LAIKAS_STRINGS.contactAdminPhone}</p>
              <p>{DARBO_LAIKAS_STRINGS.contactAdminEmail}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#f5f5f5] flex gap-4 items-center p-4 rounded-3xl">
          <div className="flex flex-col gap-2">
            <p className="text-[#575757] text-xs leading-4">{DARBO_LAIKAS_STRINGS.contactMarketingLabel}</p>
            <p className="text-black text-base leading-6">{DARBO_LAIKAS_STRINGS.contactMarketingEmail}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
