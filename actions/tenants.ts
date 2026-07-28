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

  if (!formData.username || formData.username.length < 3) {
    return { error: 'Vartotojo vardas turi būti bent 3 simbolių' }
  }
  if (!formData.password || formData.password.length < 6) {
    return { error: 'Slaptažodis turi būti bent 6 simbolių' }
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
    console.error('[createTenant] auth.admin.createUser error:', authError)
    return { error: 'Nepavyko sukurti vartotojo paskyros' }
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
    rent_eur: formData.rent_eur ? parseFloat(formData.rent_eur) : null,
    description: formData.description ?? null,
    logo_url: formData.logo_url ?? null,
    gallery_images: formData.gallery_images ?? [],
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
      description: formData.description ?? null,
      logo_url: formData.logo_url ?? null,
      gallery_images: formData.gallery_images ?? [],
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

/**
 * createTenantAccount — Creates an auth user for an existing tenant that has no user_id.
 * Derives email from store_name, uses existing login_password or a default.
 */
export async function createTenantAccount(
  tenantId: string
): Promise<{ success: true; userId: string } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user: callerUser },
  } = await supabase.auth.getUser()

  if (!callerUser || callerUser.app_metadata?.role !== 'admin') {
    return { error: 'Neturite teisės atlikti šį veiksmą' }
  }

  const adminClient = createAdminClient()

  const { data: tenant, error: fetchError } = await adminClient
    .from('tenants')
    .select('store_name, user_id')
    .eq('id', tenantId)
    .single()

  if (fetchError || !tenant) {
    return { error: 'Nuomininkas nerastas' }
  }

  if (tenant.user_id) {
    return { success: true, userId: tenant.user_id }
  }

  const username = tenant.store_name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')

  const { randomBytes } = await import('crypto')
  const password = randomBytes(16).toString('hex')

  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: `${username}@pceuropa.lt`,
    password,
    email_confirm: true,
    app_metadata: { role: 'seller' },
  })

  if (authError || !authData.user) {
    console.error('[createTenantAccount] auth.admin.createUser error:', authError)
    return { error: 'Nepavyko sukurti vartotojo paskyros' }
  }

  const { error: updateError } = await adminClient
    .from('tenants')
    .update({ user_id: authData.user.id })
    .eq('id', tenantId)

  if (updateError) {
    await adminClient.auth.admin.deleteUser(authData.user.id)
    return { error: 'Nepavyko susieti vartotojo paskyros' }
  }

  revalidatePath(`/admin/tenants/${tenantId}`)
  return { success: true, userId: authData.user.id }
}

export interface TenantImportRow {
  id?: string | null
  store_name: string
  operator?: string | null
  company_code?: string | null
  category?: string | null
  space_m2?: number | null
  rent_eur?: number | null
  description?: string | null
  logo_url?: string | null
  gallery_images?: string[] | null
}

/**
 * importTenants — Bulk-inserts tenant records without creating auth accounts.
 * Imported tenants get user_id: null. Admins can create accounts per-tenant later.
 */
export async function importTenants(
  rows: TenantImportRow[]
): Promise<{ imported: number; errors: string[] }> {
  const supabase = await createClient()
  const {
    data: { user: callerUser },
  } = await supabase.auth.getUser()

  if (!callerUser || callerUser.app_metadata?.role !== 'admin') {
    return { imported: 0, errors: ['Neturite teisės atlikti šį veiksmą'] }
  }

  if (!rows.length) return { imported: 0, errors: [] }

  const adminClient = createAdminClient()
  const errors: string[] = []
  let imported = 0

  const toUpdate = rows.filter((r) => r.id?.trim())
  const toInsert = rows.filter((r) => !r.id?.trim())

  // Update existing tenants (matched by id)
  const CHUNK = 50
  for (let i = 0; i < toUpdate.length; i += CHUNK) {
    const chunk = toUpdate.slice(i, i + CHUNK)
    const records = chunk.map((r) => ({
      id: r.id as string,
      store_name: r.store_name,
      operator: r.operator ?? null,
      company_code: r.company_code ?? null,
      category: r.category ?? null,
      space_m2: r.space_m2 ?? null,
      rent_eur: r.rent_eur ?? null,
      description: r.description ?? null,
      logo_url: r.logo_url ?? null,
      gallery_images: r.gallery_images ?? [],
    }))

    const { error } = await adminClient
      .from('tenants')
      .upsert(records, { onConflict: 'id', ignoreDuplicates: false })
    if (error) {
      console.error('[importTenants] upsert error:', error.message)
      errors.push(`Atnaujinimas (eilutės ${i + 1}–${i + chunk.length}): nepavyko`)
    } else {
      imported += chunk.length
    }
  }

  // Insert new tenants (no id present)
  for (let i = 0; i < toInsert.length; i += CHUNK) {
    const chunk = toInsert.slice(i, i + CHUNK)
    const records = chunk.map((r) => ({
      user_id: null,
      store_name: r.store_name,
      operator: r.operator ?? null,
      company_code: r.company_code ?? null,
      category: r.category ?? null,
      space_m2: r.space_m2 ?? null,
      rent_eur: r.rent_eur ?? null,
      description: r.description ?? null,
      logo_url: r.logo_url ?? null,
      gallery_images: r.gallery_images ?? [],
    }))

    const { error } = await adminClient.from('tenants').insert(records)
    if (error) {
      console.error('[importTenants] insert error:', error.message)
      errors.push(`Kūrimas (eilutės ${i + 1}–${i + chunk.length}): nepavyko`)
    } else {
      imported += chunk.length
    }
  }

  if (imported > 0) revalidatePath('/admin/tenants')
  return { imported, errors }
}

