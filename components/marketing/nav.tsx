'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

const logoUrl = 'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/nav-logo.png'
const parkingIconUrl = 'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/nav-parking-icon.png'
const infoIconUrl = 'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/nav-info-icon.png'

const NAV_LINKS = [
  { label: 'Parduotuvės / Paslaugos', href: '/parduotuves' },
  { label: 'Restoranai / Kavinės', href: '/restoranai' },
  { label: 'Akcijos / Naujienos', href: '/akcijos' },
  { label: 'Sportas / Sveikatingumas', href: '/sportas' },
  { label: 'Laisvalaikis / Pramogos', href: '/laisvalaikis' },
]

export function Nav() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-20 w-full md:rounded-b-[16px] md:overflow-hidden">
      {/* Top dark bar */}
      <div className="bg-[#181818] py-3 md:py-4">
      <div className="max-w-[1300px] mx-auto px-4 lg:px-0 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0 active:scale-[0.97] transition-transform duration-150">
          <img src={logoUrl} alt="PC Europa" className="h-8 md:h-10 lg:h-12 w-auto max-w-[160px] md:max-w-none" />
        </Link>

        {/* Hours + link — tablet and up */}
        <div className="hidden md:flex items-center gap-6 h-full">
          <div className="flex flex-col">
            <p className="text-white text-[13px] lg:text-[14px] leading-[24px]">
              <span className="font-bold">I-VI</span>
              <span className="font-normal"> 10:00-20:00</span>
            </p>
            <p className="text-white text-[13px] lg:text-[14px] leading-[24px]">
              <span className="font-bold">VII </span>
              <span className="font-normal">10:00-19:00</span>
            </p>
          </div>
          <div className="bg-white w-px h-8" />
          <Link
            href="/darbo-laikai"
            className="text-white text-[13px] lg:text-[14px] font-medium leading-[24px] underline underline-offset-2 whitespace-nowrap transition-opacity duration-150 hover:opacity-70 active:opacity-50"
          >
            Parduotuvių darbo laikai
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 md:gap-3 lg:gap-4">
          {/* Desktop buttons */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            <Link
              href="/parkavimas"
              className="flex items-center gap-2 border-2 border-white rounded-[12px] lg:rounded-[16px] pl-4 pr-5 py-2 transition-[transform,opacity] duration-150 hover:opacity-80 active:scale-[0.97]"
            >
              <div className="relative size-5 lg:size-6 shrink-0">
                <img src={parkingIconUrl} alt="" className="absolute inset-[10%] w-[80%] h-[80%]" />
              </div>
              <span className="text-white text-[13px] lg:text-[14px] font-medium leading-[24px] whitespace-nowrap">
                Parkavimas
              </span>
            </Link>
            <Link
              href="/lankytojams"
              className="flex items-center gap-2 bg-white rounded-[12px] lg:rounded-[16px] pl-4 pr-5 py-2 transition-[transform,opacity] duration-150 hover:opacity-80 active:scale-[0.97]"
            >
              <img src={infoIconUrl} alt="" className="size-5 lg:size-6 shrink-0" />
              <span className="text-[#181818] text-[13px] lg:text-[14px] font-medium leading-[24px] whitespace-nowrap">
                Lankytojams
              </span>
            </Link>
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
        className={`md:hidden grid overflow-hidden transition-[grid-template-rows] duration-200 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
        style={{ transitionTimingFunction: 'var(--ease-out)' }}
      >
        <div className="min-h-0 bg-[#181818]">
          <div className="px-4 pb-5 flex flex-col gap-1">
            <div className="flex flex-col gap-1 border-t border-white/10 pt-4 mb-3">
              <p className="text-white/60 text-[12px] font-medium uppercase tracking-wider mb-1">Darbo laikas</p>
              <p className="text-white text-[14px]"><span className="font-bold">I-VI</span> 10:00-20:00</p>
              <p className="text-white text-[14px]"><span className="font-bold">VII</span> 10:00-19:00</p>
            </div>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-white text-[16px] font-medium py-3 border-b border-white/10 transition-opacity duration-150 hover:opacity-70 active:opacity-50"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex gap-3 mt-4">
              <Link
                href="/parkavimas"
                className="flex-1 flex items-center justify-center gap-2 border-2 border-white rounded-[12px] px-3 py-2 transition-[transform,opacity] duration-150 hover:opacity-80 active:scale-[0.97]"
              >
                <img src={parkingIconUrl} alt="" className="size-5" />
                <span className="text-white text-[14px] font-medium">Parkavimas</span>
              </Link>
              <Link
                href="/lankytojams"
                className="flex-1 flex items-center justify-center gap-2 bg-white rounded-[12px] px-3 py-2 transition-[transform,opacity] duration-150 hover:opacity-80 active:scale-[0.97]"
              >
                <img src={infoIconUrl} alt="" className="size-5" />
                <span className="text-[#181818] text-[14px] font-medium">Lankytojams</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Lower white nav — tablet and up */}
      <div className="hidden md:flex bg-white items-center justify-center py-3 lg:py-4">
        <div className="flex items-center justify-between w-full max-w-[1300px] px-4 lg:px-0 gap-4 overflow-x-auto">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
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
