// app/(dashboard)/seller/page.tsx — Seller home page: full-year submission grid
// Server Component — Defense-in-depth auth check (middleware alone is not sufficient)
// CVE-2025-29927: middleware can be bypassed via x-middleware-subrequest header

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PlusIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { YearSelector } from '@/components/tenants/year-selector'
import { SellerYearGrid } from '@/components/seller/seller-year-grid'
import { SellerYearExportButton } from '@/components/seller/seller-year-export-button'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardToolbar,
} from '@/components/ui/card'

// Submission grid is filtered by the ?year= search param; force-dynamic keeps the
// segment out of the client Router Cache so switching years refetches without a reload.
export const dynamic = 'force-dynamic'

interface SellerHomePageProps {
  searchParams: Promise<{ year?: string }>
}

export default async function SellerHomePage({ searchParams }: SellerHomePageProps) {
  const supabase = await createClient()
  // Defense-in-depth: validate JWT and verify seller role even though middleware already checked
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.app_metadata?.role !== 'seller') {
    redirect('/login')
  }

  // Fetch the seller's tenant record
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, store_name')
    .eq('user_id', user.id)
    .single()

  if (!tenant) {
    redirect('/seller/revenue')
  }

  const { year: yearParam } = await searchParams
  const currentYear = new Date().getFullYear()
  const parsedYear = yearParam ? parseInt(yearParam, 10) : currentYear
  const year = isNaN(parsedYear) ? currentYear : parsedYear

  // Fetch the selected year + the prior year (for same-month YoY deltas) in parallel
  const [{ data: reports }, { data: prevReports }] = await Promise.all([
    supabase
      .from('revenue_reports')
      .select('*')
      .eq('tenant_id', tenant.id)
      .gte('month', `${year}-01-01`)
      .lte('month', `${year}-12-31`),
    supabase
      .from('revenue_reports')
      .select('*')
      .eq('tenant_id', tenant.id)
      .gte('month', `${year - 1}-01-01`)
      .lte('month', `${year - 1}-12-31`),
  ])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Pagrindinis</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {tenant.store_name} — metinė apyvartos suvestinė
          </p>
        </div>
        <Button asChild>
          <Link href="/seller/revenue">
            <PlusIcon className="size-4" />
            Pateikti duomenis
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between px-4 py-3">
          <div>
            <CardTitle className="text-lg">Apyvarta pagal mėnesius</CardTitle>
            <CardDescription className="text-xs">
              Apyvarta, čekių skaičius ir pokytis lyginant su {year - 1} m. ({year})
            </CardDescription>
          </div>
          <CardToolbar className="flex-wrap">
            <YearSelector currentYear={year} />
            <SellerYearExportButton
              reports={reports ?? []}
              prevReports={prevReports ?? []}
              year={year}
            />
          </CardToolbar>
        </CardHeader>
        <div className="border-t p-4">
          <SellerYearGrid
            key={year}
            reports={reports ?? []}
            prevReports={prevReports ?? []}
            year={year}
          />
        </div>
      </Card>
    </div>
  )
}
