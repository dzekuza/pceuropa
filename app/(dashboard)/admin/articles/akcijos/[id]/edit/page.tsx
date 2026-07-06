// app/(dashboard)/admin/articles/akcijos/[id]/edit/page.tsx — Edit promo editor
// Server Component — Defense-in-depth auth check (middleware alone is not sufficient)
// CVE-2025-29927: middleware can be bypassed via x-middleware-subrequest header
export const dynamic = 'force-dynamic'

import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PromoForm } from '@/components/promos/promo-form'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPromoPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== 'admin') redirect('/login')

  const { data: promo } = await supabase
    .from('promos')
    .select('*')
    .eq('id', id)
    .single()

  if (!promo) notFound()

  return <PromoForm promo={promo} />
}
