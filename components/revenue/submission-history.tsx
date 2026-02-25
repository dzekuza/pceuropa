'use client'
// components/revenue/submission-history.tsx — Table of previously submitted months
import { MONTHS_LT } from '@/lib/constants'
import type { RevenueReport } from '@/types/database'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface SubmissionHistoryProps {
  reports: RevenueReport[]
  onSelectMonth: (month: string) => void
}

export function SubmissionHistory({ reports, onSelectMonth }: SubmissionHistoryProps) {
  if (reports.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed p-8">
        <p className="text-muted-foreground text-sm">Dar nepateikta jokių duomenų</p>
      </div>
    )
  }

  // Sort reports by month descending (most recent first)
  const sorted = [...reports].sort((a, b) => b.month.localeCompare(a.month))

  function formatMonth(monthStr: string): string {
    // monthStr is "YYYY-MM-01" — extract YYYY and MM
    const parts = monthStr.split('-')
    const year = parts[0]
    const monthIdx = parseInt(parts[1], 10) - 1
    return `${MONTHS_LT[monthIdx]} ${year}`
  }

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return '—'
    return dateStr.slice(0, 10)
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mėnuo</TableHead>
            <TableHead className="text-right">Apyvarta (EUR)</TableHead>
            <TableHead className="text-right">Pirkimų sk.</TableHead>
            <TableHead>Užpildė</TableHead>
            <TableHead>Pateikta</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((report) => (
            <TableRow
              key={report.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onSelectMonth(report.month.slice(0, 7))}
            >
              <TableCell className="font-medium">{formatMonth(report.month)}</TableCell>
              <TableCell className="text-right">{report.amount_eur.toFixed(2)}</TableCell>
              <TableCell className="text-right">{report.tx_count ?? '—'}</TableCell>
              <TableCell>{report.submitted_by ?? '—'}</TableCell>
              <TableCell>{formatDate(report.submitted_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
