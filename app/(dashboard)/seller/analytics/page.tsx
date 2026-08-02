// app/(dashboard)/seller/analytics/page.tsx — Seller personal analytics page
// Server Component — Defense-in-depth auth check (CVE-2025-29927: middleware alone insufficient)
import { redirect } from 'next/navigation'
import { eq, asc } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { tenants, revenueReports } from '@/drizzle/schema'
import { aggregateMonthlyRevenue } from '@/lib/utils/analytics'
import { StatsCards } from '@/components/seller-analytics/stats-cards'
import { RevenueAreaChart } from '@/components/reui/charts/revenue-area-chart'
import { TxBarChart } from '@/components/reui/charts/tx-bar-chart'
import type { RevenueReport } from '@/types/database'

export default async function SellerAnalyticsPage() {
    // Defense-in-depth: verify seller role independently of middleware
    const session = await auth()
    const user = session?.user

    // NOTE: see the report re: lib/auth/auth.config.ts's session() callback not
    // currently setting session.user.id = token.sub.
    if (!user || !user.id || user.role !== 'seller') {
        redirect('/login')
    }

    // Fetch seller's tenant record
    const [tenant] = await db
        .select({ id: tenants.id, store_name: tenants.storeName })
        .from(tenants)
        .where(eq(tenants.userId, user.id))
        .limit(1)

    if (!tenant) {
        redirect('/seller')
    }

    // Fetch all revenue reports for this tenant, ascending for charts
    const rows = await db
        .select()
        .from(revenueReports)
        .where(eq(revenueReports.tenantId, tenant.id))
        .orderBy(asc(revenueReports.month))

    const allReports: RevenueReport[] = rows.map((row) => ({
        id: row.id,
        tenant_id: row.tenantId,
        user_id: row.userId,
        month: row.month,
        amount_eur: Number(row.amountEur),
        tx_count: row.txCount,
        submitted_at: row.submittedAt ? row.submittedAt.toISOString() : null,
        submitted_by: row.submittedBy,
        weeks: row.weeks as RevenueReport['weeks'],
    }))

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
