'use server'
// actions/pages.ts — Server Actions for page content management
// Defense-in-depth: each action verifies admin role independently (CVE-2025-29927)
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type ContentUpdate = {
  section_key: string
  content_key: string
  value: string
}

export async function savePageContent(
  page_slug: string,
  updates: ContentUpdate[]
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.app_metadata?.role !== 'admin') {
    return { error: 'Neturite teisės atlikti šį veiksmą' }
  }

  const rows = updates.map((u) => ({
    page_slug,
    section_key: u.section_key,
    content_key: u.content_key,
    value: u.value,
    updated_at: new Date().toISOString(),
  }))

  const { error } = await supabase
    .from('page_sections')
    .upsert(rows, { onConflict: 'page_slug,section_key,content_key' })

  if (error) {
    return { error: 'Nepavyko išsaugoti puslapio turinio' }
  }

  revalidatePath('/')
  revalidatePath(`/admin/pages/${page_slug}`)
  return { success: true }
}
