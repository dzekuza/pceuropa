// app/(dashboard)/seller/page.tsx — Seller home page: full-year submission grid
// Server Component — Defense-in-depth auth check (middleware alone is not sufficient)
// CVE-2025-29927: middleware can be bypassed via x-middleware-subrequest header

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { eq, and, gte, lte } from 'drizzle-orm'
import { PlusIcon } from 'lucide-react'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { tenants, revenueReports } from '@/drizzle/schema'
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
import type { RevenueReport } from '@/types/database'

// Drizzle rows are camelCase with string numerics; components expect the
// snake_case shape the old Supabase Row type produced.
function toRevenueReport(row: typeof revenueReports.$inferSelect): RevenueReport {
  return {
    id: row.id,
    tenant_id: row.tenantId,
    user_id: row.userId,
    month: row.month,
    amount_eur: Number(row.amountEur),
    tx_count: row.txCount,
    submitted_at: row.submittedAt ? row.submittedAt.toISOString() : null,
    submitted_by: row.submittedBy,
    weeks: row.weeks as RevenueReport['weeks'],
  }
}

// Submission grid is filtered by the ?year= search param; force-dynamic keeps the
// segment out of the client Router Cache so switching years refetches without a reload.
export const dynamic = 'force-dynamic'

interface SellerHomePageProps {
  searchParams: Promise<{ year?: string }>
}

export default async function SellerHomePage({ searchParams }: SellerHomePageProps) {
  // Defense-in-depth: validate JWT and verify seller role even though middleware already checked
  const session = await auth()
  const user = session?.user

  // NOTE: user.id is typed optional per next-auth's DefaultUser — see final
  // report re: lib/auth/auth.config.ts's session() callback not currently
  // setting session.user.id = token.sub, which this check surfaces at runtime
  // as a redirect instead of silently querying with `undefined`.
  if (!user || !user.id || user.role !== 'seller') {
    redirect('/login')
  }

  // Fetch the seller's tenant record
  const [tenant] = await db
    .select({ id: tenants.id, store_name: tenants.storeName })
    .from(tenants)
    .where(eq(tenants.userId, user.id))
    .limit(1)

  if (!tenant) {
    redirect('/seller/revenue')
  }

  const { year: yearParam } = await searchParams
  const currentYear = new Date().getFullYear()
  const parsedYear = yearParam ? parseInt(yearParam, 10) : currentYear
  const year = isNaN(parsedYear) ? currentYear : parsedYear

  // Fetch the selected year + the prior year (for same-month YoY deltas) in parallel
  const [yearRows, prevYearRows] = await Promise.all([
    db
      .select()
      .from(revenueReports)
      .where(
        and(
          eq(revenueReports.tenantId, tenant.id),
          gte(revenueReports.month, `${year}-01-01`),
          lte(revenueReports.month, `${year}-12-31`)
        )
      ),
    db
      .select()
      .from(revenueReports)
      .where(
        and(
          eq(revenueReports.tenantId, tenant.id),
          gte(revenueReports.month, `${year - 1}-01-01`),
          lte(revenueReports.month, `${year - 1}-12-31`)
        )
      ),
  ])

  const reports = yearRows.map(toRevenueReport)
  const prevReports = prevYearRows.map(toRevenueReport)

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
