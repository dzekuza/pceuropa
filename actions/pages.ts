'use server'
// actions/pages.ts — Server Actions for page content management
// Defense-in-depth: each action verifies admin role independently (CVE-2025-29927)
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { pageSections } from '@/drizzle/schema'
import { getRole } from '@/lib/auth/get-role'
import { getPageConfig } from '@/lib/page-config'

const MAX_VALUE_LENGTH = 10_000

type ContentUpdate = {
  section_key: string
  content_key: string
  value: string
}

// Server Actions are callable with any payload regardless of what the admin
// UI sends, so page_slug/section_key/content_key must be checked against the
// known config rather than trusted as opaque strings — otherwise an admin
// session (or a stolen one) can write arbitrary rows into page_sections.
function isValidUpdate(pageConfig: ReturnType<typeof getPageConfig>, update: ContentUpdate): boolean {
  if (update.value.length > MAX_VALUE_LENGTH) return false
  const section = pageConfig?.sections.find((s) => s.key === update.section_key)
  return section?.fields.some((f) => f.key === update.content_key) ?? false
}

export async function savePageContent(
  page_slug: string,
  updates: ContentUpdate[]
): Promise<{ success: true } | { error: string }> {
  const role = await getRole()
  if (role !== 'admin') {
    return { error: 'Neturite teisės atlikti šį veiksmą' }
  }

  const pageConfig = getPageConfig(page_slug)
  if (!pageConfig || !updates.every((u) => isValidUpdate(pageConfig, u))) {
    return { error: 'Neteisingi puslapio turinio duomenys' }
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
