'use server'
// actions/tenants.ts — Server Actions for tenant CRUD operations
// Defense-in-depth: each action verifies admin role independently (CVE-2025-29927)
import { revalidatePath, revalidateTag } from 'next/cache'
import { eq, inArray, like } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { tenants, users } from '@/drizzle/schema'
import { getRole } from '@/lib/auth/get-role'
import { createUser as createAuthUser } from '@/lib/auth/admin-users'
import { slugify } from '@/lib/slugify'
import { TENANTS_PUBLIC_CACHE_TAG } from '@/lib/tenants-public'
import type { TenantFormValues } from '@/lib/validations/tenant'

const BCRYPT_ROUNDS = 10

/**
 * generateUniqueTenantSlug — slugifies store_name and appends a numeric
 * suffix if it collides with an existing tenant slug (column is unique).
 */
async function generateUniqueTenantSlug(
  storeName: string,
  reserved?: Set<string>
): Promise<string> {
  const base = slugify(storeName) || 'parduotuve'
  const rows = await db
    .select({ slug: tenants.slug })
    .from(tenants)
    .where(like(tenants.slug, `${base}%`))
  const existing = new Set(rows.map((r) => r.slug))
  reserved?.forEach((s) => existing.add(s))

  let slug = base
  let n = 2
  while (existing.has(slug)) slug = `${base}-${n++}`

  reserved?.add(slug)
  return slug
}

/**
 * createTenant — Creates auth user + tenant record atomically.
 * On partial failure (auth user created but tenant insert fails), orphaned auth user is cleaned up.
 *
 * NOTE: lib/auth/admin-users.ts's createUser() always generates a random,
 * never-communicated password (its own header comment: sellers are meant to
 * reach their account only via admin-initiated impersonation, never a direct
 * password login). This call site collects an explicit formData.password for
 * DIRECT seller login instead, so it can't go through that helper unchanged —
 * it inserts into `users` directly with formData.password bcrypt-hashed, same
 * as the original Supabase auth.admin.createUser({ email, password }) call.
 * Flagging this business-logic mismatch explicitly: confirm with whoever owns
 * the seller-login flow whether direct password login for sellers is still
 * intended post-migration, since admin-users.ts's design assumes it is not.
 */
export async function createTenant(
  formData: TenantFormValues
): Promise<{ success: true } | { error: string }> {
  const role = await getRole()
  if (role !== 'admin') {
    return { error: 'Neturite teisės atlikti šį veiksmą' }
  }

  if (!formData.username || formData.username.length < 3) {
    return { error: 'Vartotojo vardas turi būti bent 3 simbolių' }
  }
  if (!formData.password || formData.password.length < 6) {
    return { error: 'Slaptažodis turi būti bent 6 simbolių' }
  }

  const email = `${formData.username}@pceuropa.lt`
  const passwordHash = await bcrypt.hash(formData.password, BCRYPT_ROUNDS)

  let newUserId: string
  try {
    const [row] = await db
      .insert(users)
      .values({ email, role: 'seller', passwordHash })
      .returning({ id: users.id })
    newUserId = row.id
  } catch (err) {
    console.error('[createTenant] user insert error:', err)
    return { error: 'Nepavyko sukurti vartotojo paskyros' }
  }

  const slug = await generateUniqueTenantSlug(formData.store_name)

  try {
    await db.insert(tenants).values({
      userId: newUserId,
      slug,
      storeName: formData.store_name,
      operator: formData.operator ?? null,
      companyCode: formData.company_code ?? null,
      category: formData.category,
      spaceM2: formData.space_m2,
      rentEur: formData.rent_eur || null,
      description: formData.description ?? null,
      logoUrl: formData.logo_url ?? null,
      galleryImages: formData.gallery_images ?? [],
      weekdayHours: formData.weekday_hours || undefined,
      saturdayHours: formData.saturday_hours || undefined,
      sundayHours: formData.sunday_hours || undefined,
    })
  } catch (err) {
    // Clean up orphaned auth user to avoid ghost accounts
    await db.delete(users).where(eq(users.id, newUserId))
    console.error('[createTenant] tenant insert error:', err)
    return { error: 'Nepavyko išsaugoti nuomininko duomenų' }
  }

  revalidatePath('/admin/tenants')
  revalidateTag(TENANTS_PUBLIC_CACHE_TAG, 'max')
  return { success: true }
}

/**
 * updateTenant — Updates tenant record fields (not auth user credentials).
 */
