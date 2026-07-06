'use server'
// actions/promos.ts — Server Actions for promos CRUD
// Defense-in-depth: each action verifies admin role independently (CVE-2025-29927)
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { PromoFormValues } from '@/lib/validations/promo'
import type { Promo } from '@/types/database'

async function getAdminClient() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== 'admin') return null
  // Use service role client so mutations bypass RLS (no admin INSERT/UPDATE/DELETE policies)
  return createAdminClient()
}

export async function createPromo(
  data: PromoFormValues
): Promise<{ data: Promo } | { error: string }> {
  const supabase = await getAdminClient()
  if (!supabase) return { error: 'Neturite teisės atlikti šį veiksmą' }

  const { data: created, error } = await supabase
    .from('promos')
    .insert({
      title: data.title,
      slug: data.slug,
      image: data.image,
      starts_at: data.starts_at,
      ends_at: data.ends_at,
      category: data.category,
      published: data.published,
    })
    .select()
    .single()

  if (error || !created) return { error: 'Nepavyko sukurti akcijos' }

  revalidatePath('/admin/articles')
  revalidatePath('/akcijos')
  return { data: created as Promo }
}

export async function updatePromo(
  id: string,
  data: PromoFormValues
): Promise<{ data: Promo } | { error: string }> {
  const supabase = await getAdminClient()
  if (!supabase) return { error: 'Neturite teisės atlikti šį veiksmą' }

  const { data: updated, error } = await supabase
    .from('promos')
    .update({
      title: data.title,
      slug: data.slug,
      image: data.image,
      starts_at: data.starts_at,
      ends_at: data.ends_at,
      category: data.category,
      published: data.published,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error || !updated) return { error: 'Nepavyko atnaujinti akcijos' }

  revalidatePath('/admin/articles')
  revalidatePath('/akcijos')
  revalidatePath(`/akcijos/${data.slug}`)
  return { data: updated as Promo }
}

export async function deletePromo(
  id: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await getAdminClient()
  if (!supabase) return { error: 'Neturite teisės atlikti šį veiksmą' }

  const { error } = await supabase.from('promos').delete().eq('id', id)
  if (error) return { error: 'Nepavyko ištrinti akcijos' }

  revalidatePath('/admin/articles')
  revalidatePath('/akcijos')
  return { success: true }
}

export async function togglePromoPublished(
  id: string,
  published: boolean
): Promise<{ data: Promo } | { error: string }> {
  const supabase = await getAdminClient()
  if (!supabase) return { error: 'Neturite teisės atlikti šį veiksmą' }

  const { data: updated, error } = await supabase
    .from('promos')
    .update({ published, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error || !updated) return { error: 'Nepavyko pakeisti būsenos' }

  revalidatePath('/admin/articles')
  revalidatePath('/akcijos')
  return { data: updated as Promo }
}
