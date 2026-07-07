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
import { AnalyticsYearFilter } from '@/components/analytics/analytics-date-range'
import { AnalyticsSectionCards } from '@/components/analytics/section-cards'
import {
  aggregateMonthlyRevenue,
  aggregateCategoryRevenue,
  getSubmissionStatus,
  aggregateTenantTrends,
} from '@/lib/utils/analytics'
import { MONTHS_LT } from '@/lib/constants'

interface AnalyticsPageProps {
  searchParams: Promise<{ year?: string; month?: string }>
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

  // Parse year + month params
  const params = await searchParams
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  const year = parseInt(params.year ?? String(currentYear))
  const month = params.month ? parseInt(params.month) : null

  // Date range: single month or full year (capped at current month)
  const mm = (m: number) => String(m).padStart(2, '0')
  const fromDate = month ? `${year}-${mm(month)}-01` : `${year}-01-01`
  const toDate = month
    ? `${year}-${mm(month)}-01`
    : year === currentYear
      ? `${year}-${mm(currentMonth)}-01`
      : `${year}-12-01`

  // Previous period: for a selected month → previous calendar month; for full year → same year range one year back
  const prevYear = month
    ? (month === 1 ? year - 1 : year)
    : year - 1
  const prevMonth = month
    ? (month === 1 ? 12 : month - 1)
    : null
  const prevFromDate = prevMonth ? `${prevYear}-${mm(prevMonth)}-01` : `${prevYear}-01-01`
  const prevToDate = prevMonth
    ? `${prevYear}-${mm(prevMonth)}-01`
    : year === currentYear
      ? `${prevYear}-${mm(currentMonth)}-01`
      : `${prevYear}-12-01`

  // Current month for submission tracker
  const currentMonthStr = `${currentYear}-${mm(currentMonth)}-01`

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

  const rangeLabel = month ? `${MONTHS_LT[month - 1]} ${year}` : String(year)

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
          <AnalyticsYearFilter year={String(year)} month={month ? String(month) : ''} />
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
