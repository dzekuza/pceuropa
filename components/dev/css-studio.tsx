'use client'

import { useEffect } from 'react'

export function CssStudio() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return
    import('cssstudio').then(({ startStudio }) => startStudio())
  }, [])

  return null
}
