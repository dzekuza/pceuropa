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

  // Calculate days remaining in current month
  const now = new Date()
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const daysRemaining = lastDayOfMonth.getDate() - now.getDate()
  const showReminder = daysRemaining <= 10

  return (
    <div className="flex flex-col gap-6">
      {showReminder && (
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 flex gap-3 items-start">
          <div className="mt-0.5 text-warning-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          </div>
          <div>
            <p className="text-warning-foreground font-semibold text-sm">
              Artėja mėnesio pabaiga
            </p>
            <p className="text-warning-foreground/80 text-sm mt-0.5">
              Liko tik {daysRemaining} {daysRemaining === 1 ? 'diena' : (daysRemaining > 1 && daysRemaining < 10 ? 'dienos' : 'dienų')} iki mėnesio pabaigos. Prašome įsitikinti, kad pateikėte visą reikiamą apyvartos informaciją.
            </p>
          </div>
        </div>
      )}

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
