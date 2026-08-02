'use server'
// actions/promos.ts — Server Actions for promos CRUD
// Defense-in-depth: each action verifies admin role independently (CVE-2025-29927)
import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { promos } from '@/drizzle/schema'
import { getRole } from '@/lib/auth/get-role'
import type { PromoFormValues } from '@/lib/validations/promo'
import type { Promo } from '@/types/database'

function toPromo(row: typeof promos.$inferSelect): Promo {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    image: row.image,
    starts_at: row.startsAt,
    ends_at: row.endsAt,
    category: row.category as Promo['category'],
    published: row.published,
    created_at: row.createdAt ? row.createdAt.toISOString() : null,
    updated_at: row.updatedAt ? row.updatedAt.toISOString() : null,
  }
}

async function requireAdmin(): Promise<boolean> {
  const role = await getRole()
  return role === 'admin'
}

export async function createPromo(
  data: PromoFormValues
): Promise<{ data: Promo } | { error: string }> {
  if (!(await requireAdmin())) return { error: 'Neturite teisės atlikti šį veiksmą' }

  let created: typeof promos.$inferSelect
  try {
    ;[created] = await db
      .insert(promos)
      .values({
        title: data.title,
        slug: data.slug,
        content: data.content,
        image: data.image,
        startsAt: data.starts_at,
        endsAt: data.ends_at,
        category: data.category,
        published: data.published,
      })
      .returning()
  } catch (err) {
    console.error('createPromo failed:', err)
    return { error: 'Nepavyko sukurti akcijos' }
  }

  revalidatePath('/admin/articles')
  revalidatePath('/akcijos')
  return { data: toPromo(created) }
}

export async function updatePromo(
  id: string,
  data: PromoFormValues
): Promise<{ data: Promo } | { error: string }> {
  if (!(await requireAdmin())) return { error: 'Neturite teisės atlikti šį veiksmą' }

  let updated: typeof promos.$inferSelect
  try {
    ;[updated] = await db
      .update(promos)
      .set({
        title: data.title,
        slug: data.slug,
        content: data.content,
        image: data.image,
        startsAt: data.starts_at,
        endsAt: data.ends_at,
        category: data.category,
        published: data.published,
        updatedAt: new Date(),
      })
      .where(eq(promos.id, id))
      .returning()
  } catch (err) {
    console.error('updatePromo failed:', err)
    return { error: 'Nepavyko atnaujinti akcijos' }
  }

  if (!updated) return { error: 'Nepavyko atnaujinti akcijos' }

  revalidatePath('/admin/articles')
  revalidatePath('/akcijos')
  revalidatePath(`/akcijos/${data.slug}`)
  return { data: toPromo(updated) }
}

export async function deletePromo(
  id: string
): Promise<{ success: true } | { error: string }> {
  if (!(await requireAdmin())) return { error: 'Neturite teisės atlikti šį veiksmą' }

  try {
    await db.delete(promos).where(eq(promos.id, id))
  } catch (err) {
    console.error('deletePromo failed:', err)
    return { error: 'Nepavyko ištrinti akcijos' }
  }

  revalidatePath('/admin/articles')
  revalidatePath('/akcijos')
  return { success: true }
}

export async function togglePromoPublished(
  id: string,
  published: boolean
): Promise<{ data: Promo } | { error: string }> {
  if (!(await requireAdmin())) return { error: 'Neturite teisės atlikti šį veiksmą' }

  let updated: typeof promos.$inferSelect
  try {
    ;[updated] = await db
      .update(promos)
      .set({ published, updatedAt: new Date() })
      .where(eq(promos.id, id))
      .returning()
  } catch (err) {
    console.error('togglePromoPublished failed:', err)
    return { error: 'Nepavyko pakeisti būsenos' }
  }

  if (!updated) return { error: 'Nepavyko pakeisti būsenos' }

  revalidatePath('/admin/articles')
  revalidatePath('/akcijos')
  return { data: toPromo(updated) }
}