export async function updateTenant(
  tenantId: string,
  formData: Partial<TenantFormValues>
): Promise<{ success: true } | { error: string }> {
  const role = await getRole()
  if (role !== 'admin') {
    return { error: 'Neturite teisės atlikti šį veiksmą' }
  }

  try {
    await db
      .update(tenants)
      .set({
        storeName: formData.store_name,
        operator: formData.operator ?? null,
        companyCode: formData.company_code ?? null,
        category: formData.category,
        spaceM2: formData.space_m2 != null ? formData.space_m2 : undefined,
        rentEur: formData.rent_eur != null ? formData.rent_eur : undefined,
        description: formData.description ?? null,
        logoUrl: formData.logo_url ?? null,
        galleryImages: formData.gallery_images ?? [],
        weekdayHours: formData.weekday_hours || undefined,
        saturdayHours: formData.saturday_hours || undefined,
        sundayHours: formData.sunday_hours || undefined,
      })
      .where(eq(tenants.id, tenantId))
  } catch (err) {
    console.error('[updateTenant] update error:', err)
    return { error: 'Nepavyko atnaujinti nuomininko duomenų' }
  }

  revalidatePath('/admin/tenants')
  revalidateTag(TENANTS_PUBLIC_CACHE_TAG, 'max')
  return { success: true }
}

/**
 * deleteTenant — Removes tenant record then deletes auth user.
 */
export async function deleteTenant(
  tenantId: string
): Promise<{ success: true } | { error: string }> {
  const role = await getRole()
  if (role !== 'admin') {
    return { error: 'Neturite teisės atlikti šį veiksmą' }
  }

  const [tenant] = await db
    .select({ userId: tenants.userId })
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1)

  if (!tenant) {
    return { error: 'Nuomininkas nerastas' }
  }

  try {
    await db.delete(tenants).where(eq(tenants.id, tenantId))
  } catch (err) {
    console.error('[deleteTenant] delete error:', err)
    return { error: 'Nepavyko ištrinti nuomininko' }
  }

  if (tenant.userId) {
    await db.delete(users).where(eq(users.id, tenant.userId))
  }

  revalidatePath('/admin/tenants')
  revalidateTag(TENANTS_PUBLIC_CACHE_TAG, 'max')
  return { success: true }
}

/**
 * createTenantAccount — Creates an auth user for an existing tenant that has no user_id.
 * Derives email from store_name; uses admin-users.ts's createUser() since this
 * flow (unlike createTenant above) matches its assumption exactly — a random,
 * never-communicated password, with access only via admin impersonation.
 */
