// app/(dashboard)/admin/pages/custom/new/page.tsx — New custom page editor
// Server Component — Defense-in-depth auth check (middleware alone is not sufficient)
export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/supabase/server'
import { CustomPageForm } from '@/components/pages/custom-page-form'

export default async function NewCustomPagePage() {
  const user = await getCurrentUser()
  if (!user || user.app_metadata?.role !== 'admin') redirect('/login')

  return <CustomPageForm />
}
