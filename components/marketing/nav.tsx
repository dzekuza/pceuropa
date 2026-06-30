'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, ChevronDown } from 'lucide-react'

const logoUrl = 'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/nav-logo.png'
const timerIconUrl = 'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/timer-icon.png'
const infoIconUrl = 'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/nav-info-icon.png'

const NAV_LINKS = [
  { label: 'Akcijos / Naujienos', href: '/akcijos' },
  { label: 'Parduotuvės / Paslaugos', href: '/parduotuves' },
  { label: 'Restoranai / Kavinės', href: '/restoranai' },
  { label: 'Dialogai / Food court', href: '/dialogai' },
  { label: 'Sportas / Sveikatingumas', href: '/sportas' },
  { label: 'Laisvalaikis / Pramogos', href: '/laisvalaikis' },
]

const INFO_LINKS = [
  { label: 'Naujienos', href: '/naujienos' },
  { label: 'Kontaktai', href: '/kontaktai' },
  { label: 'Kaip atvykti', href: '/kaip-atvykti' },
  { label: 'Darbo laikas', href: '/darbo-laikas' },
]

export function Nav() {
  const [isOpen, setIsOpen] = useState(false)
  const [isInfoOpen, setIsInfoOpen] = useState(false)
  const [isMobileInfoOpen, setIsMobileInfoOpen] = useState(false)
  const infoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (infoRef.current && !infoRef.current.contains(e.target as Node)) {
        setIsInfoOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className="sticky top-0 z-20 w-full">
      {/* Top dark bar */}
      <div className="bg-[#181818] py-3 md:py-4">
      <div className="max-w-[1332px] mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" prefetch={false} className="flex items-center shrink-0 active:scale-[0.97] transition-transform duration-150">
          <img src={logoUrl} alt="PC Europa" className="h-8 md:h-10 lg:h-12 w-auto max-w-[160px] md:max-w-none" />
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2 md:gap-3 lg:gap-4">
          {/* Desktop buttons */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            <Link
              href="/darbo-laikas"
              prefetch={false}
              className="flex items-center gap-2 border border-white rounded-full pl-4 pr-5 py-2 transition-[transform,opacity] duration-150 hover:opacity-80 active:scale-[0.97]"
            >
              <img src={timerIconUrl} alt="" className="size-5 lg:size-6 shrink-0 brightness-0 invert" />
              <span className="text-white text-[13px] lg:text-[14px] font-medium leading-[24px] whitespace-nowrap">
                Darbo laikas
              </span>
            </Link>

            {/* Informacija lankytojams dropdown */}
            <div ref={infoRef} className="relative">
              <button
                onClick={() => setIsInfoOpen((o) => !o)}
                className="flex items-center gap-2 bg-white rounded-full pl-4 pr-5 py-2 transition-[transform,opacity] duration-150 hover:opacity-80 active:scale-[0.97]"
              >
                <img src={infoIconUrl} alt="" className="size-5 lg:size-6 shrink-0" />
                <span className="text-[#181818] text-[13px] lg:text-[14px] font-medium leading-[24px] whitespace-nowrap">
                  Informacija lankytojams
                </span>
              </button>

              {isInfoOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-lg overflow-hidden z-30">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-[#E5E5E5]">
                    <img src={infoIconUrl} alt="" className="size-5 shrink-0" />
                    <span className="text-[#181818] text-[13px] font-medium">Informacija lankytojams</span>
                  </div>
                  {INFO_LINKS.map((link, i) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      prefetch={false}
                      onClick={() => setIsInfoOpen(false)}
                      className={`block text-center text-[#181818] text-[14px] font-medium px-4 py-3 hover:bg-gray-50 transition-colors duration-150${i < INFO_LINKS.length - 1 ? ' border-b border-[#E5E5E5]' : ''}`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-white p-1 transition-[transform,opacity] duration-150 hover:opacity-80 active:scale-[0.90]"
            onClick={() => setIsOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      </div>

      {/* Mobile dropdown — animated with grid-rows */}
      <div
        className={`md:hidden grid overflow-hidden transition-[grid-template-rows] duration-200 [transition-timing-function:var(--ease-out)] ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="min-h-0 bg-[#181818]">
          <div className="px-4 pb-5 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                prefetch={false}
                onClick={() => setIsOpen(false)}
                className="text-white text-[16px] font-medium py-3 border-b border-white/10 transition-opacity duration-150 hover:opacity-70 active:opacity-50"
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile info accordion */}
            <button
              onClick={() => setIsMobileInfoOpen((o) => !o)}
              className="flex items-center justify-between w-full text-left text-white text-[16px] font-medium py-3 border-b border-white/10 transition-opacity duration-150 hover:opacity-70 active:opacity-50"
            >
              Informacija lankytojams
              <ChevronDown
                size={18}
                className={`shrink-0 transition-transform duration-200 ${isMobileInfoOpen ? 'rotate-180' : ''}`}
              />
            </button>
            <div
              className={`grid overflow-hidden transition-[grid-template-rows] duration-200 ease-out ${isMobileInfoOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
            >
              <div className="min-h-0">
                {INFO_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    prefetch={false}
                    onClick={() => { setIsOpen(false); setIsMobileInfoOpen(false) }}
                    className="block text-white/75 text-[15px] font-medium py-2.5 pl-4 border-b border-white/10 transition-opacity duration-150 hover:opacity-70 active:opacity-50"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <Link
                href="/darbo-laikas"
                prefetch={false}
                className="flex-1 flex items-center justify-center gap-2 border border-white rounded-full px-3 py-2 transition-[transform,opacity] duration-150 hover:opacity-80 active:scale-[0.97]"
              >
                <img src={timerIconUrl} alt="" className="size-5 brightness-0 invert" />
                <span className="text-white text-[14px] font-medium">Darbo laikas</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Lower white nav — tablet and up */}
      <div className="hidden md:flex bg-white items-center justify-center py-3 lg:py-4">
        <div className="nav-scrollbar flex items-center justify-between w-full max-w-[1332px] px-4 gap-4 overflow-x-auto">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              prefetch={false}
              className="text-[#181818] text-[13px] lg:text-[16px] font-medium leading-[24px] whitespace-nowrap transition-opacity duration-150 hover:opacity-60 active:opacity-40"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
