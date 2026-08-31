import { getTranslations } from 'next-intl/server'
import { resizeSupabaseImage, STORAGE_PUBLIC_BASE } from '@/lib/utils/supabase-image'
import { TrackedLink } from '@/components/marketing/tracked-link'

const DEFAULT_BANNER_BG = `${STORAGE_PUBLIC_BASE}/marketing-assets/darbo-laikas/banner.jpg`

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

async function AdminContactCard({ location }: { location: string }) {
  const t = await getTranslations('darboLaikas')
  const contactAdminPhone = t('contactAdminPhone')
  const contactAdminEmail = t('contactAdminEmail')

  return (
    <div className="bg-[#f5f5f5] flex gap-4 items-center p-4 rounded-3xl">
      <div className="flex flex-col gap-2">
        <p className="text-[#575757] text-xs leading-4">{t('contactAdminLabel')}</p>
        <div className="text-black text-base leading-6">
          <p>
            <TrackedLink
              href={`tel:${contactAdminPhone.replace(/\s+/g, '')}`}
              eventName="contact_click"
              eventParams={{ method: 'phone', location }}
              className="hover:underline"
            >
              {contactAdminPhone}
            </TrackedLink>
          </p>
          <p>
            <TrackedLink
              href={`mailto:${contactAdminEmail}`}
              eventName="contact_click"
              eventParams={{ method: 'email', location }}
              className="hover:underline"
            >
              {contactAdminEmail}
            </TrackedLink>
          </p>
        </div>
      </div>
    </div>
  )
}

async function MarketingContactCard({ location }: { location: string }) {
  const t = await getTranslations('darboLaikas')
  const contactMarketingEmail = t('contactMarketingEmail')

  return (
    <div className="bg-[#f5f5f5] flex gap-4 items-center p-4 rounded-3xl">
      <div className="flex flex-col gap-2">
        <p className="text-[#575757] text-xs leading-4">{t('contactMarketingLabel')}</p>
        <p className="text-black text-base leading-6">
          <TrackedLink
            href={`mailto:${contactMarketingEmail}`}
            eventName="contact_click"
            eventParams={{ method: 'email', location }}
            className="hover:underline"
          >
            {contactMarketingEmail}
          </TrackedLink>
        </p>
      </div>
    </div>
  )
}

interface VisitorInfoBannerProps {
  heading?: string
  variant?: 'contact' | 'hours'
  backgroundImage?: string
}

export async function VisitorInfoBanner({
  heading: headingProp,
  variant = 'contact',
  backgroundImage = DEFAULT_BANNER_BG,
}: VisitorInfoBannerProps) {
  const t = await getTranslations('darboLaikas')
  const heading = headingProp ?? t('bannerHeading')

  if (variant === 'hours') {
    return (
      <div className="relative w-full rounded-[32px] lg:rounded-[40px] overflow-hidden flex items-center px-6 lg:px-10 py-6 min-h-[292px]">
        {/* Background */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={resizeSupabaseImage(backgroundImage, { width: 1200, height: 600, quality: 90 })} alt="" className="absolute inset-0 size-full object-cover rounded-[32px] lg:rounded-[40px]" aria-hidden />
        <div className="absolute inset-0 bg-black/25 rounded-[32px] lg:rounded-[40px]" aria-hidden />

        {/* Heading + social icons */}
        <div className="relative flex flex-col gap-8 items-start">
          <h2 className="font-bold text-[32px] md:text-[40px] lg:text-[48px] leading-[1.1] lg:leading-[60px] tracking-[-1.5px] lg:tracking-[-2.5px] text-white font-[family-name:var(--font-jakarta)]">
            {heading}
          </h2>
          <div className="flex gap-4 items-center">
            {SOCIAL_LINKS.map(({ href, Icon, label }) => (
              <TrackedLink
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                eventName="social_click"
                eventParams={{ platform: label.toLowerCase(), location: 'visitor_banner' }}
                className="bg-[#f5f5f5] size-12 rounded-full flex items-center justify-center text-black hover:opacity-80 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                aria-label={label}
              >
                <Icon />
              </TrackedLink>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full rounded-[32px] lg:rounded-[40px] overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6 sm:gap-0 pl-6 lg:pl-10 pr-4 py-4 min-h-[292px]">
      {/* Background */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={resizeSupabaseImage(backgroundImage, { width: 1200, height: 600, quality: 90 })} alt="" className="absolute inset-0 size-full object-cover rounded-[32px] lg:rounded-[40px]" aria-hidden />
      <div className="absolute inset-0 bg-black/25 rounded-[32px] lg:rounded-[40px]" aria-hidden />

      {/* Left — heading + social icons */}
      <div className="relative flex flex-col gap-12 items-start w-[280px] md:w-[335px] shrink-0">
        <h2 className="font-bold text-[32px] md:text-[40px] lg:text-[48px] leading-[1.1] lg:leading-[60px] tracking-[-1.5px] lg:tracking-[-2.5px] text-white font-[family-name:var(--font-jakarta)]">
          {heading}
        </h2>
        <div className="flex gap-4 items-center">
          {SOCIAL_LINKS.map(({ href, Icon, label }) => (
            <TrackedLink
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              eventName="social_click"
              eventParams={{ platform: label.toLowerCase(), location: 'visitor_banner' }}
              className="bg-[#f5f5f5] size-12 rounded-full flex items-center justify-center text-black hover:opacity-80 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              aria-label={label}
            >
              <Icon />
            </TrackedLink>
          ))}
        </div>
      </div>

      {/* Right — contact cards */}
      <>
        {/* Mobile — cards overlaid on the cover image */}
        <div className="relative sm:hidden flex flex-col gap-3">
          <AdminContactCard location="visitor_banner_admin_mobile" />
          <MarketingContactCard location="visitor_banner_marketing_mobile" />
        </div>

        {/* Desktop — cards stacked to the right of the heading */}
        <div className="relative hidden sm:flex flex-col gap-5 p-4 rounded-[40px] w-[311px] shrink-0">
          <AdminContactCard location="visitor_banner_admin" />
          <MarketingContactCard location="visitor_banner_marketing" />
        </div>
      </>
    </div>
  )
}
