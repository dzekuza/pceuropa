// app/(dashboard)/admin/tenants/[id]/page.tsx — Tenant detail page
// Server Component — Defense-in-depth auth check + tenant fetch + revenue reports
// CVE-2025-29927: middleware can be bypassed; every protected page must call getUser()
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { TenantInfoCard } from '@/components/tenants/tenant-info-card'
import { TenantRevenueTable } from '@/components/tenants/tenant-revenue-table'
import { YearSelector } from '@/components/tenants/year-selector'
import { Card, CardHeader, CardTitle, CardDescription, CardToolbar } from '@/components/ui/card'

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
    <div className="flex flex-col gap-6">
      {/* Back link */}
      <Link
        href="/admin/tenants"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Nuomininkai
      </Link>

      {/* Tenant details card with Edit button */}
      <TenantInfoCard tenant={tenant} />


      {/* Revenue table Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between px-4 py-3">
          <div>
            <CardTitle className="text-lg">Pajamų ataskaita</CardTitle>
            <CardDescription className="text-xs">
              Metinė apyvarta pagal mėnesius ({safeYear})
            </CardDescription>
          </div>
          <CardToolbar>
            <YearSelector currentYear={safeYear} />
          </CardToolbar>
        </CardHeader>
        <div className="border-y">
          <TenantRevenueTable
            tenant={tenant}
            reports={reports ?? []}
            year={safeYear}
          />
        </div>
      </Card>
    </div>
  )
}
