// app/(dashboard)/seller/analytics/page.tsx — Seller personal analytics page
// Server Component — Defense-in-depth auth check (CVE-2025-29927: middleware alone insufficient)
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { aggregateMonthlyRevenue } from '@/lib/utils/analytics'
import { StatsCards } from '@/components/seller-analytics/stats-cards'
import { RevenueAreaChart } from '@/components/reui/charts/revenue-area-chart'
import { TxBarChart } from '@/components/reui/charts/tx-bar-chart'

export default async function SellerAnalyticsPage() {
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
        .select('id, store_name')
        .eq('user_id', user.id)
        .single()

    if (!tenant) {
        redirect('/seller')
    }

    // Fetch all revenue reports for this tenant, ascending for charts
    const { data: reports } = await supabase
        .from('revenue_reports')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('month', { ascending: true })

    const allReports = reports ?? []

    // Build monthly revenue series clipped to the current calendar year
    // (Sausis → current month), so analytics never spill into the prior year.
    const now = new Date()
    const currentYear = now.getFullYear()
    const toMonth = `${currentYear}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
    const fromMonthStr = `${currentYear}-01-01`

    const clippedReports = allReports.filter(
        (r) => r.month >= fromMonthStr && r.month <= toMonth,
    )

    const monthlyData = aggregateMonthlyRevenue(clippedReports, fromMonthStr, toMonth)

    return (
        <div className="flex flex-col gap-3">
            <div>
                <h1 className="text-2xl font-bold">Mano analitika</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    {tenant.store_name} — apyvartos ir pirkimų statistika
                </p>
            </div>

            {/* Summary stat cards */}
            <StatsCards reports={allReports} />

            {/* Charts — stacked vertically for clarity */}
            <RevenueAreaChart data={monthlyData} />
            <TxBarChart reports={clippedReports} />
        </div>
    )
}
