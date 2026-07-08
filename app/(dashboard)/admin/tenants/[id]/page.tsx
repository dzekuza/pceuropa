// app/(dashboard)/admin/tenants/[id]/page.tsx — Tenant detail page
// Server Component — Defense-in-depth auth check + tenant fetch + revenue reports
// CVE-2025-29927: middleware can be bypassed; every protected page must call getUser()
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { TenantInfoCard } from '@/components/tenants/tenant-info-card'
import { TenantRevenueTable } from '@/components/tenants/tenant-revenue-table'
import { TenantRevenueExportButton } from '@/components/tenants/tenant-revenue-export-button'
import { YearSelector } from '@/components/tenants/year-selector'
import { Card, CardHeader, CardTitle, CardDescription, CardToolbar } from '@/components/ui/card'
import { getAdminTenantDetail } from '@/lib/admin-data'

// Revenue data is filtered by the ?year= search param; force-dynamic keeps the
// segment out of the client Router Cache so switching years refetches without a reload.
export const dynamic = 'force-dynamic'

interface TenantDetailPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ year?: string }>
}

export default async function TenantDetailPage({
  params,
  searchParams,
}: TenantDetailPageProps) {
  const supabase = await createClient()

  // Resolve params and compute year before the parallel fetch
  const { id } = await params
  const { year: yearParam } = await searchParams
  const currentYear = new Date().getFullYear()
  const year = yearParam ? parseInt(yearParam, 10) : currentYear
  const safeYear = isNaN(year) ? currentYear : year

  // Auth + both data fetches run concurrently.
  const [{ data: { user } }, detailData] = await Promise.all([
    supabase.auth.getUser(),
    getAdminTenantDetail(supabase, id, safeYear),
  ])

  if (!user || user.app_metadata?.role !== 'admin') {
    redirect('/login')
  }

  if (!detailData.tenant) {
    redirect('/admin/tenants')
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Back link */}
      <Link
        href="/admin/tenants"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Nuomininkai
      </Link>

      {/* Tenant details card with Edit button */}
      <TenantInfoCard tenant={detailData.tenant} />


      {/* Revenue table Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between px-4 py-3">
          <div>
            <CardTitle className="text-lg">Pajamų ataskaita</CardTitle>
            <CardDescription className="text-xs">
              Metinė apyvarta pagal mėnesius ({safeYear})
            </CardDescription>
          </div>
          <CardToolbar className="flex-wrap">
            <YearSelector currentYear={safeYear} />
            <TenantRevenueExportButton
              tenant={detailData.tenant}
              reports={detailData.reports}
              year={safeYear}
            />
          </CardToolbar>
        </CardHeader>
        <TenantRevenueTable
          key={safeYear}
          tenant={detailData.tenant}
          reports={detailData.reports}
          year={safeYear}
        />
      </Card>
    </div>
  )
}
