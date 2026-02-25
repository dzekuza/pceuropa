// app/(dashboard)/seller/page.tsx — Seller home page
// Server Component — Defense-in-depth auth check (middleware alone is not sufficient)
// CVE-2025-29927: middleware can be bypassed via x-middleware-subrequest header
// Phase 3 gap closure: redirect to /seller/revenue (the real seller entry point)

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function SellerHomePage() {
  const supabase = await createClient()
  // Defense-in-depth: validate JWT and verify seller role even though middleware already checked
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.app_metadata?.role !== 'seller') {
    redirect('/login')
  }

  // Revenue submission is fully implemented at /seller/revenue — redirect immediately.
  // Keeping the auth guard above ensures /seller cannot be accessed without a valid seller session.
  redirect('/seller/revenue')
}