/**
 * bulkUpdateTenantCategory — Sets category on many tenants at once.
 */
export async function bulkUpdateTenantCategory(
  tenantIds: string[],
  category: string
): Promise<{ updated: number } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user: callerUser },
  } = await supabase.auth.getUser()

  if (!callerUser || callerUser.app_metadata?.role !== 'admin') {
    return { error: 'Neturite teisės atlikti šį veiksmą' }
  }

  if (!tenantIds.length) return { updated: 0 }

  const { error } = await supabase
    .from('tenants')
    .update({ category })
    .in('id', tenantIds)

  if (error) {
    return { error: 'Nepavyko atnaujinti kategorijos' }
  }

  revalidatePath('/admin/tenants')
  return { updated: tenantIds.length }
}

/**
 * bulkDeleteTenants — Removes tenant records and their auth users.
 */
export async function bulkDeleteTenants(
  tenantIds: string[]
): Promise<{ deleted: number; errors: string[] }> {
  const supabase = await createClient()
  const {
    data: { user: callerUser },
  } = await supabase.auth.getUser()

  if (!callerUser || callerUser.app_metadata?.role !== 'admin') {
    return { deleted: 0, errors: ['Neturite teisės atlikti šį veiksmą'] }
  }

  if (!tenantIds.length) return { deleted: 0, errors: [] }

  const { data: tenants, error: fetchError } = await supabase
    .from('tenants')
    .select('id, user_id')
    .in('id', tenantIds)

  if (fetchError || !tenants) {
    return { deleted: 0, errors: ['Nuomininkai nerasti'] }
  }

  const { error: deleteError } = await supabase
    .from('tenants')
    .delete()
    .in('id', tenantIds)

  if (deleteError) {
    return { deleted: 0, errors: ['Nepavyko ištrinti nuomininkų'] }
  }

  const userIds = tenants.map((t) => t.user_id).filter((id): id is string => !!id)
  if (userIds.length) {
    const adminClient = createAdminClient()
    await Promise.all(userIds.map((id) => adminClient.auth.admin.deleteUser(id)))
  }

  revalidatePath('/admin/tenants')
  return { deleted: tenants.length, errors: [] }
}

/**
 * resetPassword — Updates the auth user's password for a given tenant.
 * Requires the tenant's user_id (fetched from the tenants table first).
 */
export async function resetPassword(
  tenantId: string,
  newPassword: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user: callerUser },
  } = await supabase.auth.getUser()

  if (!callerUser || callerUser.app_metadata?.role !== 'admin') {
    return { error: 'Neturite teisės atlikti šį veiksmą' }
  }

  if (!newPassword || newPassword.length < 10) {
    return { error: 'Slaptažodis turi būti bent 10 simbolių' }
  }

  // Fetch the tenant's auth user_id
  const { data: tenant, error: fetchError } = await supabase
    .from('tenants')
    .select('user_id')
    .eq('id', tenantId)
    .single()

  if (fetchError || !tenant?.user_id) {
    return { error: 'Nuomininkas nerastas' }
  }

  const adminClient = createAdminClient()
  const { error: authError } = await adminClient.auth.admin.updateUserById(
    tenant.user_id,
    { password: newPassword }
  )

  if (authError) {
    return { error: 'Nepavyko pakeisti slaptažodžio' }
  }

  return { success: true }
}
