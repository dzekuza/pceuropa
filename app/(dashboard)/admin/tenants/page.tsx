// app/(dashboard)/admin/tenants/page.tsx — Admin tenant list page
// Server Component — Defense-in-depth auth check (middleware alone is not sufficient)
// CVE-2025-29927: middleware can be bypassed via x-middleware-subrequest header
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/config'
import { TenantsTable } from '@/components/tenants/tenants-table'
import { AddTenantButton } from '@/components/tenants/add-tenant-button'
import { getAdminTenantList, type TenantListSearchParams } from '@/lib/admin-data'

interface AdminTenantsPageProps {
  searchParams: Promise<TenantListSearchParams>
}

export default async function AdminTenantsPage({ searchParams }: AdminTenantsPageProps) {
  const resolvedSearchParams = await searchParams

  const [session, tenantList] = await Promise.all([
    auth(),
    getAdminTenantList(resolvedSearchParams),
  ])

  if (!session?.user || session.user.role !== 'admin') {
    redirect('/login')
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Nuomininkai</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Valdykite nuomininkų duomenis ir paskyras
          </p>
        </div>
        <AddTenantButton />
      </div>

      <TenantsTable
        data={tenantList.tenants}
        totalCount={tenantList.totalCount}
        pageCount={tenantList.pageCount}
        state={tenantList.state}
      />
    </div>
  )
}
