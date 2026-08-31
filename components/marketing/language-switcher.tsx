'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'

const LOCALES = [
  { code: 'lt', label: 'LT' },
  { code: 'en', label: 'EN' },
] as const

interface LanguageSwitcherProps {
  className?: string
}

export function LanguageSwitcher({ className = '' }: LanguageSwitcherProps) {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {LOCALES.map(({ code, label }, i) => (
        <span key={code} className="flex items-center gap-1">
          {i > 0 && <span className="text-white/30" aria-hidden>/</span>}
          <button
            type="button"
            onClick={() => router.replace(pathname, { locale: code })}
            aria-current={locale === code ? 'true' : undefined}
            className={`text-[13px] lg:text-[14px] font-medium leading-[24px] transition-opacity duration-150 ${
              locale === code ? 'text-white' : 'text-white/50 hover:text-white/80'
            }`}
          >
            {label}
          </button>
        </span>
      ))}
    </div>
  )
}
