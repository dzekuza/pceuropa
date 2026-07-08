'use client'

import { useState } from 'react'
import { MONTHS_LT } from '@/lib/constants'
import { MODERAN_SYNC_STRINGS as S } from '@/lib/strings'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { SyncPayload, SyncResponse, SyncResult } from '@/app/api/admin/moderan/sync-turnover/route'

function generateMonthOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = []
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = `${MONTHS_LT[d.getMonth()]} ${d.getFullYear()}`
    options.push({ value, label })
  }
  return options
}

const MONTH_OPTIONS = generateMonthOptions()

function toPayload(result: SyncResult): SyncPayload {
  return {
    shopName: result.shopName,
    turnoverRentMonth: result.turnoverRentMonth,
    turnoverRentAmount: result.turnoverRentAmount,
  }
}

function StatusBadge({ status }: { status: SyncResult['status'] }) {
  if (status === 'sent') return <Badge variant="default">Išsiųsta</Badge>
  if (status === 'error') return <Badge variant="destructive">Klaida</Badge>
  if (status === 'skipped') return <Badge variant="secondary">{S.statusSkipped}</Badge>
  return <Badge variant="secondary">{S.statusReady}</Badge>
}

export function ModeranSync() {
  const [month, setMonth] = useState(MONTH_OPTIONS[0].value)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<SyncResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSync() {
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const res = await fetch('/api/admin/moderan/sync-turnover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month, dryRun: true }),
      })

      const json = await res.json()

      if (!res.ok) {
        const msg = json?.error?.message ?? S.errorGeneric
        setError(msg)
        return
      }

      setResult(json as SyncResponse)
    } catch {
      setError(S.errorGeneric)
    } finally {
      setLoading(false)
    }
  }

  async function handleSend() {
    if (!confirm(S.sendConfirm)) return

    setSending(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/moderan/sync-turnover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month, dryRun: false }),
      })

      const json = await res.json()

      if (!res.ok) {
        const msg = json?.error?.message ?? S.errorGeneric
        setError(msg)
        return
      }

      setResult(json as SyncResponse)
    } catch {
      setError(S.errorGeneric)
    } finally {
      setSending(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{S.sectionTitle}</CardTitle>
        <CardDescription>{S.sectionDescription}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">{S.monthLabel}</label>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTH_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={handleSync} disabled={loading || sending}>
            {loading ? S.syncButtonLoading : S.syncButton}
          </Button>
          <Button onClick={handleSend} disabled={loading || sending}>
            {sending ? S.sendButtonLoading : S.sendButton}
          </Button>
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {result?.lastSentAt && (
          <p className="text-sm text-muted-foreground">
            {S.lastSentLabel}{' '}
            <span className="font-medium text-foreground">
              {new Date(result.lastSentAt).toLocaleString('lt-LT')}
            </span>
          </p>
        )}

        {result && result.results.length > 0 && (
          <div className="flex justify-end">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  {S.viewJsonButton}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{S.jsonDialogTitle}</DialogTitle>
                  <DialogDescription>{S.jsonDialogDescription}</DialogDescription>
                </DialogHeader>
                <pre className="overflow-x-auto rounded-md bg-muted p-4 text-xs">
                  {JSON.stringify(result.results.map(toPayload), null, 2)}
                </pre>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {result && (
          result.results.length === 0 ? (
            <p className="text-sm text-muted-foreground">{S.noData}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{S.colStore}</TableHead>
                  <TableHead className="text-right">{S.colAmount}</TableHead>
                  <TableHead>{S.colMonth}</TableHead>
                  <TableHead>{S.colStatus}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.results.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{r.shopName}</TableCell>
                    <TableCell className="text-right">
                      {r.turnoverRentAmount.toLocaleString('lt-LT', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>{r.turnoverRentMonth}</TableCell>
                    <TableCell>
                      <StatusBadge status={r.status} />
                      {r.error && (
                        <p className="mt-1 text-xs text-destructive">{r.error}</p>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )
        )}
      </CardContent>
    </Card>
  )
}
