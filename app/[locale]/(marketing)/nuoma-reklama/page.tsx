import type { Metadata } from 'next'
import { getTranslations, getLocale } from 'next-intl/server'
import { Nav } from '@/components/marketing/nav'
import { Footer } from '@/components/marketing/footer'
import { NuomaReklamaForm } from '@/components/marketing/nuoma-reklama-form'
import { resizeSupabaseImage, STORAGE_PUBLIC_BASE } from '@/lib/utils/supabase-image'
import { getPuckBlockProps } from '@/lib/page-content'

const BANNER_IMAGE = `${STORAGE_PUBLIC_BASE}/marketing-assets/nuoma-reklama/banner.jpg`

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('nuomaReklama')
  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
  }
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34l-.04-8.38a8.19 8.19 0 0 0 4.79 1.52V5c-.01 0-1.02.04-1.98-.31z" />
    </svg>
  )
}

export default async function NuomaReklamaPage() {
  const t = await getTranslations('nuomaReklama')
  const locale = await getLocale()
  const { cover } = await getPuckBlockProps('nuoma-reklama', 'NuomaReklamaBanner', { cover: BANNER_IMAGE }, locale)

  return (
    <main className="bg-[#f5f5f5] flex flex-col items-center min-h-screen font-[family-name:var(--font-jakarta)]">
      <Nav />

      {/* Banner */}
      {cover && (
        <div className="w-full max-w-[1332px] mx-auto px-4 pt-6 lg:pt-8">
          <div className="relative rounded-[24px] lg:rounded-[40px] overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-0 pl-6 lg:pl-10 pr-4 py-6 md:h-[280px] lg:h-[292px]">
            {/* Background image + overlay */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resizeSupabaseImage(cover, { width: 1200, height: 600, quality: 90 })}
              alt=""
              className="absolute inset-0 size-full object-cover pointer-events-none"
            />
            <div className="absolute inset-0 bg-black/25 pointer-events-none" />

            {/* Left: heading + socials */}
            <div className="relative flex flex-col gap-8 lg:gap-12 shrink-0 max-w-[340px]">
              <h1 className="font-bold text-[32px] md:text-[40px] lg:text-[48px] leading-[1.15] lg:leading-[60px] tracking-[-1.5px] lg:tracking-[-2.5px] text-white">
                {t('heroHeading')}
              </h1>
              <div className="flex items-center gap-3 lg:gap-[17px]">
                {[
                  { icon: <FacebookIcon />, label: 'Facebook', href: 'https://facebook.com' },
                  { icon: <InstagramIcon />, label: 'Instagram', href: 'https://instagram.com' },
                  { icon: <TikTokIcon />, label: 'TikTok', href: 'https://tiktok.com' },
                ].map(({ icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="bg-[#f5f5f5] rounded-full size-10 lg:size-12 flex items-center justify-center text-black shrink-0 transition-opacity duration-150 hover:opacity-70 active:scale-[0.95]"
                  >
                    {icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Right: contact card */}
            <div className="relative flex flex-col p-4 shrink-0">
              <div className="bg-[#f5f5f5] flex items-center gap-6 lg:gap-[45px] p-4 rounded-[20px] lg:rounded-[24px] w-full md:min-w-[240px] lg:w-[280px] md:h-[88px] lg:h-[104px]">
                <div className="flex flex-col gap-2">
                  <p className="text-[#575757] text-[11px] lg:text-[12px] leading-[16px]">
                    {t('contactCardLabel')}
                  </p>
                  <div className="flex flex-col text-black text-[14px] lg:text-[16px] leading-[24px]">
                    <span>{t('contactPhone')}</span>
                    <span className="text-[12px] lg:text-[14px] leading-[20px]">{t('contactEmail')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact form section */}
      <div className="w-full max-w-[1332px] mx-auto px-4 py-8 lg:py-12">
        <div className="bg-white rounded-[20px] lg:rounded-[24px] p-6 md:p-8 lg:p-10 overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
            {/* Left: heading + description */}
            <div className="flex flex-col gap-4 lg:gap-4 shrink-0 lg:w-[300px] xl:w-[360px]">
              <h2 className="font-bold text-[32px] lg:text-[48px] leading-[1.15] lg:leading-[60px] tracking-[-1.5px] lg:tracking-[-2.5px] text-black">
                {t('formHeading')}
              </h2>
              <p className="text-[#575757] text-[15px] lg:text-[16px] leading-[24px]">
                {t('formBody')}
              </p>
            </div>

            {/* Right: form (client component) */}
            <NuomaReklamaForm />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
