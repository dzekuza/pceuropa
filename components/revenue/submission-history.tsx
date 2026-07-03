'use client'
// components/revenue/submission-history.tsx — Updated to use DataGrid aesthetic
import { useMemo } from 'react'
import { Download } from 'lucide-react'
import type { RevenueReport } from '@/types/database'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  ColumnDef,
} from '@tanstack/react-table'
import { DataGrid } from '@/components/reui/data-grid/data-grid'
import { DataGridTable } from '@/components/reui/data-grid/data-grid-table'
import { DataGridColumnHeader } from '@/components/reui/data-grid/data-grid-column-header'
import { Button } from '@/components/ui/button'
import {
  formatEur,
  formatInt,
  formatMonthLabel,
  exportRowsToXlsx,
} from '@/lib/utils/format'

interface SubmissionHistoryProps {
  reports: RevenueReport[]
  onSelectMonth: (month: string) => void
}

export function SubmissionHistory({ reports, onSelectMonth }: SubmissionHistoryProps) {
  const sorted = useMemo(() =>
    [...reports].sort((a, b) => b.month.localeCompare(a.month)),
    [reports])

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return '—'
    return dateStr.slice(0, 10)
  }

  function handleExport() {
    const headers = ['Mėnuo', 'Apyvarta (EUR)', 'Čekių sk.', 'Užpildė', 'Pateikta']
    const rows = sorted.map((r) => [
      formatMonthLabel(r.month),
      r.amount_eur,
      r.tx_count ?? '',
      r.submitted_by ?? '',
      formatDate(r.submitted_at),
    ])
    exportRowsToXlsx(
      [headers, ...rows],
      `apyvarta-${new Date().toISOString().slice(0, 10)}.xlsx`,
      'Apyvarta',
    )
  }

  const columns = useMemo<ColumnDef<RevenueReport>[]>(() => [
    {
      accessorKey: 'month',
      header: ({ column }) => <DataGridColumnHeader title="Mėnuo" column={column} />,
      cell: ({ row }) => <span className="font-medium">{formatMonthLabel(row.original.month)}</span>,
      size: 150,
    },
    {
      accessorKey: 'amount_eur',
      header: ({ column }) => <DataGridColumnHeader title="Apyvarta (EUR)" column={column} />,
      cell: ({ row }) => <div className="text-right">{formatEur(row.original.amount_eur)}</div>,
      size: 140,
    },
    {
      accessorKey: 'tx_count',
      header: ({ column }) => <DataGridColumnHeader title="Čekių sk." column={column} />,
      cell: ({ row }) => <div className="text-right">{formatInt(row.original.tx_count)}</div>,
      size: 120,
    },
    {
      accessorKey: 'submitted_by',
      header: ({ column }) => <DataGridColumnHeader title="Užpildė" column={column} />,
      cell: ({ row }) => row.original.submitted_by ?? '—',
      size: 150,
    },
    {
      accessorKey: 'submitted_at',
      header: ({ column }) => <DataGridColumnHeader title="Pateikta" column={column} />,
      cell: ({ row }) => formatDate(row.original.submitted_at),
      size: 130,
    },
  ], [])

  const table = useReactTable({
    data: sorted,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (reports.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed p-8">
        <p className="text-muted-foreground text-sm">Dar nepateikta jokių duomenų</p>
      </div>
    )
  }

  return (
    <DataGrid
      table={table}
      recordCount={reports.length}
      onRowClick={(row) => onSelectMonth(row.month.slice(0, 7))}
      tableLayout={{
        rowBorder: true,
      }}
    >
      <div className="flex flex-col gap-3">
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="size-4" />
            Eksportuoti (Excel)
          </Button>
        </div>
        <div className="rounded-lg border overflow-x-auto">
          <DataGridTable />
        </div>
      </div>
    </DataGrid>
  )
}
