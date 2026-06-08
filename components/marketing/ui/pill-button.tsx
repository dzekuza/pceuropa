import { cn } from '@/lib/utils'
import Link from 'next/link'
import type { ReactNode } from 'react'

export type PillVariant = 'black' | 'yellow' | 'blue' | 'green' | 'peach' | 'white-outline'

type PillButtonProps = {
  children: ReactNode
  variant?: PillVariant
  href?: string
  className?: string
  size?: 'sm' | 'md'
  onClick?: () => void
}

const variantClasses: Record<PillVariant, string> = {
  black: 'bg-black text-white',
  yellow: 'bg-[#fdf567] text-black',
  blue: 'bg-[#b4e5ff] text-black',
  green: 'bg-[#e6ffd1] text-black',
  peach: 'bg-[#ffe8dc] text-black',
  'white-outline': 'border-2 border-white text-white bg-transparent',
}

const sizeClasses: Record<'sm' | 'md', string> = {
  sm: 'px-3 py-[5px] text-[16px] leading-[22.4px]',
  md: 'px-5 py-[15px] text-[16px] leading-[24px]',
}

export function PillButton({
  children,
  variant = 'black',
  href,
  className,
  size = 'md',
  onClick,
}: PillButtonProps) {
  const classes = cn(
    'inline-flex items-center gap-[18px] rounded-full font-medium transition-[transform,opacity] duration-150 hover:opacity-80 active:scale-[0.97]',
    sizeClasses[size],
    variantClasses[variant],
    className,
  )

  if (href) {
    return <Link href={href} prefetch={false} className={classes}>{children}</Link>
  }

  return (
    <button onClick={onClick} className={classes}>
      {children}
    </button>
  )
}
