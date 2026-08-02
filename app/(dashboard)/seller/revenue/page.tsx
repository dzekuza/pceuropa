// app/(dashboard)/seller/revenue/page.tsx — Seller revenue submission page
// Server Component — Defense-in-depth auth check (CVE-2025-29927: middleware alone insufficient)
import { redirect } from 'next/navigation'
import { eq, desc } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { tenants, revenueReports } from '@/drizzle/schema'
import { RevenuePageClient } from '@/components/revenue/revenue-page-client'
import { AlertCircle } from 'lucide-react'
import { REVENUE_REMINDER_TITLE, revenueReminderBody } from '@/lib/strings'
import type { RevenueReport } from '@/types/database'

export default async function SellerRevenuePage() {
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
    .select({ id: tenants.id })
    .from(tenants)
    .where(eq(tenants.userId, user.id))
    .limit(1)

  if (!tenant) {
    redirect('/seller')
  }

  // Fetch all revenue reports for this tenant, most recent first
  const rows = await db
    .select()
    .from(revenueReports)
    .where(eq(revenueReports.tenantId, tenant.id))
    .orderBy(desc(revenueReports.month))

  const reports: RevenueReport[] = rows.map((row) => ({
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

  // Calculate days remaining in current month
  const now = new Date()
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const daysRemaining = lastDayOfMonth.getDate() - now.getDate()
  const showReminder = daysRemaining <= 10

  return (
    <div className="flex flex-col gap-3">
      {showReminder && (
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 flex gap-3 items-start">
          <AlertCircle className="size-5 text-warning-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-warning-foreground font-semibold text-sm">
              {REVENUE_REMINDER_TITLE}
            </p>
            <p className="text-warning-foreground/80 text-sm mt-0.5">
              {revenueReminderBody(daysRemaining)}
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
