import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['lt', 'en'],
  defaultLocale: 'lt',
  localePrefix: 'as-needed',
  localeDetection: false,
})
