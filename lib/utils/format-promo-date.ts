function formatLt(date: string): string {
  const [year, month, day] = date.split('-')
  return `${day}.${month}.${year}`
}

export function formatPromoDateRange(startsAt: string, endsAt: string): string {
  return `Nuo ${formatLt(startsAt)} iki ${formatLt(endsAt)}`
}
