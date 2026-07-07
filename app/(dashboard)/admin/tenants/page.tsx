// app/(dashboard)/admin/tenants/page.tsx — Admin tenant list page
// Server Component — Defense-in-depth auth check (middleware alone is not sufficient)
// CVE-2025-29927: middleware can be bypassed via x-middleware-subrequest header
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TenantsTable } from '@/components/tenants/tenants-table'
import { AddTenantButton } from '@/components/tenants/add-tenant-button'

export default async function AdminTenantsPage() {
  const supabase = await createClient()

  // Auth + data run concurrently; RLS protects the query; redirect fires after if auth fails.
  const [{ data: { user } }, { data: tenants }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('tenants').select('*').order('store_name'),
  ])

  if (!user || user.app_metadata?.role !== 'admin') {
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

      <TenantsTable data={tenants ?? []} />
    </div>
  )
}
