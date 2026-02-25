'use server'
// actions/tenants.ts — Server Actions for tenant CRUD operations
// Defense-in-depth: each action verifies admin role independently (CVE-2025-29927)
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { TenantFormValues } from '@/lib/validations/tenant'

/**
 * createTenant — Creates auth user + tenant record atomically.
 * On partial failure (auth user created but tenant insert fails), orphaned auth user is cleaned up.
 */
export async function createTenant(
  formData: TenantFormValues
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user: callerUser },
  } = await supabase.auth.getUser()

  if (!callerUser || callerUser.app_metadata?.role !== 'admin') {
    return { error: 'Neturite teisės atlikti šį veiksmą' }
  }

  const adminClient = createAdminClient()

  // Step 1: create auth user with seller role
  const { data: authData, error: authError } =
    await adminClient.auth.admin.createUser({
      email: `${formData.username}@pceuropa.lt`,
      password: formData.password,
      email_confirm: true,
      app_metadata: { role: 'seller' },
    })

  if (authError || !authData.user) {
    return {
      error: authError?.message ?? 'Nepavyko sukurti vartotojo',
    }
  }

  const newUserId = authData.user.id

  // Step 2: insert tenant record via admin client (bypasses RLS — regular client's
  // JWT may not yet reflect admin role for WITH CHECK on INSERT)
  const { error: tenantError } = await adminClient.from('tenants').insert({
    user_id: newUserId,
    store_name: formData.store_name,
    operator: formData.operator ?? null,
    company_code: formData.company_code ?? null,
    category: formData.category,
    space_m2: parseFloat(formData.space_m2),
    rent_eur: parseFloat(formData.rent_eur),
  })

  if (tenantError) {
    // Clean up orphaned auth user to avoid ghost accounts
    await adminClient.auth.admin.deleteUser(newUserId)
    return { error: 'Nepavyko išsaugoti nuomininko duomenų' }
  }

  revalidatePath('/admin/tenants')
  return { success: true }
}

/**
 * updateTenant — Updates tenant record fields (not auth user credentials).
 */
export async function updateTenant(
  tenantId: string,
  formData: Partial<TenantFormValues>
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user: callerUser },
  } = await supabase.auth.getUser()

  if (!callerUser || callerUser.app_metadata?.role !== 'admin') {
    return { error: 'Neturite teisės atlikti šį veiksmą' }
  }

  const { error } = await supabase
    .from('tenants')
    .update({
      store_name: formData.store_name,
      operator: formData.operator ?? null,
      company_code: formData.company_code ?? null,
      category: formData.category,
      space_m2: formData.space_m2 != null ? parseFloat(formData.space_m2) : undefined,
      rent_eur: formData.rent_eur != null ? parseFloat(formData.rent_eur) : undefined,
    })
    .eq('id', tenantId)

  if (error) {
    return { error: 'Nepavyko atnaujinti nuomininko duomenų' }
  }

  revalidatePath('/admin/tenants')
  return { success: true }
}

/**
 * deleteTenant — Removes tenant record then deletes auth user.
 */
export async function deleteTenant(
  tenantId: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user: callerUser },
  } = await supabase.auth.getUser()

  if (!callerUser || callerUser.app_metadata?.role !== 'admin') {
    return { error: 'Neturite teisės atlikti šį veiksmą' }
  }

  // Fetch tenant's user_id before deleting
  const { data: tenant, error: fetchError } = await supabase
    .from('tenants')
    .select('user_id')
    .eq('id', tenantId)
    .single()

  if (fetchError || !tenant) {
    return { error: 'Nuomininkas nerastas' }
  }

  // Delete tenant record first (FK constraint)
  const { error: deleteError } = await supabase
    .from('tenants')
    .delete()
    .eq('id', tenantId)

  if (deleteError) {
    return { error: 'Nepavyko ištrinti nuomininko' }
  }

  // Delete auth user (admin client required for auth.admin.*)
  if (tenant.user_id) {
    const adminClient = createAdminClient()
    await adminClient.auth.admin.deleteUser(tenant.user_id)
  }

  revalidatePath('/admin/tenants')
  return { success: true }
}
