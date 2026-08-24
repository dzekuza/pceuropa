'use client'

import { useLocale } from 'next-intl'
import { useEffect } from 'react'

// The root layout owns <html> (Next.js only allows the outermost layout to
// render it) and stays statically "lt" so marketing pages keep static/ISR
// rendering. This corrects the attribute client-side for the "en" locale
// instead of forcing the whole tree dynamic via a server-side getLocale() call.
export function HtmlLangSync() {
  const locale = useLocale()

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  return null
}
