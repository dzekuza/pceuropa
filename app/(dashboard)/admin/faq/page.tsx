// app/(dashboard)/admin/faq/page.tsx — Admin FAQ management page
// Server Component — Defense-in-depth auth check (middleware alone is not sufficient)
// CVE-2025-29927: middleware can be bypassed via x-middleware-subrequest header
export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { asc } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { faqItems } from '@/drizzle/schema'
import { FaqAdminPageClient } from '@/components/faq/faq-admin-page-client'

export default async function AdminFaqPage() {
  // Defense-in-depth: validate JWT and verify admin role
  const session = await auth()
  const user = session?.user

  if (!user || user.role !== 'admin') {
    redirect('/login')
  }

  const rows = await db.select().from(faqItems).orderBy(asc(faqItems.sortOrder))
  const items = rows.map((row) => ({
    id: row.id,
    question: row.question,
    answer: row.answer,
    sort_order: row.sortOrder,
    created_at: row.createdAt ? row.createdAt.toISOString() : null,
    attachments: row.attachments,
  }))

  return <FaqAdminPageClient items={items} />
}
