// components/seller/seller-year-rows.ts — shared row builder for the seller
// full-year grid, used by both the table (SellerYearGrid) and the Excel export.
import { MONTHS_LT } from '@/lib/constants'
import { calculateYoYPercent } from '@/lib/utils/calculations'
import type { RevenueReport } from '@/types/database'

export interface SellerYearRow {
  monthName: string
  hasData: boolean
  amount: number | null
  tx: number | null
  yoy: number | null
}

/** Build one row per month (Sausis–Gruodis) with same-month-last-year delta. */
export function buildSellerYearRows(
  reports: RevenueReport[],
  prevReports: RevenueReport[],
  year: number,
): SellerYearRow[] {
  const curMap = new Map(reports.map((r) => [r.month.slice(0, 7), r]))
  const prevMap = new Map(prevReports.map((r) => [r.month.slice(0, 7), r]))
  return MONTHS_LT.map((monthName, idx) => {
    const mm = String(idx + 1).padStart(2, '0')
    const cur = curMap.get(`${year}-${mm}`) ?? null
    const prev = prevMap.get(`${year - 1}-${mm}`) ?? null
    const amount = cur ? cur.amount_eur : null
    const tx = cur ? cur.tx_count : null
    const yoy = calculateYoYPercent(amount, prev ? prev.amount_eur : null)
    return { monthName, hasData: cur !== null, amount, tx, yoy }
  })
}

/** Shape the rows into an array-of-arrays (with header) for spreadsheet export. */
export function sellerYearExportRows(
  rows: SellerYearRow[],
  year: number,
): (string | number)[][] {
  const headers = ['Mėnuo', 'Apyvarta (EUR)', 'Čekių sk.', `vs ${year - 1} (%)`]
  const data = rows.map((r) => [
    r.monthName,
    r.hasData && r.amount != null ? r.amount : '',
    r.hasData && r.tx != null ? r.tx : '',
    r.yoy != null ? Number(r.yoy.toFixed(1)) : '',
  ])
  return [headers, ...data]
}
