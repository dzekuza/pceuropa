export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// DB stores month as YYYY-MM-01; Moderan expects the last day of that month.
function lastDayOfMonth(yyyyMM01: string): string {
  const [y, m] = yyyyMM01.split('-').map(Number)
  // day 0 of next month = last day of current month
  const d = new Date(y, m, 0)
  return d.toISOString().slice(0, 10)
}

export type SyncPayload = {
  shopName: string
  turnoverRentMonth: string
  turnoverRentAmount: number
}

export type SyncResult = SyncPayload & {
  status: 'ready' | 'sent' | 'skipped' | 'error'
  error?: string
}

export type SyncResponse = {
  dryRun: boolean
  month: string
  results: SyncResult[]
  lastSentAt?: string | null
}

const SEND_CONCURRENCY = 3
const MAX_RETRIES = 2
const RETRY_BASE_DELAY_MS = 500

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size))
  return chunks
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function sendToModeran(
  url: string,
  apiToken: string,
  payload: SyncPayload
): Promise<SyncResult> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: apiToken,
        },
        body: JSON.stringify(payload),
      })

      if (res.ok) return { ...payload, status: 'sent' }

      const text = await res.text().catch(() => res.statusText)

      // Fail fast on validation/auth errors — retrying won't change the outcome.
      if (res.status < 500 || attempt === MAX_RETRIES) {
        return { ...payload, status: 'error', error: `HTTP ${res.status}: ${text}` }
      }
    } catch (err) {
      if (attempt === MAX_RETRIES) {
        const message = err instanceof Error ? err.message : 'Network error'
        return { ...payload, status: 'error', error: message }
      }
    }

    await sleep(RETRY_BASE_DELAY_MS * 2 ** attempt)
  }

  // Unreachable, but keeps TypeScript satisfied.
  return { ...payload, status: 'error', error: 'Unknown send failure' }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Admin only' } }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const month: string | undefined = body?.month // YYYY-MM
  const dryRun: boolean = body?.dryRun !== false // default true

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json(
      { error: { code: 'INVALID_MONTH', message: 'month must be YYYY-MM' } },
      { status: 400 }
    )
  }

  const monthDate = `${month}-01`

  // Fetch reports with tenant name for the given month
  const { data: reports, error: dbError } = await supabase
    .from('revenue_reports')
    .select('amount_eur, month, tenants(store_name)')
    .eq('month', monthDate)

  if (dbError) {
    return NextResponse.json(
      { error: { code: 'DB_ERROR', message: 'Failed to fetch revenue reports' } },
      { status: 500 }
    )
  }

  const payloads: SyncPayload[] = (reports ?? []).map((r) => ({
    shopName: (r.tenants as { store_name: string } | null)?.store_name ?? 'Unknown',
    turnoverRentMonth: lastDayOfMonth(r.month),
    turnoverRentAmount: r.amount_eur,
  }))

  if (dryRun) {
    const results: SyncResult[] = payloads.map((p) => ({ ...p, status: 'ready' }))

    const { data: logEntry } = await supabase
      .from('moderan_sync_log')
      .select('sent_at')
      .eq('month', monthDate)
      .maybeSingle()

    return NextResponse.json({
      dryRun: true,
      month,
      results,
      lastSentAt: logEntry?.sent_at ?? null,
    } satisfies SyncResponse)
  }

  // Real send — requires env vars
  const apiToken = process.env.MODERAN_API_TOKEN
  const domainId = process.env.MODERAN_DOMAIN_ID
  const propertySetId = process.env.MODERAN_PROPERTYSET_ID

  if (!apiToken || !domainId || !propertySetId) {
    return NextResponse.json(
      { error: { code: 'ENV_MISSING', message: 'MODERAN_API_TOKEN, MODERAN_DOMAIN_ID, and MODERAN_PROPERTYSET_ID must be set' } },
      { status: 500 }
    )
  }

  const url = `https://www.moderan.net/api/domains/${domainId}/propertysets/${propertySetId}/retailturnovers`

  // Moderan rejects a second POST for a Store+Month that was already sent (400,
  // "already existing row"), and firing all rows at once as concurrent duplicates
  // appears to make Moderan's server crash (500) instead. So: consult our own log
  // to skip shops already confirmed 'sent' for this month, and send the rest with
  // limited concurrency + retry instead of one unbounded Promise.all burst.
  const { data: previousLog } = await supabase
    .from('moderan_sync_log')
    .select('results')
    .eq('month', monthDate)
    .maybeSingle()

  const previouslySent = new Set(
    ((previousLog?.results as SyncResult[] | null) ?? [])
      .filter((r) => r.status === 'sent')
      .map((r) => r.shopName)
  )

  type PendingItem = { index: number; payload: SyncPayload }
  const results: SyncResult[] = new Array(payloads.length)
  const pending: PendingItem[] = []

  payloads.forEach((payload, index) => {
    if (payload.shopName === 'Unknown') {
      results[index] = {
        ...payload,
        status: 'error',
        error: 'Trūksta parduotuvės pavadinimo (nerastas susietas nuomininkas).',
      }
    } else if (previouslySent.has(payload.shopName)) {
      results[index] = { ...payload, status: 'skipped' }
    } else {
      pending.push({ index, payload })
    }
  })

  for (const batch of chunk(pending, SEND_CONCURRENCY)) {
    const sent = await Promise.all(batch.map((item) => sendToModeran(url, apiToken, item.payload)))
    sent.forEach((result, i) => {
      results[batch[i].index] = result
    })
  }

  const anySuccess = results.some((r) => r.status === 'sent')
  if (anySuccess) {
    // Persist skipped rows as 'sent' in the log so future runs keep treating them
    // as already delivered — 'skipped' is a display-only status for this response.
    const logResults = results.map((r) => (r.status === 'skipped' ? { ...r, status: 'sent' as const } : r))

    await supabase.from('moderan_sync_log').upsert(
      {
        month: monthDate,
        sent_at: new Date().toISOString(),
        sent_by: user.id,
        results: JSON.parse(JSON.stringify(logResults)),
      },
      { onConflict: 'month' }
    )
  }

  return NextResponse.json({ dryRun: false, month, results } satisfies SyncResponse)
}
