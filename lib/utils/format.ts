// lib/utils/format.ts — Shared Lithuanian number formatting + spreadsheet export.
import * as XLSX from 'xlsx'
import { MONTHS_LT } from '@/lib/constants'

const eurFormatter = new Intl.NumberFormat('lt-LT', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})
const intFormatter = new Intl.NumberFormat('lt-LT', { maximumFractionDigits: 0 })
const pctFormatter = new Intl.NumberFormat('lt-LT', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

/** Format a EUR amount with Lithuanian comma decimals + space thousands. */
export function formatEur(value: number | null | undefined): string {
  if (value == null) return '—'
  return eurFormatter.format(value)
}

/** Format an integer count with Lithuanian grouping. */
export function formatInt(value: number | null | undefined): string {
  if (value == null) return '—'
  return intFormatter.format(value)
}

/** Format a percentage with one decimal (Lithuanian comma). */
export function formatPct(value: number | null | undefined): string {
  if (value == null) return '—'
  return pctFormatter.format(value) + '%'
}

/** Format a "YYYY-MM" / "YYYY-MM-DD" month string as "Sausis 2026". */
export function formatMonthLabel(monthStr: string): string {
  const parts = monthStr.split('-')
  const monthIdx = parseInt(parts[1], 10) - 1
  return `${MONTHS_LT[monthIdx]} ${parts[0]}`
}

/**
 * Export rows (array-of-arrays, first row = header) as an .xlsx file.
 * Numeric values are written as real numbers so Excel formats them per the
 * viewer's locale (Lithuanian commas), avoiding text/decimal-separator issues.
 */
export function exportRowsToXlsx(
  rows: (string | number | null)[][],
  fileName: string,
  sheetName = 'Duomenys',
): void {
  const cleaned = rows.map((row) => row.map((cell) => (cell == null ? '' : cell)))
  const ws = XLSX.utils.aoa_to_sheet(cleaned)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  XLSX.writeFile(wb, fileName)
}
