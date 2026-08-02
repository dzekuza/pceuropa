'use client'

import { useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ArrowIcon } from './ui/arrow-icon'
import { resizeImage } from '@/lib/storage/resize-image'

type Tenant = { id: string; slug: string; store_name: string; logo_url: string }

// Pre-drawn "socket" shape the arrow button sits in — a flat #F5F5F5 fill, not a mask cutout,
// so it reads correctly regardless of what's behind the card.
function NotchShape({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 103.5 76" className={className} aria-hidden="true">
      <path
        d="M45 32.8571V21C45 9.40202 35.598 0 24 0H103.5V76C103.5 65.7827 95.2173 57.5 85 57.5H69.6429C56.033 57.5 45 46.467 45 32.8571Z"
        fill="#f5f5f5"
      />
    </svg>
  )
}

type LogoCardProps = {
  tenant: Tenant | undefined
  featured?: boolean
}

export function LogoCard({ tenant, featured = false }: LogoCardProps) {
  const logoRef = useRef<HTMLImageElement>(null)
  const clusterRef = useRef<HTMLSpanElement>(null)
  const arrowRef = useRef<SVGSVGElement>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)

  if (!tenant) return <div className={`bg-white rounded-[20px] ${featured ? 'row-span-2' : ''}`} />

  const play = (direction: 'in' | 'out') => {
    if (!logoRef.current || !clusterRef.current || !arrowRef.current) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    timelineRef.current?.kill()

    if (reduceMotion) {
      gsap.set(logoRef.current, { scale: 1 })
      gsap.set(clusterRef.current, { autoAlpha: direction === 'in' ? 1 : 0 })
      gsap.set(arrowRef.current, { rotation: 0 })
      return
    }

    timelineRef.current = gsap
      .timeline({ defaults: { duration: 0.4, ease: 'power2.inOut' } })
      .to(logoRef.current, { scale: direction === 'in' ? 0.96 : 1 }, 0)
      .to(clusterRef.current, { autoAlpha: direction === 'in' ? 1 : 0 }, 0)
      .to(arrowRef.current, { rotation: direction === 'in' ? -25 : 0, transformOrigin: 'center' }, 0)
  }

  return (
    <Link
      href={`/parduotuves/${tenant.slug}`}
      prefetch={false}
      onMouseEnter={() => play('in')}
      onMouseLeave={() => play('out')}
      className={`relative flex items-center justify-center overflow-hidden rounded-[20px] bg-white transition-[transform,box-shadow] duration-150 hover:shadow-md active:scale-[0.97] ${featured ? 'row-span-2' : ''}`}
    >
      <img
        ref={logoRef}
        src={resizeImage(tenant.logo_url, { width: 200, height: 200, fit: 'contain' })}
        alt={tenant.store_name}
        loading="lazy"
        className={`relative z-10 w-auto object-contain ${featured ? 'h-24 max-w-[70%]' : 'h-16 max-w-[80%]'}`}
      />
      <span ref={clusterRef} className="invisible absolute top-0 right-0 h-[76px] w-[104px]">
        <NotchShape className="absolute top-0 right-0 h-[76px] w-[103.5px]" />
        <span className="absolute top-2 right-[9px] flex items-center justify-center rounded-full bg-[#fdf567] p-[11px] text-black">
          <ArrowIcon ref={arrowRef} className="size-[17px]" />
        </span>
      </span>
    </Link>
  )
}
