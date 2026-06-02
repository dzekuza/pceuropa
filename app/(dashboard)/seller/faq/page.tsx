// app/(dashboard)/seller/faq/page.tsx — Seller FAQ read-only page
// Server Component — Defense-in-depth auth check (middleware alone is not sufficient)
// CVE-2025-29927: middleware can be bypassed via x-middleware-subrequest header
export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FaqReader } from '@/components/faq/faq-reader'

export default async function SellerFaqPage() {
  const supabase = await createClient()

  // Defense-in-depth: validate JWT and verify seller role
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.app_metadata?.role !== 'seller') {
    redirect('/login')
  }

  const { data: items } = await supabase
    .from('faq_items')
    .select('*')
    .order('sort_order', { ascending: true })

  return (
    <div className="flex flex-col gap-6">
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
