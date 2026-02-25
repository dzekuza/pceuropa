// app/(dashboard)/seller/page.tsx — Seller home page
// Server Component — Defense-in-depth auth check (middleware alone is not sufficient)
// CVE-2025-29927: middleware can be bypassed via x-middleware-subrequest header

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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Apyvarta</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Mėnesinės apyvartos pateikimas
        </p>
      </div>

      {/* TODO Phase 3: replace with revenue submission form */}
      <div className="flex items-center justify-center rounded-lg border border-dashed p-12">
        <div className="text-center">
          <p className="text-muted-foreground text-lg">
            Apyvartos pateikimas bus prieinamas netrukus
          </p>
          <p className="text-muted-foreground/60 text-sm mt-2">
            Ši funkcija bus prieinama Phase 3 metu.
          </p>
        </div>
      </div>
    </div>
  )
}
