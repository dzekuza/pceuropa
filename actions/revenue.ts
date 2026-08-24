'use server'
// actions/revenue.ts — Server Action for seller revenue submission (weekly breakdown)
// Defense-in-depth: verifies seller role on every call (CVE-2025-29927)
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { RevenueFormValues } from '@/lib/validations/revenue'
import type { Json, WeekData } from '@/types/database'

/**
 * submitRevenue — Upserts a revenue_report with weekly breakdown.
 * Parses week strings to numbers, computes totals, stores both.
 */
export async function submitRevenue(
  formData: RevenueFormValues
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient()

  // Defense-in-depth auth check
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.app_metadata?.role !== 'seller') {
    return { error: 'Neturite teisės atlikti šį veiksmą' }
  }

  // Fetch the seller's tenant record
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (tenantError || !tenant) {
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

  const { error: upsertError } = await supabase
    .from('revenue_reports')
    .upsert(
      {
        user_id: user.id,
        tenant_id: tenant.id,
        month,
        amount_eur,
        tx_count,
        weeks: weeks as unknown as Json,
        submitted_by: formData.submitted_by,
        submitted_at: new Date().toISOString(),
      },
      { onConflict: 'tenant_id,month' }
    )

  if (upsertError) {
    return { error: 'Nepavyko išsaugoti duomenų' }
  }

  revalidatePath('/seller/revenue')
  return { success: true }
}
