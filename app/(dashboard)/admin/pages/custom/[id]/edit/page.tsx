// app/(dashboard)/admin/pages/custom/[id]/edit/page.tsx — Edit custom page editor
// Server Component — Defense-in-depth auth check (middleware alone is not sufficient)
export const dynamic = 'force-dynamic'

import { notFound, redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { CustomPageForm } from '@/components/pages/custom-page-form'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditCustomPagePage({ params }: Props) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user || user.app_metadata?.role !== 'admin') redirect('/login')

  // Service role: drafts are hidden from the anon/authenticated RLS policy
  const { data: page } = await createAdminClient()
    .from('custom_pages')
    .select('*')
    .eq('id', id)
    .single()

  if (!page) notFound()

  return <CustomPageForm page={page} />
}
