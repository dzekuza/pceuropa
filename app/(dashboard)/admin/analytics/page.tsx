// app/(dashboard)/admin/analytics/page.tsx — Admin analytics dashboard
// Server Component — Defense-in-depth auth check
// CVE-2025-29927: middleware can be bypassed via x-middleware-subrequest header
export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { auth } from '@/lib/auth/config'
import { RevenueLineChart } from '@/components/analytics/revenue-line-chart'
import { CategoryBarChart } from '@/components/analytics/category-bar-chart'
import { TenantTrendChart } from '@/components/analytics/tenant-trend-chart'
import { SubmissionTracker } from '@/components/analytics/submission-tracker'
import { AnalyticsYearFilter } from '@/components/analytics/analytics-date-range'
import { AnalyticsSectionCards } from '@/components/analytics/section-cards'
import { MONTHS_LT } from '@/lib/constants'
import { getAdminAnalyticsData } from '@/lib/admin-data'

interface AnalyticsPageProps {
  searchParams: Promise<{ year?: string; month?: string }>
}

export default async function AdminAnalyticsPage({ searchParams }: AnalyticsPageProps) {
  // Defense-in-depth: validate JWT and verify admin role
  const session = await auth()

  if (!session?.user || session.user.role !== 'admin') {
    redirect('/login')
  }

  // Parse year + month params
  const params = await searchParams
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  const year = parseInt(params.year ?? String(currentYear))
  const month = params.month ? parseInt(params.month) : null

  const mm = (m: number) => String(m).padStart(2, '0')
  const currentMonthStr = `${currentYear}-${mm(currentMonth)}-01`

  const analyticsData = await getAdminAnalyticsData(year, month)

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
        totalRevenue={analyticsData.totalRevenue}
        totalRevenueLabel={rangeLabel}
        prevRevenue={analyticsData.prevRevenue}
        tenantCount={analyticsData.tenantCount}
        submittedCount={analyticsData.submittedCount}
        avgRevenue={analyticsData.avgRevenue}
      />

      <RevenueLineChart data={analyticsData.monthlyRevenue} />

      <SubmissionTracker
        submitted={analyticsData.submitted}
        pending={analyticsData.pending}
        submittedCount={analyticsData.submittedCount}
        totalCount={analyticsData.totalCount}
        targetMonth={currentMonthStr}
      />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <TenantTrendChart data={analyticsData.tenantTrends} />
        </div>
        <div className="lg:col-span-2">
          <CategoryBarChart data={analyticsData.categoryRevenue} />
        </div>
      </div>
    </div>
  )
}
