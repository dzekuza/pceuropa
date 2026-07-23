import Link from 'next/link'
import { resizeSupabaseImage } from '@/lib/utils/supabase-image'

const logoUrl = '/pc-europa-logo.svg'
const facebookIcon = 'https://ybyyxcuvxuzrledbitky.supabase.co/storage/v1/object/public/marketing-assets/footer-facebook.svg'
const instagramIcon = 'https://ybyyxcuvxuzrledbitky.supabase.co/storage/v1/object/public/marketing-assets/footer-instagram.svg'

const NAV_LINKS = [
  { label: 'Nuomininkams', href: 'https://nuomininkai.pceuropa.lt/' },
  { label: 'Patalpų nuoma ir reklama', href: '/nuoma-reklama' },
]

const VISITOR_LINKS = [
  { label: 'Prekybos centro taisyklės', href: '/taisykles' },
  { label: 'Slapukų politika', href: '/slapuku-politika' },
  { label: 'Privatumo politika', href: '/privatumo-politika' },
  { label: 'Parkavimas', href: '/parkavimas' },
  { label: 'Kontaktai', href: '/kontaktai' },
]

export function Footer() {
  return (
    <footer className="w-full bg-[#181818] rounded-t-[20px] font-[family-name:var(--font-montserrat)]">
      <div className="max-w-[1332px] mx-auto flex flex-col gap-8 md:gap-10 items-center px-4 py-8 lg:py-12">
        <div className="flex flex-col md:flex-row items-start gap-8 md:gap-16 lg:gap-24 md:justify-between w-full">
          {/* Logo */}
          <div className="w-full max-w-[260px] lg:max-w-[320px]">
            <img
              src={logoUrl}
              alt="PC Europa"
              width={195}
              height={48}
              className="w-auto h-10 md:h-12 lg:h-14 max-w-full"
            />
          </div>

          {/* Links */}
          <div className="flex flex-row gap-8 md:gap-12 lg:gap-[86px] items-start">
            <div className="flex flex-col gap-6 lg:gap-[50px]">
              <div className="flex flex-col gap-1 lg:gap-2">
                <p className="font-semibold text-[16px] lg:text-[18px] leading-[28px] text-white">Partneriams</p>
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    prefetch={false}
                    className="font-normal text-[14px] lg:text-[16px] leading-[28px] text-white transition-[transform,opacity] duration-150 hover:opacity-60 active:scale-[0.97]"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="flex flex-col gap-1">
                <p className="font-semibold text-[16px] lg:text-[18px] leading-[28px] text-white whitespace-nowrap">
                  Bendraukime
                </p>
                <div className="flex items-center gap-4 mt-1">
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                    <img src={resizeSupabaseImage(facebookIcon, { width: 48, height: 48, fit: 'contain' })} alt="Facebook" className="size-5 lg:size-6" />
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                    <img src={resizeSupabaseImage(instagramIcon, { width: 48, height: 48, fit: 'contain' })} alt="Instagram" className="size-5 lg:size-6" />
                  </a>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1 lg:gap-2">
              <p className="font-semibold text-[16px] lg:text-[18px] leading-[28px] text-white whitespace-nowrap">
                Lankytojams
              </p>
              {VISITOR_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-normal text-[14px] lg:text-[16px] leading-[28px] text-white transition-[transform,opacity] duration-150 hover:opacity-60 active:scale-[0.97]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 text-center w-full max-w-[530px] mx-auto">
          <p className="font-normal text-[13px] lg:text-[16px] leading-[24px] text-[rgba(245,241,232,0.56)]">
            2026 | Web sprendimai P.idea
          </p>
        </div>
      </div>
    </footer>
  )
}
