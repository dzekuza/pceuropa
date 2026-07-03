'use client'
// components/tenants/tenant-revenue-export-button.tsx — Excel export for the
// tenant yearly revenue table; lives in the card header inline with the year selector.
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { exportRowsToXlsx } from '@/lib/utils/format'
import {
  buildTenantRevenueRows,
  tenantRevenueExportRows,
} from '@/components/tenants/tenant-revenue-rows'
import type { Tenant, RevenueReport } from '@/types/database'

interface TenantRevenueExportButtonProps {
  tenant: Tenant
  reports: RevenueReport[]
  year: number
}

export function TenantRevenueExportButton({
  tenant,
  reports,
  year,
}: TenantRevenueExportButtonProps) {
  function handleExport() {
    const { rows, pk } = buildTenantRevenueRows(tenant, reports, year)
    exportRowsToXlsx(
      tenantRevenueExportRows(rows, tenant, pk),
      `${tenant.store_name}-apyvarta-${year}.xlsx`,
      `Apyvarta ${year}`,
    )
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <Download className="size-4" />
      Eksportuoti (Excel)
    </Button>
  )
}
