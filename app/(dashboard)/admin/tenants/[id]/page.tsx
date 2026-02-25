// app/(dashboard)/admin/tenants/[id]/page.tsx — Tenant detail page
// Server Component — Defense-in-depth auth check + tenant fetch + revenue reports
// CVE-2025-29927: middleware can be bypassed; every protected page must call getUser()
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TenantDetailHeader } from '@/components/tenants/tenant-detail-header'
import { TenantRevenueTable } from '@/components/tenants/tenant-revenue-table'
import { YearSelector } from '@/components/tenants/year-selector'

interface TenantDetailPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ year?: string }>
}

export default async function TenantDetailPage({
  params,
  searchParams,
}: TenantDetailPageProps) {
  const supabase = await createClient()

  // Defense-in-depth: validate JWT and verify admin role
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.app_metadata?.role !== 'admin') {
    redirect('/login')
  }

  // Await dynamic params (Next.js 15+ async params)
  const { id } = await params
  const { year: yearParam } = await searchParams

  const currentYear = new Date().getFullYear()
  const year = yearParam ? parseInt(yearParam, 10) : currentYear
  const safeYear = isNaN(year) ? currentYear : year

  // Parallel fetches for tenant + revenue reports
  const [{ data: tenant }, { data: reports }] = await Promise.all([
    supabase.from('tenants').select('*').eq('id', id).single(),
    supabase
      .from('revenue_reports')
      .select('*')
      .eq('tenant_id', id)
      .gte('month', `${safeYear}-01-01`)
      .lte('month', `${safeYear}-12-31`),
  ])

  if (!tenant) {
    redirect('/admin/tenants')
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <TenantDetailHeader tenant={tenant} />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Pajamų ataskaita</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Metinė apyvarta pagal mėnesius
          </p>
        </div>
        <YearSelector currentYear={safeYear} />
      </div>

      <TenantRevenueTable
        tenant={tenant}
        reports={reports ?? []}
        year={safeYear}
      />
    </div>
  )
}
