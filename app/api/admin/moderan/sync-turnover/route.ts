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
  status: 'ready' | 'sent' | 'error'
  error?: string
}

export type SyncResponse = {
  dryRun: boolean
  month: string
  results: SyncResult[]
  lastSentAt?: string | null
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

  const results: SyncResult[] = await Promise.all(
    payloads.map(async (payload) => {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: apiToken,
          },
          body: JSON.stringify(payload),
        })

        if (!res.ok) {
          const text = await res.text().catch(() => res.statusText)
          return { ...payload, status: 'error' as const, error: `HTTP ${res.status}: ${text}` }
        }

        return { ...payload, status: 'sent' as const }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Network error'
        return { ...payload, status: 'error' as const, error: message }
      }
    })
  )

  const anySuccess = results.some((r) => r.status === 'sent')
  if (anySuccess) {
    await supabase.from('moderan_sync_log').upsert(
      {
        month: monthDate,
        sent_at: new Date().toISOString(),
        sent_by: user.id,
        results: JSON.parse(JSON.stringify(results)),
      },
      { onConflict: 'month' }
    )
  }

  return NextResponse.json({ dryRun: false, month, results } satisfies SyncResponse)
}
