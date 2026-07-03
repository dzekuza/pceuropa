// app/(dashboard)/admin/analytics/page.tsx — Admin analytics dashboard
// Server Component — Defense-in-depth auth check
// CVE-2025-29927: middleware can be bypassed via x-middleware-subrequest header
export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { RevenueLineChart } from '@/components/analytics/revenue-line-chart'
import { CategoryBarChart } from '@/components/analytics/category-bar-chart'
import { TenantTrendChart } from '@/components/analytics/tenant-trend-chart'
import { SubmissionTracker } from '@/components/analytics/submission-tracker'
import { AnalyticsDateRange } from '@/components/analytics/analytics-date-range'
import { AnalyticsSectionCards } from '@/components/analytics/section-cards'
import {
  aggregateMonthlyRevenue,
  aggregateCategoryRevenue,
  getSubmissionStatus,
  aggregateTenantTrends,
  getDateRangeMonths,
} from '@/lib/utils/analytics'
import { MONTHS_LT } from '@/lib/constants'

interface AnalyticsPageProps {
  searchParams: Promise<{ from?: string; to?: string }>
}

/** Default range = current calendar year to date: Sausis → current month (YYYY-MM) */
function getDefaultRange(): { from: string; to: string } {
  const now = new Date()
  const toYear = now.getFullYear()
  const toMonth = now.getMonth() + 1

  return {
    from: `${toYear}-01`,
    to: `${toYear}-${String(toMonth).padStart(2, '0')}`,
  }
}

/** Friendly Lithuanian label for a date range */
function buildRangeLabel(fromParam: string, toParam: string): string {
  const [fy, fm] = fromParam.split('-').map(Number)
  const [ty, tm] = toParam.split('-').map(Number)
  const fromLabel = `${MONTHS_LT[fm - 1]} ${fy}`
  const toLabel = `${MONTHS_LT[tm - 1]} ${ty}`
  return fromLabel === toLabel ? fromLabel : `${fromLabel} – ${toLabel}`
}

export default async function AdminAnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const supabase = await createClient()

  // Defense-in-depth: validate JWT and verify admin role
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.app_metadata?.role !== 'admin') {
    redirect('/login')
  }

  // Parse query params for date range
  const params = await searchParams
  const defaults = getDefaultRange()
  const fromParam = params.from ?? defaults.from
  const toParam = params.to ?? defaults.to

  // Convert YYYY-MM to YYYY-MM-01 for DB queries
  const fromDate = `${fromParam}-01`
  const toDate = `${toParam}-01`

  // Current month for submission tracker
  const now = new Date()
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

  // Build previous period of same length for trend comparison
  const months = getDateRangeMonths(fromDate, toDate)
  const periodLen = months.length
  const firstDate = new Date(fromDate)
  firstDate.setMonth(firstDate.getMonth() - periodLen)
  const prevFromDate = `${firstDate.getFullYear()}-${String(firstDate.getMonth() + 1).padStart(2, '0')}-01`
  const prevToMs = new Date(fromDate)
  prevToMs.setMonth(prevToMs.getMonth() - 1)
  const prevToDate = `${prevToMs.getFullYear()}-${String(prevToMs.getMonth() + 1).padStart(2, '0')}-01`

  // Parallel fetch: tenants + current period reports + previous period reports
  const [tenantsResult, reportsResult, prevReportsResult] = await Promise.all([
    supabase.from('tenants').select('*').order('store_name'),
    supabase
      .from('revenue_reports')
      .select('*')
      .gte('month', fromDate)
      .lte('month', toDate),
    supabase
      .from('revenue_reports')
      .select('amount_eur')
      .gte('month', prevFromDate)
      .lte('month', prevToDate),
  ])

  const tenants = tenantsResult.data ?? []
  const reports = reportsResult.data ?? []
  const prevReports = prevReportsResult.data ?? []

  // Aggregate data for charts
  const monthlyRevenue = aggregateMonthlyRevenue(reports, fromDate, toDate)
  const categoryRevenue = aggregateCategoryRevenue(reports, tenants)
  const submissionStatus = getSubmissionStatus(tenants, reports, currentMonthStr)
  const tenantTrends = aggregateTenantTrends(reports, tenants, fromDate, toDate)

  // Summary stats
  const totalRevenue = reports.reduce((sum, r) => sum + r.amount_eur, 0)
  const prevRevenue = prevReports.length > 0
    ? prevReports.reduce((sum, r) => sum + r.amount_eur, 0)
    : null
  const tenantCount = tenants.length
  const avgRevenue = submissionStatus.submittedCount > 0
    ? totalRevenue / submissionStatus.submittedCount
    : 0

  const rangeLabel = buildRangeLabel(fromParam, toParam)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analitika</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Centro pajamų ir nuomininkų apyvartos apžvalga
          </p>
        </div>
        <Suspense fallback={null}>
          <AnalyticsDateRange from={fromParam} to={toParam} />
        </Suspense>
      </div>

      <AnalyticsSectionCards
        totalRevenue={totalRevenue}
        totalRevenueLabel={rangeLabel}
        prevRevenue={prevRevenue}
        tenantCount={tenantCount}
        submittedCount={submissionStatus.submittedCount}
        avgRevenue={avgRevenue}
      />

      <RevenueLineChart data={monthlyRevenue} />

      <SubmissionTracker
        submitted={submissionStatus.submitted}
        pending={submissionStatus.pending}
        submittedCount={submissionStatus.submittedCount}
        totalCount={submissionStatus.totalCount}
        targetMonth={currentMonthStr}
      />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <TenantTrendChart data={tenantTrends} />
        </div>
        <div className="lg:col-span-2">
          <CategoryBarChart data={categoryRevenue} />
        </div>
      </div>
    </div>
  )
}
