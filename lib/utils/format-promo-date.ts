function formatDate(date: string): string {
  const [year, month, day] = date.split('-')
  return `${day}.${month}.${year}`
}

export function formatPromoDateRange(startsAt: string, endsAt: string, locale: string = 'lt'): string {
  const start = formatDate(startsAt)
  const end = formatDate(endsAt)
  return locale === 'en' ? `From ${start} to ${end}` : `Nuo ${start} iki ${end}`
}
