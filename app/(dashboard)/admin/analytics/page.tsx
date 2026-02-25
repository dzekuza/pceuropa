// app/(dashboard)/admin/analytics/page.tsx — Admin analytics dashboard
// Server Component — Defense-in-depth auth check
// CVE-2025-29927: middleware can be bypassed via x-middleware-subrequest header
export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RevenueLineChart } from '@/components/analytics/revenue-line-chart'
import { CategoryBarChart } from '@/components/analytics/category-bar-chart'
import { TenantTrendChart } from '@/components/analytics/tenant-trend-chart'
import { SubmissionTracker } from '@/components/analytics/submission-tracker'
import { AnalyticsDateRange } from '@/components/analytics/analytics-date-range'
import {
  aggregateMonthlyRevenue,
  aggregateCategoryRevenue,
  getSubmissionStatus,
  aggregateTenantTrends,
} from '@/lib/utils/analytics'

interface AnalyticsPageProps {
  searchParams: Promise<{ from?: string; to?: string }>
}

function formatEur(value: number): string {
  return new Intl.NumberFormat('lt-LT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/** Default "from" = 12 months ago, "to" = current month (YYYY-MM) */
function getDefaultRange(): { from: string; to: string } {
  const now = new Date()
  const toYear = now.getFullYear()
  const toMonth = now.getMonth() + 1

  let fromYear = toYear
  let fromMonth = toMonth - 11
  if (fromMonth < 1) {
    fromMonth += 12
    fromYear -= 1
  }

  return {
    from: `${fromYear}-${String(fromMonth).padStart(2, '0')}`,
    to: `${toYear}-${String(toMonth).padStart(2, '0')}`,
  }
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

  // Parallel fetch: tenants + revenue reports in range
  const [tenantsResult, reportsResult] = await Promise.all([
    supabase.from('tenants').select('*').order('store_name'),
    supabase
      .from('revenue_reports')
      .select('*')
      .gte('month', fromDate)
      .lte('month', toDate),
  ])

  const tenants = tenantsResult.data ?? []
  const reports = reportsResult.data ?? []

  // Aggregate data for charts
  const monthlyRevenue = aggregateMonthlyRevenue(reports, fromDate, toDate)
  const categoryRevenue = aggregateCategoryRevenue(reports, tenants)
  const submissionStatus = getSubmissionStatus(tenants, reports, currentMonthStr)
  const tenantTrends = aggregateTenantTrends(reports, tenants, fromDate, toDate)

  // Summary stats
  const totalRevenue = reports.reduce((sum, r) => sum + r.amount_eur, 0)
  const tenantCount = tenants.length
  const avgRevenue = tenantCount > 0 ? totalRevenue / tenantCount : 0

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analitika</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Centro pajamu ir nuomininku apyvartos apzvalga
          </p>
        </div>
        <Suspense fallback={null}>
          <AnalyticsDateRange from={fromParam} to={toParam} />
        </Suspense>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Viso pajamu (laikotarpis)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatEur(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Nuomininku skaicius
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{tenantCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Vid. pajamos / nuomininkas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatEur(avgRevenue)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly revenue line chart — full width */}
      <RevenueLineChart data={monthlyRevenue} />

      {/* Category bar chart + Submission tracker side-by-side */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <CategoryBarChart data={categoryRevenue} />
        </div>
        <div className="lg:col-span-2">
          <SubmissionTracker
            submitted={submissionStatus.submitted}
            pending={submissionStatus.pending}
            submittedCount={submissionStatus.submittedCount}
            totalCount={submissionStatus.totalCount}
            targetMonth={currentMonthStr}
          />
        </div>
      </div>

      {/* Per-tenant trend chart — full width */}
      <TenantTrendChart data={tenantTrends} />
    </div>
  )
}
