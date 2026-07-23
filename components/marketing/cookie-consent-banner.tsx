'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { COOKIE_CONSENT_STRINGS } from '@/lib/strings'

const STORAGE_KEY = 'pceuropa-cookie-consent'

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true)
  }, [])

  const respond = (value: 'accepted' | 'rejected') => {
    localStorage.setItem(STORAGE_KEY, value)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 flex justify-center">
      <div className="w-full max-w-[900px] bg-[#181818] text-white rounded-[24px] shadow-lg px-6 py-5 flex flex-col sm:flex-row items-center gap-4 font-[family-name:var(--font-jakarta)]">
        <p className="text-sm leading-relaxed text-white/90 flex-1">
          {COOKIE_CONSENT_STRINGS.message}
          <Link href={COOKIE_CONSENT_STRINGS.linkHref} className="underline hover:text-white">
            {COOKIE_CONSENT_STRINGS.linkText}
          </Link>
          .
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => respond('rejected')}
            className="border border-white rounded-full px-5 py-2 text-sm transition-[transform,opacity] duration-150 hover:opacity-80 active:scale-[0.97]"
          >
            {COOKIE_CONSENT_STRINGS.reject}
          </button>
          <button
            type="button"
            onClick={() => respond('accepted')}
            className="bg-white text-black rounded-full px-5 py-2 text-sm font-medium transition-[transform,opacity] duration-150 hover:opacity-80 active:scale-[0.97]"
          >
            {COOKIE_CONSENT_STRINGS.accept}
          </button>
        </div>
      </div>
    </div>
  )
}
