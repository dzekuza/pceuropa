// app/(dashboard)/admin/articles/akcijos/new/page.tsx — New promo editor
// Server Component — Defense-in-depth auth check (middleware alone is not sufficient)
// CVE-2025-29927: middleware can be bypassed via x-middleware-subrequest header
export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/config'
import { PromoForm } from '@/components/promos/promo-form'

export default async function NewPromoPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') redirect('/login')

  return <PromoForm />
}
