'use server'
// actions/faq.ts — Server Actions for FAQ CRUD + reorder
// Defense-in-depth: each action verifies admin role independently (CVE-2025-29927)
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { FaqFormValues } from '@/lib/validations/faq'
import type { FaqItem } from '@/types/database'

/**
 * createFaqItem — Creates a new FAQ entry with auto-assigned sort_order.
 */
export async function createFaqItem(
  formData: FaqFormValues
): Promise<{ data: FaqItem } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user: callerUser },
  } = await supabase.auth.getUser()

  if (!callerUser || callerUser.app_metadata?.role !== 'admin') {
    return { error: 'Neturite teisės atlikti šį veiksmą' }
  }

  // Auto-assign sort_order = max existing sort_order + 1
  const { data: lastItem } = await supabase
    .from('faq_items')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const nextSortOrder = (lastItem?.sort_order ?? 0) + 1

  const { data: created, error } = await supabase
    .from('faq_items')
    .insert({
      question: formData.question,
      answer: formData.answer,
      attachments: formData.attachments ?? [],
      sort_order: nextSortOrder,
    })
    .select()
    .single()

  if (error || !created) {
    return { error: 'Nepavyko sukurti klausimo' }
  }

  revalidatePath('/admin/faq')
  return { data: created }
}

/**
 * updateFaqItem — Updates question and answer of an existing FAQ entry.
 */
export async function updateFaqItem(
  id: string,
  formData: FaqFormValues
): Promise<{ data: FaqItem } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user: callerUser },
  } = await supabase.auth.getUser()

  if (!callerUser || callerUser.app_metadata?.role !== 'admin') {
    return { error: 'Neturite teisės atlikti šį veiksmą' }
  }

  const { data: updated, error } = await supabase
    .from('faq_items')
    .update({
      question: formData.question,
      answer: formData.answer,
      attachments: formData.attachments ?? [],
    })
    .eq('id', id)
    .select()
    .single()

  if (error || !updated) {
    return { error: 'Nepavyko atnaujinti klausimo' }
  }

  revalidatePath('/admin/faq')
  return { data: updated }
}

/**
 * deleteFaqItem — Deletes a FAQ entry by id.
 */
export async function deleteFaqItem(
  id: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user: callerUser },
  } = await supabase.auth.getUser()

  if (!callerUser || callerUser.app_metadata?.role !== 'admin') {
    return { error: 'Neturite teisės atlikti šį veiksmą' }
  }

  const { error } = await supabase.from('faq_items').delete().eq('id', id)

  if (error) {
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
  const supabase = await createClient()
  const {
    data: { user: callerUser },
  } = await supabase.auth.getUser()

  if (!callerUser || callerUser.app_metadata?.role !== 'admin') {
    return { error: 'Neturite teisės atlikti šį veiksmą' }
  }

  // Update each item's sort_order to match its index in orderedIds
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase
      .from('faq_items')
      .update({ sort_order: i + 1 })
      .eq('id', orderedIds[i])

    if (error) {
      return { error: 'Nepavyko pertvarkyti klausimų' }
    }
  }

  revalidatePath('/admin/faq')
  revalidatePath('/seller/faq')
  return { success: true }
}
