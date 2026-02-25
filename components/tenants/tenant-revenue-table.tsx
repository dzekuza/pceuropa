// components/tenants/tenant-revenue-table.tsx — 12-month revenue table with auto-calculated columns
// Server Component — pure rendering, no client-side state
import { MONTHS_LT } from '@/lib/constants'
import {
  calculatePK,
  calculateApyvartaPerM2,
  calculateEfektyvumas,
} from '@/lib/utils/calculations'
import type { Tenant, RevenueReport } from '@/types/database'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface TenantRevenueTableProps {
  tenant: Tenant
  reports: RevenueReport[]
  year: number
}

function efektyvumasClass(value: number | null): string {
  if (value == null) return 'text-muted-foreground'
  if (value >= 100) return 'rounded px-1.5 py-0.5 bg-green-100 text-green-800 font-medium'
  if (value >= 70) return 'rounded px-1.5 py-0.5 bg-yellow-100 text-yellow-800 font-medium'
  return 'rounded px-1.5 py-0.5 bg-red-100 text-red-800 font-medium'
}

function fmtEur(value: number): string {
  return value.toFixed(2)
}

function fmtPct(value: number): string {
  return value.toFixed(1) + '%'
}

export function TenantRevenueTable({ tenant, reports, year }: TenantRevenueTableProps) {
  // Build a map from month string (YYYY-MM-01) to report for O(1) lookup
  const reportMap = new Map<string, RevenueReport>()
  for (const report of reports) {
    // month field is stored as 'YYYY-MM-01'
    reportMap.set(report.month.slice(0, 7), report) // key by YYYY-MM
  }

  // Pre-calculate P.K — constant per tenant
  const pk = calculatePK(tenant.rent_eur, tenant.space_m2)

  // Build 12-month rows
  const rows = MONTHS_LT.map((monthName, idx) => {
    const monthNum = idx + 1 // 1–12
    const monthKey = `${year}-${String(monthNum).padStart(2, '0')}` // YYYY-MM
    const report = reportMap.get(monthKey) ?? null

    const hasData = report !== null
    const amount = hasData ? report!.amount_eur : 0
    const txCount = hasData ? (report!.tx_count ?? 0) : 0
    const apyvartaPerM2 = hasData ? calculateApyvartaPerM2(amount, tenant.space_m2) : null
    const efektyvumas = hasData ? calculateEfektyvumas(amount, tenant.rent_eur) : null

    return {
      monthName,
      hasData,
      amount,
      txCount,
      apyvartaPerM2,
      efektyvumas,
    }
  })

  // Vidurkis (average) — only over months that have submitted data
  const dataRows = rows.filter((r) => r.hasData)
  const hasAnyData = dataRows.length > 0

  const avgAmount = hasAnyData
    ? dataRows.reduce((sum, r) => sum + r.amount, 0) / dataRows.length
    : null
  const avgTxCount = hasAnyData
    ? dataRows.reduce((sum, r) => sum + r.txCount, 0) / dataRows.length
    : null
  const avgApyvartaPerM2 = hasAnyData
    ? dataRows.reduce((sum, r) => sum + (r.apyvartaPerM2 ?? 0), 0) / dataRows.filter((r) => r.apyvartaPerM2 != null).length
    : null
  const avgEfektyvumas = hasAnyData
    ? dataRows.reduce((sum, r) => sum + (r.efektyvumas ?? 0), 0) / dataRows.filter((r) => r.efektyvumas != null).length
    : null

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mėnuo</TableHead>
            <TableHead className="text-right">Nuomuojamas plotas (m²)</TableHead>
            <TableHead className="text-right">Pirkimų sk.</TableHead>
            <TableHead className="text-right">Apyvarta (EUR)</TableHead>
            <TableHead className="text-right bg-muted/50">P.K (EUR/m²)</TableHead>
            <TableHead className="text-right bg-muted/50">Apyvarta (EUR/m²)</TableHead>
            <TableHead className="text-right bg-muted/50">Efektyvumas (%)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(({ monthName, amount, txCount, apyvartaPerM2, efektyvumas }) => (
            <TableRow key={monthName}>
              <TableCell className="font-medium">{monthName}</TableCell>
              <TableCell className="text-right">
                {tenant.space_m2 != null ? tenant.space_m2 : '—'}
              </TableCell>
              <TableCell className="text-right">{txCount}</TableCell>
              <TableCell className="text-right">{fmtEur(amount)}</TableCell>
              {/* Auto-calculated columns — subtle background tint */}
              <TableCell className="text-right bg-muted/50">
                {pk != null ? fmtEur(pk) : '—'}
              </TableCell>
              <TableCell className="text-right bg-muted/50">
                {apyvartaPerM2 != null ? fmtEur(apyvartaPerM2) : '—'}
              </TableCell>
              <TableCell className="text-right bg-muted/50">
                {efektyvumas != null ? (
                  <span className={efektyvumasClass(efektyvumas)}>
                    {fmtPct(efektyvumas)}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow className="font-bold">
            <TableCell>Vidurkis</TableCell>
            <TableCell className="text-right">
              {tenant.space_m2 != null ? tenant.space_m2 : '—'}
            </TableCell>
            <TableCell className="text-right">
              {avgTxCount != null ? avgTxCount.toFixed(0) : '—'}
            </TableCell>
            <TableCell className="text-right">
              {avgAmount != null ? fmtEur(avgAmount) : '—'}
            </TableCell>
            <TableCell className="text-right bg-muted/50">
              {pk != null ? fmtEur(pk) : '—'}
            </TableCell>
            <TableCell className="text-right bg-muted/50">
              {avgApyvartaPerM2 != null && !isNaN(avgApyvartaPerM2)
                ? fmtEur(avgApyvartaPerM2)
                : '—'}
            </TableCell>
            <TableCell className="text-right bg-muted/50">
              {avgEfektyvumas != null && !isNaN(avgEfektyvumas) ? (
                <span className={efektyvumasClass(avgEfektyvumas)}>
                  {fmtPct(avgEfektyvumas)}
                </span>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}
