import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

type Props = { children: ReactNode; className?: string }

export function DisplayHeading({ children, className }: Props) {
  return (
    <h2 className={cn('font-semibold text-balance text-[28px] leading-[1.2] tracking-[-1px] md:text-[36px] md:tracking-[-1.5px] lg:text-[48px] lg:leading-[60px] lg:tracking-[-2.5px] text-black', className)}>
      {children}
    </h2>
  )
}

export function SectionHeading({ children, className }: Props) {
  return (
    <h3 className={cn('font-bold text-balance text-[22px] leading-[1.2] tracking-[-0.5px] md:text-[28px] lg:text-[32px] lg:leading-[40px] lg:tracking-[-1.5px] text-black', className)}>
      {children}
    </h3>
  )
}

export function SubHeading({ children, className }: Props) {
  return (
    <p className={cn('font-medium text-[16px] leading-[22px] md:text-[18px] md:leading-[24px] text-black', className)}>
      {children}
    </p>
  )
}

export function BodyText({ children, className }: Props) {
  return (
    <p className={cn('font-normal text-[16px] leading-[26px] md:text-[17px] md:leading-[28px] text-muted-foreground', className)}>
      {children}
    </p>
  )
}

export function SmallText({ children, className }: Props) {
  return (
    <p className={cn('font-normal text-[13px] leading-[20px] md:text-[14px] md:leading-[24px]', className)}>
      {children}
    </p>
  )
}
