// lib/utils/analytics.ts — Pure data aggregation functions for analytics charts
// All functions are pure (no side effects) and fully typed.
// Used by app/(dashboard)/admin/analytics/page.tsx (Server Component)

import type { Tenant, RevenueReport } from '@/types/database'
import { MONTHS_LT } from '@/lib/constants'

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Parse "YYYY-MM-01" or "YYYY-MM" into { year, month } (1-indexed) */
function parseYearMonth(dateStr: string): { year: number; month: number } {
  const parts = dateStr.split('-')
  return { year: parseInt(parts[0], 10), month: parseInt(parts[1], 10) }
}

/** Format { year, month } back to "YYYY-MM-01" */
function toDateString(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}-01`
}

/** Lithuanian month label e.g. "Sausis 2026" */
function toLabel(year: number, month: number): string {
  return `${MONTHS_LT[month - 1]} ${year}`
}

/** Extract "YYYY-MM" key from a full date string "YYYY-MM-01" (or "YYYY-MM-DD") */
function toYearMonthKey(dateStr: string): string {
  return dateStr.slice(0, 7) // "YYYY-MM"
}

// ---------------------------------------------------------------------------
// 1. aggregateMonthlyRevenue
// ---------------------------------------------------------------------------

export interface MonthlyRevenuePoint {
  month: string   // "YYYY-MM-01" — used as chart X-axis data key
  label: string   // "Sausis 2026" — Lithuanian display label
  total: number   // sum of amount_eur for this month
}

/**
 * Group reports by month, sum amount_eur, fill gaps with 0.
 * Returns months sorted ascending by date.
 *
 * @param reports  - raw revenue_reports rows
 * @param startMonth - optional "YYYY-MM-01" lower bound for gap-fill range
 * @param endMonth   - optional "YYYY-MM-01" upper bound for gap-fill range
 */
export function aggregateMonthlyRevenue(
  reports: RevenueReport[],
  startMonth?: string,
  endMonth?: string
): MonthlyRevenuePoint[] {
  // Sum per YYYY-MM key
  const sumByKey: Record<string, number> = {}
  for (const r of reports) {
    const key = toYearMonthKey(r.month)
    sumByKey[key] = (sumByKey[key] ?? 0) + r.amount_eur
  }

  // Determine range for gap-fill
  const allKeys = Object.keys(sumByKey)
  const rangeMonths: string[] = []

  if (startMonth && endMonth) {
    rangeMonths.push(...getDateRangeMonths(startMonth, endMonth))
  } else if (allKeys.length > 0) {
    const sorted = [...allKeys].sort()
    rangeMonths.push(...getDateRangeMonths(sorted[0] + '-01', sorted[sorted.length - 1] + '-01'))
  }

  const result: MonthlyRevenuePoint[] = rangeMonths.map((dateStr) => {
    const key = toYearMonthKey(dateStr)
    const { year, month } = parseYearMonth(dateStr)
    return {
      month: dateStr,
      label: toLabel(year, month),
      total: sumByKey[key] ?? 0,
    }
  })

  // Deduplicate (rangeMonths already unique) and sort
  return result.sort((a, b) => a.month.localeCompare(b.month))
}

// ---------------------------------------------------------------------------
// 2. aggregateCategoryRevenue
// ---------------------------------------------------------------------------

export interface CategoryRevenuePoint {
  category: string  // category label (or "Kita" for null)
  total: number     // sum of amount_eur for this category
}

/**
 * Join reports to tenants via tenant_id to get category.
 * Groups by category, sums amount_eur, sorted by total descending.
 * Tenants with null category are grouped as "Kita".
 */
export function aggregateCategoryRevenue(
  reports: RevenueReport[],
  tenants: Tenant[]
): CategoryRevenuePoint[] {
  const tenantMap = new Map<string, Tenant>(
    tenants.map((t) => [t.id, t])
  )

  const sumByCategory: Record<string, number> = {}
  for (const r of reports) {
    if (!r.tenant_id) continue
    const tenant = tenantMap.get(r.tenant_id)
    const category = tenant?.category ?? 'Kita'
    sumByCategory[category] = (sumByCategory[category] ?? 0) + r.amount_eur
  }

  return Object.entries(sumByCategory)
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total)
}

// ---------------------------------------------------------------------------
// 3. getSubmissionStatus
// ---------------------------------------------------------------------------

export interface SubmissionStatus {
  submitted: Tenant[]
  pending: Tenant[]
  submittedCount: number
  totalCount: number
}

/**
 * For a given month ("YYYY-MM-01"), determine which active tenants have
 * submitted a revenue report and which haven't.
 */
export function getSubmissionStatus(
  tenants: Tenant[],
  reports: RevenueReport[],
  targetMonth: string
): SubmissionStatus {
  const targetKey = toYearMonthKey(targetMonth)

  const submittedTenantIds = new Set(
    reports
      .filter((r) => toYearMonthKey(r.month) === targetKey && r.tenant_id)
      .map((r) => r.tenant_id as string)
  )

  const submitted = tenants.filter((t) => submittedTenantIds.has(t.id))
  const pending = tenants.filter((t) => !submittedTenantIds.has(t.id))

  return {
    submitted,
    pending,
    submittedCount: submitted.length,
    totalCount: tenants.length,
  }
}

// ---------------------------------------------------------------------------
// 4. getDateRangeMonths
// ---------------------------------------------------------------------------

/**
 * Generate an array of "YYYY-MM-01" strings between startMonth and endMonth
 * (both inclusive). Accepts "YYYY-MM-01" or "YYYY-MM" format.
 */
export function getDateRangeMonths(startMonth: string, endMonth: string): string[] {
  const start = parseYearMonth(startMonth)
  const end = parseYearMonth(endMonth)

  const result: string[] = []
  let { year, month } = start

  while (year < end.year || (year === end.year && month <= end.month)) {
    result.push(toDateString(year, month))
    month++
    if (month > 12) {
      month = 1
      year++
    }
  }

  return result
}

// ---------------------------------------------------------------------------
// 5. aggregateTenantTrends
// ---------------------------------------------------------------------------

export interface TenantTrendSeries {
  tenantId: string
  storeName: string
  data: MonthlyRevenuePoint[]
}

/**
 * Groups reports by tenant_id, then by month within each tenant.
 * Fills month gaps with 0 so every tenant has the same X-axis range.
 * Sorted: tenants by total revenue descending.
 */
export function aggregateTenantTrends(
  reports: RevenueReport[],
  tenants: Tenant[],
  startMonth?: string,
  endMonth?: string
): TenantTrendSeries[] {
  const tenantMap = new Map<string, Tenant>(
    tenants.map((t) => [t.id, t])
  )

  // Determine global date range
  const allReportKeys = reports.map((r) => toYearMonthKey(r.month)).sort()
  const rangeStart = startMonth ?? (allReportKeys[0] ? allReportKeys[0] + '-01' : null)
  const rangeEnd = endMonth ?? (allReportKeys[allReportKeys.length - 1] ? allReportKeys[allReportKeys.length - 1] + '-01' : null)

  if (!rangeStart || !rangeEnd) return []

  const allMonths = getDateRangeMonths(rangeStart, rangeEnd)

  // Group reports by tenant_id
  const byTenant: Record<string, RevenueReport[]> = {}
  for (const r of reports) {
    if (!r.tenant_id) continue
    if (!byTenant[r.tenant_id]) byTenant[r.tenant_id] = []
    byTenant[r.tenant_id].push(r)
  }

  const series: TenantTrendSeries[] = Object.entries(byTenant).map(([tenantId, tenantReports]) => {
    const tenant = tenantMap.get(tenantId)
    const storeName = tenant?.store_name ?? 'Nezinoma parduotuve'

    // Sum per month for this tenant
    const sumByKey: Record<string, number> = {}
    for (const r of tenantReports) {
      const key = toYearMonthKey(r.month)
      sumByKey[key] = (sumByKey[key] ?? 0) + r.amount_eur
    }

    const data: MonthlyRevenuePoint[] = allMonths.map((dateStr) => {
      const key = toYearMonthKey(dateStr)
      const { year, month } = parseYearMonth(dateStr)
      return {
        month: dateStr,
        label: toLabel(year, month),
        total: sumByKey[key] ?? 0,
      }
    })

    return { tenantId, storeName, data }
  })

  // Sort by total revenue descending
  return series.sort((a, b) => {
    const totalA = a.data.reduce((sum, d) => sum + d.total, 0)
    const totalB = b.data.reduce((sum, d) => sum + d.total, 0)
    return totalB - totalA
  })
}
