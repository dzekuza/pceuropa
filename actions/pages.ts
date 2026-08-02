'use server'
// actions/pages.ts — Server Actions for page content management
// Defense-in-depth: each action verifies admin role independently (CVE-2025-29927)
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { pageSections } from '@/drizzle/schema'
import { getRole } from '@/lib/auth/get-role'

type ContentUpdate = {
  section_key: string
  content_key: string
  value: string
}

export async function savePageContent(
  page_slug: string,
  updates: ContentUpdate[]
): Promise<{ success: true } | { error: string }> {
  const role = await getRole()
  if (role !== 'admin') {
    return { error: 'Neturite teisės atlikti šį veiksmą' }
  }

  try {
    for (const u of updates) {
      await db
        .insert(pageSections)
        .values({
          pageSlug: page_slug,
          sectionKey: u.section_key,
          contentKey: u.content_key,
          value: u.value,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [pageSections.pageSlug, pageSections.sectionKey, pageSections.contentKey],
          set: { value: u.value, updatedAt: new Date() },
        })
    }
  } catch (err) {
    console.error('[savePageContent] upsert error:', err)
    return { error: 'Nepavyko išsaugoti puslapio turinio' }
  }

  revalidatePath('/')
  revalidatePath(`/admin/pages/${page_slug}`)
  return { success: true }
}
