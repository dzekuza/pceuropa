// app/(dashboard)/admin/overview/page.tsx — Admin year overview
// Cross-tenant revenue + tx grid for a selected year.
export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminOverviewGrid } from '@/components/admin/admin-overview-grid'
import { YearSelector } from '@/components/tenants/year-selector'
import { getAdminOverviewData } from '@/lib/admin-data'

interface OverviewPageProps {
  searchParams: Promise<{ year?: string }>
}

export default async function AdminOverviewPage({ searchParams }: OverviewPageProps) {
  const supabase = await createClient()

  const { year: yearParam } = await searchParams
  const currentYear = new Date().getFullYear()
  const year = yearParam ? parseInt(yearParam, 10) : currentYear
  const safeYear = isNaN(year) ? currentYear : year

  const [{ data: { user } }, overviewData] = await Promise.all([
    supabase.auth.getUser(),
    getAdminOverviewData(supabase, safeYear),
  ])

  if (!user || user.app_metadata?.role !== 'admin') {
    redirect('/login')
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Metų apžvalga</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Visų nuomininkų apyvarta ir čekiai pagal mėnesius — {safeYear} m.
          </p>
        </div>
        <YearSelector currentYear={safeYear} />
      </div>

      <AdminOverviewGrid
        tenants={overviewData.tenants}
        reports={overviewData.reports}
        year={safeYear}
      />
    </div>
  )
}
