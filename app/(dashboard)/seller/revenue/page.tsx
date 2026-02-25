// app/(dashboard)/seller/revenue/page.tsx — Seller revenue submission page
// Server Component — Defense-in-depth auth check (CVE-2025-29927: middleware alone insufficient)
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RevenuePageClient } from '@/components/revenue/revenue-page-client'

export default async function SellerRevenuePage() {
  const supabase = await createClient()

  // Defense-in-depth: verify seller role independently of middleware
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.app_metadata?.role !== 'seller') {
    redirect('/login')
  }

  // Fetch seller's tenant record
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!tenant) {
    redirect('/seller')
  }

  // Fetch all revenue reports for this tenant, most recent first
  const { data: reports } = await supabase
    .from('revenue_reports')
    .select('*')
    .eq('tenant_id', tenant.id)
    .order('month', { ascending: false })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Apyvartos pateikimas</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Pateikite mėnesinius pardavimų duomenis
        </p>
      </div>

      <RevenuePageClient reports={reports ?? []} />
    </div>
  )
}
