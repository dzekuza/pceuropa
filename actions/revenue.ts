'use server'
// actions/revenue.ts — Server Action for seller revenue submission
// Defense-in-depth: verifies seller role on every call (CVE-2025-29927)
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { RevenueFormValues } from '@/lib/validations/revenue'

/**
 * submitRevenue — Upserts a revenue_report row for the authenticated seller.
 * Handles both new submission (REVN-01) and update of existing month (REVN-03).
 * The DB UNIQUE(tenant_id, month) constraint enforces REVN-04 — no duplicates.
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

  // Fetch the seller's tenant record — need tenant_id for FK in revenue_reports
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (tenantError || !tenant) {
    return { error: 'Nuomininko įrašas nerastas' }
  }

  const amount_eur = parseFloat(formData.amount_eur)
  const tx_count = parseInt(formData.tx_count)
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