export async function createTenantAccount(
  tenantId: string
): Promise<{ success: true; userId: string } | { error: string }> {
  const role = await getRole()
  if (role !== 'admin') {
    return { error: 'Neturite teisės atlikti šį veiksmą' }
  }

  const [tenant] = await db
    .select({ storeName: tenants.storeName, userId: tenants.userId })
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1)

  if (!tenant) {
    return { error: 'Nuomininkas nerastas' }
  }

  if (tenant.userId) {
    return { success: true, userId: tenant.userId }
  }

  const username = tenant.storeName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')

  let newUser: { id: string; email: string }
  try {
    newUser = await createAuthUser({
      email: `${username}@pceuropa.lt`,
      role: 'seller',
    })
  } catch (err) {
    console.error('[createTenantAccount] createUser error:', err)
    return { error: 'Nepavyko sukurti vartotojo paskyros' }
  }

  try {
    await db.update(tenants).set({ userId: newUser.id }).where(eq(tenants.id, tenantId))
  } catch (err) {
    await db.delete(users).where(eq(users.id, newUser.id))
    console.error('[createTenantAccount] tenant update error:', err)
    return { error: 'Nepavyko susieti vartotojo paskyros' }
  }

  revalidatePath(`/admin/tenants/${tenantId}`)
  return { success: true, userId: newUser.id }
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
  const role = await getRole()
  if (role !== 'admin') {
    return { imported: 0, errors: ['Neturite teisės atlikti šį veiksmą'] }
  }

  if (!rows.length) return { imported: 0, errors: [] }

  const errors: string[] = []
  let imported = 0

  const toUpdate = rows.filter((r) => r.id?.trim())
  const toInsert = rows.filter((r) => !r.id?.trim())

  // Slugs are immutable once assigned — look up the existing ones so the
  // upsert below doesn't need to (re)generate them for already-published tenants.
  const existingSlugRows = toUpdate.length
    ? await db
        .select({ id: tenants.id, slug: tenants.slug })
        .from(tenants)
        .where(inArray(tenants.id, toUpdate.map((r) => r.id as string)))
    : []
  const slugById = new Map(existingSlugRows.map((t) => [t.id, t.slug]))

  // Update existing tenants (matched by id)
  const CHUNK = 50
  for (let i = 0; i < toUpdate.length; i += CHUNK) {
    const chunk = toUpdate.slice(i, i + CHUNK)
    try {
      for (const r of chunk) {
        await db
          .update(tenants)
          .set({
            slug: slugById.get(r.id as string) as string,
            storeName: r.store_name,
            operator: r.operator ?? null,
            companyCode: r.company_code ?? null,
            category: r.category ?? null,
            spaceM2: r.space_m2 != null ? String(r.space_m2) : null,
            rentEur: r.rent_eur != null ? String(r.rent_eur) : null,
            description: r.description ?? null,
            logoUrl: r.logo_url ?? null,
            galleryImages: r.gallery_images ?? [],
          })
          .where(eq(tenants.id, r.id as string))
      }
      imported += chunk.length
    } catch (err) {
      console.error('[importTenants] update error:', err)
      errors.push(`Atnaujinimas (eilutės ${i + 1}–${i + chunk.length}): nepavyko`)
    }
  }

  // Insert new tenants (no id present)
  const reservedSlugs = new Set<string>()
  for (let i = 0; i < toInsert.length; i += CHUNK) {
    const chunk = toInsert.slice(i, i + CHUNK)
    try {
      const records = []
      for (const r of chunk) {
        records.push({
          userId: null,
          slug: await generateUniqueTenantSlug(r.store_name, reservedSlugs),
          storeName: r.store_name,
          operator: r.operator ?? null,
          companyCode: r.company_code ?? null,
          category: r.category ?? null,
          spaceM2: r.space_m2 != null ? String(r.space_m2) : null,
          rentEur: r.rent_eur != null ? String(r.rent_eur) : null,
          description: r.description ?? null,
          logoUrl: r.logo_url ?? null,
          galleryImages: r.gallery_images ?? [],
        })
      }

      await db.insert(tenants).values(records)
      imported += chunk.length
    } catch (err) {
      console.error('[importTenants] insert error:', err)
      errors.push(`Kūrimas (eilutės ${i + 1}–${i + chunk.length}): nepavyko`)
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
  const role = await getRole()
  if (role !== 'admin') {
    return { error: 'Neturite teisės atlikti šį veiksmą' }
  }

  if (!tenantIds.length) return { updated: 0 }

  try {
    await db.update(tenants).set({ category }).where(inArray(tenants.id, tenantIds))
  } catch (err) {
    console.error('[bulkUpdateTenantCategory] update error:', err)
    return { error: 'Nepavyko atnaujinti kategorijos' }
  }

  revalidatePath('/admin/tenants')
  revalidateTag(TENANTS_PUBLIC_CACHE_TAG, 'max')
  return { updated: tenantIds.length }
}

/**
 * bulkDeleteTenants — Removes tenant records and their auth users.
 */
export async function bulkDeleteTenants(
  tenantIds: string[]
): Promise<{ deleted: number; errors: string[] }> {
  const role = await getRole()
  if (role !== 'admin') {
    return { deleted: 0, errors: ['Neturite teisės atlikti šį veiksmą'] }
  }

  if (!tenantIds.length) return { deleted: 0, errors: [] }

  const matchedTenants = await db
    .select({ id: tenants.id, userId: tenants.userId })
    .from(tenants)
    .where(inArray(tenants.id, tenantIds))

  if (!matchedTenants.length) {
    return { deleted: 0, errors: ['Nuomininkai nerasti'] }
  }

  try {
    await db.delete(tenants).where(inArray(tenants.id, tenantIds))
  } catch (err) {
    console.error('[bulkDeleteTenants] delete error:', err)
    return { deleted: 0, errors: ['Nepavyko ištrinti nuomininkų'] }
  }

  const userIds = matchedTenants.map((t) => t.userId).filter((id): id is string => !!id)
  if (userIds.length) {
    await db.delete(users).where(inArray(users.id, userIds))
  }

  revalidatePath('/admin/tenants')
  revalidateTag(TENANTS_PUBLIC_CACHE_TAG, 'max')
  return { deleted: matchedTenants.length, errors: [] }
}

/**
 * resetPassword — Updates the auth user's password for a given tenant.
 * Requires the tenant's user_id (fetched from the tenants table first).
 */
export async function resetPassword(
  tenantId: string,
  newPassword: string
): Promise<{ success: true } | { error: string }> {
  const role = await getRole()
  if (role !== 'admin') {
    return { error: 'Neturite teisės atlikti šį veiksmą' }
  }

  if (!newPassword || newPassword.length < 10) {
    return { error: 'Slaptažodis turi būti bent 10 simbolių' }
  }

  const [tenant] = await db
    .select({ userId: tenants.userId })
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1)

  if (!tenant?.userId) {
    return { error: 'Nuomininkas nerastas' }
  }

  try {
    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS)
    await db.update(users).set({ passwordHash }).where(eq(users.id, tenant.userId))
  } catch (err) {
    console.error('[resetPassword] update error:', err)
    return { error: 'Nepavyko pakeisti slaptažodžio' }
  }

  return { success: true }
}
