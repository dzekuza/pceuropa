'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isAdminUser } from '@/lib/admin/is-admin'
import type { PageContentMap } from '@/lib/edit-toolbar/types'

interface ActionResult {
  success: boolean
  error?: string
}

async function requireAdmin() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  if (!isAdminUser(data.user)) {
    return { supabase, user: null } as const
  }
  return { supabase, user: data.user } as const
}

/**
 * Idempotent: called every time Edit is switched on. Seeds draft_data from
 * published_data only if no draft exists yet; if a draft is already in
 * progress (draft_status !== 'none', e.g. a resumed session), this is a
 * no-op so re-entering edit mode never clobbers unpublished work.
 */
export async function ensureDraft(slug: string): Promise<ActionResult> {
  const { supabase, user } = await requireAdmin()
  if (!user) return { success: false, error: 'Not authorized' }

  const { data: row, error: fetchError } = await supabase
    .from('page_content')
    .select('published_data, draft_status')
    .eq('page_slug', slug)
    .maybeSingle()
  if (fetchError) return { success: false, error: fetchError.message }

  if (row?.draft_status && row.draft_status !== 'none') {
    return { success: true }
  }

  const publishedData = row?.published_data ?? {}

  const { error } = await supabase.from('page_content').upsert(
    {
      page_slug: slug,
      published_data: publishedData,
      draft_data: publishedData,
      draft_status: 'editing',
      updated_by: user.id,
    },
    { onConflict: 'page_slug' },
  )
  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function saveDraft(slug: string, patch: PageContentMap): Promise<ActionResult> {
  const { supabase, user } = await requireAdmin()
  if (!user) return { success: false, error: 'Not authorized' }

  const { data: row, error: fetchError } = await supabase
    .from('page_content')
    .select('draft_data')
    .eq('page_slug', slug)
    .maybeSingle()
  if (fetchError) return { success: false, error: fetchError.message }

  const merged = { ...((row?.draft_data as PageContentMap | null) ?? {}), ...patch }

  const { error } = await supabase
    .from('page_content')
    .update({ draft_data: merged, draft_status: 'editing', updated_by: user.id })
    .eq('page_slug', slug)
  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function publishDraft(slug: string): Promise<ActionResult> {
  const { supabase, user } = await requireAdmin()
  if (!user) return { success: false, error: 'Not authorized' }

  const { data: row, error: fetchError } = await supabase
    .from('page_content')
    .select('draft_data')
    .eq('page_slug', slug)
    .maybeSingle()
  if (fetchError) return { success: false, error: fetchError.message }
  if (!row?.draft_data) return { success: false, error: 'No draft to publish' }

  const { error } = await supabase
    .from('page_content')
    .update({
      published_data: row.draft_data,
      draft_data: null,
      draft_status: 'none',
      updated_by: user.id,
    })
    .eq('page_slug', slug)
  if (error) return { success: false, error: error.message }

  revalidatePath(`/${slug}`)
  return { success: true }
}

export async function resetDraft(slug: string): Promise<ActionResult> {
  const { supabase, user } = await requireAdmin()
  if (!user) return { success: false, error: 'Not authorized' }

  const { error } = await supabase
    .from('page_content')
    .update({ draft_data: null, draft_status: 'none', updated_by: user.id })
    .eq('page_slug', slug)
  if (error) return { success: false, error: error.message }
  return { success: true }
}

/** Not implemented yet -- placeholder so the toolbar's Unpublish button has a real action to call. */
export async function unpublishDraft(_slug: string): Promise<ActionResult> {
  console.warn('[edit-toolbar] unpublishDraft is not implemented yet')
  return { success: false, error: 'Not implemented' }
}
