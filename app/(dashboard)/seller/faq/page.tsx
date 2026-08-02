// app/(dashboard)/seller/faq/page.tsx — Seller FAQ read-only page
// Server Component — Defense-in-depth auth check (middleware alone is not sufficient)
// CVE-2025-29927: middleware can be bypassed via x-middleware-subrequest header
export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { asc } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { faqItems } from '@/drizzle/schema'
import { FaqReader } from '@/components/faq/faq-reader'

export default async function SellerFaqPage() {
  // Defense-in-depth: validate JWT and verify seller role
  const session = await auth()
  const user = session?.user

  if (!user || user.role !== 'seller') {
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

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h1 className="text-2xl font-bold">DUK</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Dažnai užduodami klausimai
        </p>
      </div>

      <FaqReader items={items ?? []} />
    </div>
  )
}
