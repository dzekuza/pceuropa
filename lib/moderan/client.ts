// lib/moderan/client.ts — Moderan REST API client for turnover reporting
// Docs: https://apimoderan.gitbook.io/moderan-api/turnover-rent/turnover

const BASE_URL = 'https://www.moderan.net/api'

export interface ModernTurnoverPayload {
  shopName: string
  turnoverRentMonth: string // last day of month, format YYYY-MM-DD
  turnoverRentAmount: number
}

// Returns the last day of the month for a "YYYY-MM" string, formatted as "YYYY-MM-DD"
export function lastDayOfMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number)
  const lastDay = new Date(year, month, 0).getDate()
  return `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
}

export async function postTurnover(
  shopName: string,
  yearMonth: string, // "YYYY-MM"
  amountEur: number
): Promise<{ ok: true } | { ok: false; error: string }> {
  const domainId = process.env.MODERAN_DOMAIN_ID
  const propertySetId = process.env.MODERAN_PROPERTYSET_ID
  const apiKey = process.env.MODERAN_API_KEY

  if (!domainId || !propertySetId || !apiKey) {
    return { ok: false, error: 'Moderan env vars not configured' }
  }

  const url = `${BASE_URL}/domains/${domainId}/propertysets/${propertySetId}/retailturnovers`

  const payload: ModernTurnoverPayload = {
    shopName,
    turnoverRentMonth: lastDayOfMonth(yearMonth),
    turnoverRentAmount: amountEur,
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      return { ok: false, error: `Moderan ${res.status}: ${body}` }
    }

    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Network error' }
  }
}
