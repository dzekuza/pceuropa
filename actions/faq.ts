'use server'
// actions/faq.ts — Server Actions for FAQ CRUD + reorder
// Defense-in-depth: each action verifies admin role independently (CVE-2025-29927)
import { revalidatePath } from 'next/cache'
import { desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { faqItems } from '@/drizzle/schema'
import { getRole } from '@/lib/auth/get-role'
import type { FaqFormValues } from '@/lib/validations/faq'
import type { FaqItem } from '@/types/database'

function toFaqItem(row: typeof faqItems.$inferSelect): FaqItem {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    sort_order: row.sortOrder,
    created_at: row.createdAt ? row.createdAt.toISOString() : null,
    attachments: row.attachments,
  }
}

/**
 * createFaqItem — Creates a new FAQ entry with auto-assigned sort_order.
 */
export async function createFaqItem(
  formData: FaqFormValues
): Promise<{ data: FaqItem } | { error: string }> {
  const role = await getRole()
  if (role !== 'admin') {
    return { error: 'Neturite teisės atlikti šį veiksmą' }
  }

  // Auto-assign sort_order = max existing sort_order + 1
  const [lastItem] = await db
    .select({ sortOrder: faqItems.sortOrder })
    .from(faqItems)
    .orderBy(desc(faqItems.sortOrder))
    .limit(1)

  const nextSortOrder = (lastItem?.sortOrder ?? 0) + 1

  let created: typeof faqItems.$inferSelect
  try {
    ;[created] = await db
      .insert(faqItems)
      .values({
        question: formData.question,
        answer: formData.answer,
        attachments: formData.attachments ?? [],
        sortOrder: nextSortOrder,
      })
      .returning()
  } catch (err) {
    console.error('[createFaqItem] insert error:', err)
    return { error: 'Nepavyko sukurti klausimo' }
  }

  revalidatePath('/admin/faq')
  return { data: toFaqItem(created) }
}

/**
 * updateFaqItem — Updates question and answer of an existing FAQ entry.
 */
export async function updateFaqItem(
  id: string,
  formData: FaqFormValues
): Promise<{ data: FaqItem } | { error: string }> {
  const role = await getRole()
  if (role !== 'admin') {
    return { error: 'Neturite teisės atlikti šį veiksmą' }
  }

  let updated: typeof faqItems.$inferSelect
  try {
    ;[updated] = await db
      .update(faqItems)
      .set({
        question: formData.question,
        answer: formData.answer,
        attachments: formData.attachments ?? [],
      })
      .where(eq(faqItems.id, id))
      .returning()
  } catch (err) {
    console.error('[updateFaqItem] update error:', err)
    return { error: 'Nepavyko atnaujinti klausimo' }
  }

  if (!updated) {
    return { error: 'Nepavyko atnaujinti klausimo' }
  }

  revalidatePath('/admin/faq')
  return { data: toFaqItem(updated) }
}

/**
 * deleteFaqItem — Deletes a FAQ entry by id.
 */
export async function deleteFaqItem(
  id: string
): Promise<{ success: true } | { error: string }> {
  const role = await getRole()
  if (role !== 'admin') {
    return { error: 'Neturite teisės atlikti šį veiksmą' }
  }

  try {
    await db.delete(faqItems).where(eq(faqItems.id, id))
  } catch (err) {
    console.error('[deleteFaqItem] delete error:', err)
    return { error: 'Nepavyko ištrinti klausimo' }
  }

  revalidatePath('/admin/faq')
  return { success: true }
}

/**
 * reorderFaqItems — Updates sort_order for each FAQ item to match the provided order.
 * Receives an array of FAQ item IDs in desired order.
 */
export async function reorderFaqItems(
  orderedIds: string[]
): Promise<{ success: true } | { error: string }> {
  const role = await getRole()
  if (role !== 'admin') {
    return { error: 'Neturite teisės atlikti šį veiksmą' }
  }

  // Update each item's sort_order to match its index in orderedIds
  for (let i = 0; i < orderedIds.length; i++) {
    try {
      await db
        .update(faqItems)
        .set({ sortOrder: i + 1 })
        .where(eq(faqItems.id, orderedIds[i]))
    } catch (err) {
      console.error('[reorderFaqItems] update error:', err)
      return { error: 'Nepavyko pertvarkyti klausimų' }
    }
  }

  revalidatePath('/admin/faq')
  revalidatePath('/seller/faq')
  return { success: true }
}
