// app/(dashboard)/admin/faq/page.tsx — Admin FAQ management page
// Server Component — Defense-in-depth auth check (middleware alone is not sufficient)
// CVE-2025-29927: middleware can be bypassed via x-middleware-subrequest header
export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FaqAdminPageClient } from '@/components/faq/faq-admin-page-client'

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

  return <FaqAdminPageClient items={items ?? []} />
}
