'use client'
// components/seller/seller-year-export-button.tsx — Excel export for the seller
// year grid; lives in the card header inline with the year selector.
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { exportRowsToXlsx } from '@/lib/utils/format'
import { buildSellerYearRows, sellerYearExportRows } from './seller-year-rows'
import type { RevenueReport } from '@/types/database'

interface SellerYearExportButtonProps {
  reports: RevenueReport[]
  prevReports: RevenueReport[]
  year: number
}

export function SellerYearExportButton({
  reports,
  prevReports,
  year,
}: SellerYearExportButtonProps) {
  function handleExport() {
    const rows = buildSellerYearRows(reports, prevReports, year)
    exportRowsToXlsx(
      sellerYearExportRows(rows, year),
      `apyvarta-${year}.xlsx`,
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
