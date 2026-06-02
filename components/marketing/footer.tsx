import Link from 'next/link'

const logoUrl = 'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/footer-logo.png'
const facebookIcon = 'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/footer-facebook.png'
const instagramIcon = 'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/footer-instagram.png'

const NAV_LINKS = [
  { label: 'Parduotuvės', href: '/parduotuves' },
  { label: 'Paslaugos', href: '/paslaugos' },
  { label: 'Restoranai ir kavinės', href: '/restoranai' },
]

const VISITOR_LINKS = [
  { label: 'PC Planas', href: '/planas' },
  { label: 'Akcijos', href: '/akcijos' },
  { label: 'Kaip atvykti?', href: '/kaip-atvykti' },
  { label: 'Naujienos', href: '/naujienos' },
  { label: 'Renginiai', href: '/renginiai' },
  { label: 'Parkingas', href: '/parkavimas' },
  { label: 'Darbo laikas', href: '/darbo-laikai' },
  { label: 'Kontaktai', href: '/kontaktai' },
]

export function Footer() {
  return (
    <footer className="bg-[#181818] flex flex-col gap-8 md:gap-10 items-center px-4 md:px-8 lg:px-[60px] py-10 md:py-12 lg:py-[68px] rounded-tl-[20px] rounded-tr-[20px] w-full font-[family-name:var(--font-montserrat)]">
      <div className="flex flex-col md:flex-row items-start gap-8 md:gap-6 lg:gap-0 md:justify-between w-full">
        {/* Logo */}
        <div style={{ width: 'min(700px, 100%)', height: 'auto' }}>
          <img
            src={logoUrl}
            alt="PC Europa"
            width={700}
            height={172}
            style={{ objectFit: 'contain', maxWidth: '100%', height: 'auto' }}
          />
        </div>

        {/* Links */}
        <div className="flex flex-row gap-8 md:gap-12 lg:gap-[86px] items-start">
          <div className="flex flex-col gap-6 lg:gap-[50px]">
            <div className="flex flex-col gap-1 lg:gap-2">
              <p className="font-semibold text-[16px] lg:text-[18px] leading-[28px] text-white">Navigacija</p>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
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
                  <img src={facebookIcon} alt="Facebook" className="size-5 lg:size-6" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                  <img src={instagramIcon} alt="Instagram" className="size-5 lg:size-6" />
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

      <div className="flex flex-col items-center gap-2 text-center w-full max-w-[530px]">
        <p className="font-normal text-[13px] lg:text-[16px] leading-[24px] text-[rgba(245,241,232,0.56)]">
          Paspausdamas „Prenumeruoti" sutinki gauti PC Europa naujienas.
        </p>
        <p className="font-normal text-[13px] lg:text-[16px] leading-[24px] text-[rgba(245,241,232,0.56)]">
          2026 | Web sprendimai P.idea
        </p>
      </div>
    </footer>
  )
}
