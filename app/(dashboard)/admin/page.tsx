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
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardHeading, CardToolbar } from '@/components/ui/card'
import { getAdminHomeData } from '@/lib/admin-data'

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
  const [{ data: { user } }, dashboardData] = await Promise.all([
    supabase.auth.getUser(),
    getAdminHomeData(supabase),
  ])

  if (!user || user.app_metadata?.role !== 'admin') {
    redirect('/login')
  }

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
          value={dashboardData.tenantCount}
          icon={UsersIcon}
          description="Aktyvūs sistemoje"
        />
        <StatisticsCard
          title="Apyvarta šį mėnesį"
          value={formatEur(dashboardData.totalRevenue)}
          icon={EuroIcon}
          trend={{
            value: Math.abs(dashboardData.revenueTrend),
            label: `lyginant su ${dashboardData.currentYear - 1} m. ${MONTHS_LT[new Date().getMonth()]}`,
            isUp: dashboardData.revenueTrend >= 0
          }}
          description={dashboardData.currentMonthLabel}
        />
        <StatisticsCard
          title="Pateiktos ataskaitos"
          value={`${dashboardData.submittedCount} / ${dashboardData.tenantCount}`}
          icon={FileCheckIcon}
          trend={{
            value: Math.abs(dashboardData.submissionTrend),
            label: `lyginant su ${dashboardData.currentYear - 1} m. ${MONTHS_LT[new Date().getMonth()]}`,
            isUp: dashboardData.submissionTrend >= 0
          }}
          description="Šį mėnesį"
        />
        <StatisticsCard
          title="Apyvarta šiais metais"
          value={formatEur(dashboardData.yearlyRevenue)}
          icon={CalendarIcon}
          trend={{
            value: Math.abs(dashboardData.yearlyTrend),
            label: `lyginant su ${dashboardData.currentYear - 1} m.`,
            isUp: dashboardData.yearlyTrend >= 0,
          }}
          description={`${dashboardData.currentYear} m.`}
        />
        <StatisticsCard
          title="Čekių skaičius"
          value={dashboardData.totalTx.toLocaleString('lt-LT')}
          icon={ShoppingBagIcon}
          trend={{
            value: Math.abs(dashboardData.txTrend),
            label: `lyginant su ${dashboardData.currentYear - 1} m. ${MONTHS_LT[new Date().getMonth()]}`,
            isUp: dashboardData.txTrend >= 0
          }}
          description="Šį mėnesį"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <RevenueAreaChart
          data={dashboardData.revenueChartData}
          title="Apyvartos tendencija"
          description="Šių metų apyvarta (nuo sausio)"
        />
        <TxBarChart
          data={dashboardData.txChartData}
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
                  {dashboardData.recentReports.map((report) => (
                    <tr key={report.id} className="hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 sm:px-6 font-medium">{report.tenant_name || 'Nežinomas'}</td>
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
                  ))}
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
              {dashboardData.recentTenants.map((tenant) => (
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
