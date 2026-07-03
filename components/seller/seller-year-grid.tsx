'use client'
// components/seller/seller-year-grid.tsx — Seller full-year submission grid
// Shows every month (Sausis–Gruodis) for the selected year with turnover,
// receipt counts, and a same-month-last-year (YoY) delta.
import { useMemo } from 'react'
import { calculateYoYPercent } from '@/lib/utils/calculations'
import { formatEur, formatInt, formatPct } from '@/lib/utils/format'
import { buildSellerYearRows } from './seller-year-rows'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { RevenueReport } from '@/types/database'

interface SellerYearGridProps {
  reports: RevenueReport[]
  prevReports: RevenueReport[]
  year: number
}

function yoyDisplay(value: number | null): { text: string; cls: string } {
  if (value == null) return { text: '—', cls: 'text-muted-foreground' }
  const sign = value > 0 ? '+' : value < 0 ? '−' : ''
  const cls =
    value > 0 ? 'text-success' : value < 0 ? 'text-destructive' : 'text-muted-foreground'
  return { text: `${sign}${formatPct(Math.abs(value))}`, cls }
}

export function SellerYearGrid({ reports, prevReports, year }: SellerYearGridProps) {
  const rows = useMemo(
    () => buildSellerYearRows(reports, prevReports, year),
    [reports, prevReports, year],
  )

  const totals = useMemo(() => {
    const data = rows.filter((r) => r.hasData)
    const amount = data.reduce((s, r) => s + (r.amount ?? 0), 0)
    const tx = data.reduce((s, r) => s + (r.tx ?? 0), 0)
    const prevAmount = prevReports.reduce((s, r) => s + r.amount_eur, 0)
    return { amount, tx, yoy: calculateYoYPercent(amount, prevAmount || null) }
  }, [rows, prevReports])

  const totalYoy = yoyDisplay(totals.yoy)

  return (
    <div className="rounded-lg border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mėnuo</TableHead>
            <TableHead className="text-right">Apyvarta (EUR)</TableHead>
            <TableHead className="text-right">Čekių sk.</TableHead>
            <TableHead className="text-right">vs {year - 1}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => {
            const yoy = yoyDisplay(r.yoy)
            return (
              <TableRow key={r.monthName} className={r.hasData ? '' : 'text-muted-foreground'}>
                <TableCell className="font-medium">{r.monthName}</TableCell>
                <TableCell className="text-right">
                  {r.hasData ? formatEur(r.amount) : '—'}
                </TableCell>
                <TableCell className="text-right">
                  {r.hasData ? formatInt(r.tx) : '—'}
                </TableCell>
                <TableCell className={`text-right ${yoy.cls}`}>{yoy.text}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
        <TableFooter>
          <TableRow className="font-bold">
            <TableCell>Iš viso</TableCell>
            <TableCell className="text-right">{formatEur(totals.amount)}</TableCell>
            <TableCell className="text-right">{formatInt(totals.tx)}</TableCell>
            <TableCell className={`text-right ${totalYoy.cls}`}>{totalYoy.text}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}
