// app/(dashboard)/admin/page.tsx — Admin home page with summary cards
// Server Component — Defense-in-depth auth check (middleware alone is not sufficient)
// CVE-2025-29927: middleware can be bypassed via x-middleware-subrequest header

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default async function AdminHomePage() {
  const supabase = await createClient()
  // Defense-in-depth: validate JWT and verify admin role even though middleware already checked
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.app_metadata?.role !== 'admin') {
    redirect('/login')
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Suvestinė</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Bendra sistemos apžvalga
        </p>
      </div>

      {/* Summary cards — placeholder values in Phase 1 */}
      {/* TODO Phase 2: wire real tenant count from database */}
      {/* TODO Phase 3: wire real revenue totals from revenue_reports */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Viso nuomininkų
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">—</p>
            <p className="text-xs text-muted-foreground mt-1">
              {/* TODO Phase 2: wire real data */}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pateikta šį mėnesį
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">—</p>
            <p className="text-xs text-muted-foreground mt-1">
              {/* TODO Phase 3: wire real data */}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Bendra apyvarta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">—</p>
            <p className="text-xs text-muted-foreground mt-1">
              {/* TODO Phase 3: wire real data */}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
