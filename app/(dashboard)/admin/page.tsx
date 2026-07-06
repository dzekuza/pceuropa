// app/(dashboard)/admin/page.tsx — Admin home page with summary cards
// Server Component — Defense-in-depth auth check (middleware alone is not sufficient)
// CVE-2025-29927: middleware can be bypassed via x-middleware-subrequest header
// Phase 3 gap closure: summary cards now wired with real Supabase data

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MONTHS_LT } from '@/lib/constants'
import { StatisticsCard } from '@/components/ui/statistics-card-1'
import { RevenueAreaChart } from '@/components/reui/charts/revenue-area-chart'
import { TxBarChart } from '@/components/reui/charts/tx-bar-chart'
import {
  UsersIcon,
  FileCheckIcon,
  EuroIcon,
  ShoppingBagIcon,
  CalendarIcon,
} from 'lucide-react'
import { aggregateMonthlyRevenue } from '@/lib/utils/analytics'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardHeading, CardToolbar } from '@/components/ui/card'

function formatEur(value: number): string {
  return new Intl.NumberFormat('lt-LT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export default async function AdminHomePage() {
  const supabase = await createClient()

  // Defense-in-depth: validate JWT and verify admin role
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.app_metadata?.role !== 'admin') {
    redirect('/login')
  }

  // Current month processing
  const now = new Date()
  const currentMonthDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const currentMonthLabel = `${MONTHS_LT[now.getMonth()]} ${now.getFullYear()}`

  // Same calendar month, one year back — all monthly stat cards compare against this
  const lastYearSameMonthDate = `${now.getFullYear() - 1}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

  // Twelve months ago for charts
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1)
  const startDate = `${twelveMonthsAgo.getFullYear()}-${String(twelveMonthsAgo.getMonth() + 1).padStart(2, '0')}-01`

  // Start of last year — needed so yearly comparison has full 12 months of prior year
  const startOfLastYear = `${now.getFullYear() - 1}-01-01`

  // Parallel fetch
  const [tenantsResult, reportsResult, yearlyReportsResult, lastYearSameMonthResult] = await Promise.all([
    supabase.from('tenants').select('*').order('created_at', { ascending: false }),
    supabase.from('revenue_reports').select('*').gte('month', startDate).order('month', { ascending: true }),
    supabase.from('revenue_reports').select('amount_eur, month').gte('month', startOfLastYear),
    supabase.from('revenue_reports').select('amount_eur, tx_count').eq('month', lastYearSameMonthDate),
  ])

  const tenants = tenantsResult.data ?? []
  const reports = reportsResult.data ?? []
  const yearlyReports = yearlyReportsResult.data ?? []
  const lastYearSameMonthReports = lastYearSameMonthResult.data ?? []
  const lastYearSameMonthCount = lastYearSameMonthReports.length
  const lastYearSameMonthRevenue = lastYearSameMonthReports.reduce((sum, r) => sum + r.amount_eur, 0)
  const lastYearSameMonthTx = lastYearSameMonthReports.reduce((sum, r) => sum + (r.tx_count ?? 0), 0)

  // Yearly revenue stats
  const currentYear = now.getFullYear()
  const yearlyRevenue = yearlyReports
    .filter((r) => r.month.startsWith(`${currentYear}-`))
    .reduce((sum, r) => sum + r.amount_eur, 0)
  const lastYearRevenue = yearlyReports
    .filter((r) => r.month.startsWith(`${currentYear - 1}-`))
    .reduce((sum, r) => sum + r.amount_eur, 0)
  const yearlyTrend = lastYearRevenue > 0
    ? Math.round(((yearlyRevenue - lastYearRevenue) / lastYearRevenue) * 100)
    : 0

  // Derived stats
  const tenantCount = tenants.length

  const currentMonthReports = reports.filter(r => r.month === currentMonthDate)

  const submittedCount = currentMonthReports.length
  const totalRevenue = currentMonthReports.reduce((sum, r) => sum + r.amount_eur, 0)
  const totalTx = currentMonthReports.reduce((sum, r) => sum + (r.tx_count ?? 0), 0)

  // Trend calculations — all compare the current month against the same month last year
  const revenueTrend = lastYearSameMonthRevenue > 0
    ? Math.round(((totalRevenue - lastYearSameMonthRevenue) / lastYearSameMonthRevenue) * 100)
    : 0

  const txTrend = lastYearSameMonthTx > 0
    ? Math.round(((totalTx - lastYearSameMonthTx) / lastYearSameMonthTx) * 100)
    : 0

  const submissionTrend = lastYearSameMonthCount > 0
    ? Math.round(((submittedCount - lastYearSameMonthCount) / lastYearSameMonthCount) * 100)
    : 0

  // Chart data — clipped to the current calendar year (Sausis → current month)
  // so charts never spill into the prior year. The trailing-12-month `reports`
  // set is still used above for the January month-over-month comparison.
  const yearStartDate = `${currentYear}-01-01`
  const chartReports = reports.filter((r) => r.month >= yearStartDate)
  const revenueChartData = aggregateMonthlyRevenue(chartReports, yearStartDate, currentMonthDate)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Suvestinė</h1>
        <p className="text-muted-foreground">
          Sistemos veiklos rodikliai ir nuomininkų statistika
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatisticsCard
          title="Viso nuomininkų"
          value={tenantCount}
          icon={UsersIcon}
          description="Aktyvūs sistemoje"
        />
        <StatisticsCard
          title="Apyvarta šį mėnesį"
          value={formatEur(totalRevenue)}
          icon={EuroIcon}
          trend={{
            value: Math.abs(revenueTrend),
            label: `lyginant su ${currentYear - 1} m. ${MONTHS_LT[now.getMonth()]}`,
            isUp: revenueTrend >= 0
          }}
          description={currentMonthLabel}
        />
        <StatisticsCard
          title="Pateiktos ataskaitos"
          value={`${submittedCount} / ${tenantCount}`}
          icon={FileCheckIcon}
          trend={{
            value: Math.abs(submissionTrend),
            label: `lyginant su ${currentYear - 1} m. ${MONTHS_LT[now.getMonth()]}`,
            isUp: submissionTrend >= 0
          }}
          description="Šį mėnesį"
        />
        <StatisticsCard
          title="Apyvarta šiais metais"
          value={formatEur(yearlyRevenue)}
          icon={CalendarIcon}
          trend={{
            value: Math.abs(yearlyTrend),
            label: `lyginant su ${currentYear - 1} m.`,
            isUp: yearlyTrend >= 0,
          }}
          description={`${currentYear} m.`}
        />
        <StatisticsCard
          title="Čekių skaičius"
          value={totalTx.toLocaleString('lt-LT')}
          icon={ShoppingBagIcon}
          trend={{
            value: Math.abs(txTrend),
            label: `lyginant su ${currentYear - 1} m. ${MONTHS_LT[now.getMonth()]}`,
            isUp: txTrend >= 0
          }}
          description="Šį mėnesį"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <RevenueAreaChart
          data={revenueChartData}
          title="Apyvartos tendencija"
          description="Šių metų apyvarta (nuo sausio)"
        />
        <TxBarChart
          reports={chartReports}
          title="Čekių dinamika"
          description="Mėnesinis čekių aktyvumas"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardHeading>
              <CardTitle>Naujausios ataskaitos</CardTitle>
              <CardDescription>
                Paskutiniai 10 pateiktų mėnesio duomenų
              </CardDescription>
            </CardHeading>
            <CardToolbar>
              <FileCheckIcon className="size-4 text-muted-foreground" />
            </CardToolbar>
          </CardHeader>
          <CardContent className="p-0 sm:p-0">
            <div className="relative w-full overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs uppercase tracking-wider">
                    <th className="h-10 px-4 sm:px-6 text-left font-medium">Nuomininkas</th>
                    <th className="h-10 px-4 sm:px-6 text-left font-medium">Mėnuo</th>
                    <th className="h-10 px-4 sm:px-6 text-right font-medium">Suma</th>
                    <th className="h-10 px-4 sm:px-6 text-right font-medium">Čekiai</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(() => {
                    const tenantById = new Map(tenants.map((t) => [t.id, t]))
                    return [...reports]
                    .sort((a, b) => (b.submitted_at || b.month).localeCompare(a.submitted_at || a.month))
                    .slice(0, 10)
                    .map((report) => {
                      const tenant = report.tenant_id ? tenantById.get(report.tenant_id) : undefined
                      return (
                        <tr key={report.id} className="hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4 sm:px-6 font-medium">{tenant?.store_name || 'Nežinomas'}</td>
                          <td className="py-3 px-4 sm:px-6 text-muted-foreground">
                            {(() => {
                              const parts = report.month.split('-')
                              const monthIdx = parseInt(parts[1], 10) - 1
                              return `${MONTHS_LT[monthIdx]} ${parts[0]}`
                            })()}
                          </td>
                          <td className="py-3 px-4 sm:px-6 text-right font-semibold">{formatEur(report.amount_eur)}</td>
                          <td className="py-3 px-4 sm:px-6 text-right tabular-nums">{report.tx_count ?? 0}</td>
                        </tr>
                      )
                    })
                  })()}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardHeading>
              <CardTitle>Naujausi nuomininkai</CardTitle>
              <CardDescription>
                Paskutiniai užregistruoti
              </CardDescription>
            </CardHeading>
            <CardToolbar>
              <UsersIcon className="size-4 text-muted-foreground" />
            </CardToolbar>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tenants.slice(0, 7).map((tenant) => (
                <div key={tenant.id} className="flex items-center gap-4">
                  <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">
                    {tenant.store_name?.charAt(0).toUpperCase() || 'N'}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <p className="text-sm font-medium leading-none truncate">{tenant.store_name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {tenant.operator || 'Nenurodytas'}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {tenant.created_at ? new Date(tenant.created_at).toLocaleDateString('lt-LT') : '-'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
