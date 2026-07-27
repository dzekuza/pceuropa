'use client'

import type { AnchorHTMLAttributes } from 'react'
import { trackEvent } from '@/lib/analytics'

interface TrackedLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  eventName: string
  eventParams?: Record<string, string>
}

// Wraps a plain <a> with a GA4 click event — lets server components (page.tsx
// files with `metadata` exports) track clicks without becoming client components.
export function TrackedLink({ eventName, eventParams, onClick, ...props }: TrackedLinkProps) {
  return (
    <a
      {...props}
      onClick={(event) => {
        trackEvent(eventName, eventParams)
        onClick?.(event)
      }}
    />
  )
}
