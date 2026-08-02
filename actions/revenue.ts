'use server'
// actions/revenue.ts — Server Action for seller revenue submission (weekly breakdown)
// Defense-in-depth: verifies seller role on every call (CVE-2025-29927)
import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { tenants, revenueReports, users } from '@/drizzle/schema'
import type { RevenueFormValues } from '@/lib/validations/revenue'
import type { WeekData } from '@/types/database'

/**
 * submitRevenue — Upserts a revenue_report with weekly breakdown.
 * Parses week strings to numbers, computes totals, stores both.
 *
 * NOTE: the Auth.js session (lib/auth/auth.config.ts's `session` callback)
 * only forwards `role` onto session.user, not the user's own uuid — its
 * default JWT-strategy session object is `{ user: { name, email, image } }`
 * plus whatever the custom callback adds, and the callback here doesn't add
 * `id`. Since lib/auth/auth.config.ts is out of scope for this phase (already
 * complete), the seller's user id is resolved via session.user.email → users
 * table instead of session.user.id, to find their tenant row (tenants.user_id
 * stores the same uuid the old Supabase auth.uid() did). Flagging this
 * explicitly rather than guessing at whether auth.config.ts should be changed
 * to expose `id` directly — that's a call for whoever owns lib/auth/**.
 */
export async function submitRevenue(
  formData: RevenueFormValues
): Promise<{ success: true } | { error: string }> {
  const session = await auth()

  if (!session?.user || session.user.role !== 'seller' || !session.user.email) {
    return { error: 'Neturite teisės atlikti šį veiksmą' }
  }

  const [userRow] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, session.user.email))
    .limit(1)

  if (!userRow) {
    return { error: 'Nuomininko įrašas nerastas' }
  }

  // Fetch the seller's tenant record
  const [tenant] = await db
    .select({ id: tenants.id })
    .from(tenants)
    .where(eq(tenants.userId, userRow.id))
    .limit(1)

  if (!tenant) {
    return { error: 'Nuomininko įrašas nerastas' }
  }

  // Parse weekly data — empty strings become 0
  const weeks: WeekData[] = formData.weeks.map((w) => ({
    tx_count: w.tx_count === '' ? 0 : parseInt(w.tx_count),
    amount_eur: w.amount_eur === '' ? 0 : parseFloat(w.amount_eur),
  }))

  // Auto-sum totals from weekly breakdown
  const amount_eur = weeks.reduce((sum, w) => sum + w.amount_eur, 0)
  const tx_count = weeks.reduce((sum, w) => sum + w.tx_count, 0)

  // Store month as first day of the month — "YYYY-MM" → "YYYY-MM-01"
  const month = `${formData.month}-01`

  try {
    await db
      .insert(revenueReports)
      .values({
        userId: userRow.id,
        tenantId: tenant.id,
        month,
        amountEur: String(amount_eur),
        txCount: tx_count,
        weeks,
        submittedBy: formData.submitted_by,
        submittedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [revenueReports.tenantId, revenueReports.month],
        set: {
          userId: userRow.id,
          amountEur: String(amount_eur),
          txCount: tx_count,
          weeks,
          submittedBy: formData.submitted_by,
          submittedAt: new Date(),
        },
      })
  } catch (err) {
    console.error('[submitRevenue] upsert error:', err)
    return { error: 'Nepavyko išsaugoti duomenų' }
  }

  revalidatePath('/seller/revenue')
  return { success: true }
}
