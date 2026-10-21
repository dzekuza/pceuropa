import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['lt', 'en'],
  defaultLocale: 'lt',
  localePrefix: 'as-needed',
  // LT is the site's language; English-language browsers must not be bounced
  // to /en on first visit. Visitors switch to EN explicitly via the switcher.
  localeDetection: false,
})
