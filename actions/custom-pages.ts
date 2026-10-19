'use server'
// actions/custom-pages.ts — Server Actions for admin-authored standalone pages
// Defense-in-depth: each action verifies admin role independently (CVE-2025-29927)
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { customPageFormSchema, type CustomPageFormValues } from '@/lib/validations/custom-page'
import { CUSTOM_PAGES_STRINGS } from '@/lib/strings'
import type { CustomPage } from '@/types/database'

const UNIQUE_VIOLATION = '23505'

async function getAdminClient() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== 'admin') return null
  return createAdminClient()
}

function revalidateCustomPage(slug: string) {
  revalidatePath('/admin/pages')
  revalidatePath(`/puslapiai/${slug}`)
  revalidatePath(`/en/puslapiai/${slug}`)
}

export async function createCustomPage(
  values: CustomPageFormValues
): Promise<{ data: CustomPage } | { error: string }> {
  const supabase = await getAdminClient()
  if (!supabase) return { error: 'Neturite teisės atlikti šį veiksmą' }

  const parsed = customPageFormSchema.safeParse(values)
  if (!parsed.success) return { error: CUSTOM_PAGES_STRINGS.errorSave }
  const data = parsed.data

  const { data: created, error } = await supabase
    .from('custom_pages')
    .insert({
      title: data.title,
      slug: data.slug,
      content: data.content,
      title_en: data.title_en || null,
      content_en: data.content_en || null,
      cover_image: data.cover_image,
      published: data.published,
      published_at: data.published ? new Date().toISOString() : null,
    })
    .select()
    .single()

  if (error?.code === UNIQUE_VIOLATION) return { error: CUSTOM_PAGES_STRINGS.errorSlugTaken }
  if (error || !created) return { error: CUSTOM_PAGES_STRINGS.errorSave }

  revalidateCustomPage(created.slug)
  return { data: created }
}

export async function updateCustomPage(
  id: string,
  values: CustomPageFormValues
): Promise<{ data: CustomPage } | { error: string }> {
  const supabase = await getAdminClient()
  if (!supabase) return { error: 'Neturite teisės atlikti šį veiksmą' }

  const parsed = customPageFormSchema.safeParse(values)
  if (!parsed.success) return { error: CUSTOM_PAGES_STRINGS.errorSave }
  const data = parsed.data

  const { data: existing } = await supabase
    .from('custom_pages')
    .select('slug, published')
    .eq('id', id)
    .single()
  if (!existing) return { error: CUSTOM_PAGES_STRINGS.errorSave }

  const now = new Date().toISOString()
  const { data: updated, error } = await supabase
    .from('custom_pages')
    .update({
      title: data.title,
      slug: data.slug,
      content: data.content,
      title_en: data.title_en || null,
      content_en: data.content_en || null,
      cover_image: data.cover_image,
      published: data.published,
      // Set published_at only on first publish
      ...(data.published && !existing.published ? { published_at: now } : {}),
      updated_at: now,
    })
    .eq('id', id)
    .select()
    .single()

  if (error?.code === UNIQUE_VIOLATION) return { error: CUSTOM_PAGES_STRINGS.errorSlugTaken }
  if (error || !updated) return { error: CUSTOM_PAGES_STRINGS.errorSave }

  revalidateCustomPage(updated.slug)
  if (existing.slug !== updated.slug) revalidateCustomPage(existing.slug)
  return { data: updated }
}

export async function deleteCustomPage(
  id: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await getAdminClient()
  if (!supabase) return { error: 'Neturite teisės atlikti šį veiksmą' }

  const { data: deleted, error } = await supabase
    .from('custom_pages')
    .delete()
    .eq('id', id)
    .select('slug')
    .single()
  if (error || !deleted) return { error: CUSTOM_PAGES_STRINGS.errorDelete }

  revalidateCustomPage(deleted.slug)
  return { success: true }
}
