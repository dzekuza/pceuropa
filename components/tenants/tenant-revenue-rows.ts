// components/tenants/tenant-revenue-rows.ts — shared row builder for the admin
// tenant yearly revenue table, used by both the table and the Excel export.
import { MONTHS_LT } from '@/lib/constants'
import {
  calculatePK,
  calculateApyvartaPerM2,
  calculateEfektyvumas,
} from '@/lib/utils/calculations'
import type { Tenant, RevenueReport } from '@/types/database'

export interface TenantRevenueRow {
  monthName: string
  hasData: boolean
  amount: number
  txCount: number
  apyvartaPerM2: number | null
  efektyvumas: number | null
}

/** Build the 12 month rows for a tenant/year plus the constant P.K (rent/m²). */
export function buildTenantRevenueRows(
  tenant: Tenant,
  reports: RevenueReport[],
  year: number,
): { rows: TenantRevenueRow[]; pk: number | null } {
  const reportMap = new Map<string, RevenueReport>()
  for (const report of reports) {
    reportMap.set(report.month.slice(0, 7), report)
  }

  const pk = calculatePK(tenant.rent_eur, tenant.space_m2)

  const rows = MONTHS_LT.map((monthName, idx) => {
    const monthKey = `${year}-${String(idx + 1).padStart(2, '0')}`
    const report = reportMap.get(monthKey) ?? null
    const hasData = report !== null
    const amount = hasData ? report!.amount_eur : 0
    const txCount = hasData ? (report!.tx_count ?? 0) : 0
    const apyvartaPerM2 = hasData ? calculateApyvartaPerM2(amount, tenant.space_m2) : null
    const efektyvumas = hasData ? calculateEfektyvumas(amount, tenant.rent_eur) : null
    return { monthName, hasData, amount, txCount, apyvartaPerM2, efektyvumas }
  })

  return { rows, pk }
}

/** Shape the rows into an array-of-arrays (with header) for spreadsheet export. */
export function tenantRevenueExportRows(
  rows: TenantRevenueRow[],
  tenant: Tenant,
  pk: number | null,
): (string | number)[][] {
  const headers = [
    'Mėnuo', 'Apyvarta (EUR)', 'Čekių sk.', 'Plotas (m²)',
    'P.K (EUR/m²)', 'Apyvarta (EUR/m²)', 'Efektyvumas (%)',
  ]
  const data = rows.map((r) => [
    r.monthName,
    r.hasData ? r.amount : '',
    r.hasData ? r.txCount : '',
    tenant.space_m2 ?? '',
    pk ?? '',
    r.apyvartaPerM2 ?? '',
    r.efektyvumas ?? '',
  ])
  return [headers, ...data]
}
