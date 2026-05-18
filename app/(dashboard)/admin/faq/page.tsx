// app/(dashboard)/admin/faq/page.tsx — Admin FAQ management page
// Server Component — Defense-in-depth auth check (middleware alone is not sufficient)
// CVE-2025-29927: middleware can be bypassed via x-middleware-subrequest header
export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FaqAdminList } from '@/components/faq/faq-admin-list'

export default async function AdminFaqPage() {
  const supabase = await createClient()

  // Defense-in-depth: validate JWT and verify admin role
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.app_metadata?.role !== 'admin') {
    redirect('/login')
  }

  const { data: items } = await supabase
    .from('faq_items')
    .select('*')
    .order('sort_order', { ascending: true })

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">DUK valdymas</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Kurkite ir tvarkykite dažnai užduodamus klausimus
        </p>
      </div>

      <FaqAdminList items={items ?? []} />
    </div>
  )
}
