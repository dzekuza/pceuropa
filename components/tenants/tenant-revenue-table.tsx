'use client'
// components/tenants/tenant-revenue-table.tsx — Updated to use DataGrid aesthetic
import { useMemo, useState } from 'react'
import {
  formatEur as fmtEur,
  formatPct as fmtPct,
} from '@/lib/utils/format'
import { buildTenantRevenueRows } from '@/components/tenants/tenant-revenue-rows'
import type { Tenant, RevenueReport } from '@/types/database'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  ColumnDef,
  ColumnOrderState,
  flexRender,
} from '@tanstack/react-table'
import { DataGrid, useDataGrid } from '@/components/reui/data-grid/data-grid'
import {
  DataGridTableBase,
  DataGridTableHead,
  DataGridTableBody,
  DataGridTableHeadRow,
  DataGridTableHeadRowCell,
  DataGridTableBodyRow,
  DataGridTableBodyRowCell
} from '@/components/reui/data-grid/data-grid-table'
import { DataGridColumnHeader } from '@/components/reui/data-grid/data-grid-column-header'
import { TableFooter, TableRow, TableCell } from '@/components/ui/table'
import { cn } from '@/lib/utils'

interface TenantRevenueTableProps {
  tenant: Tenant
  reports: RevenueReport[]
  year: number
}

function efektyvumasClass(value: number | null): string {
  if (value == null) return 'text-muted-foreground'
  if (value >= 100) return 'rounded px-1.5 py-0.5 bg-success/10 text-success font-medium'
  if (value >= 70) return 'rounded px-1.5 py-0.5 bg-warning/10 text-warning font-medium'
  return 'rounded px-1.5 py-0.5 bg-destructive/10 text-destructive font-medium'
}

export function TenantRevenueTable({ tenant, reports, year }: TenantRevenueTableProps) {
  const { rows, pk } = useMemo(
    () => buildTenantRevenueRows(tenant, reports, year),
    [tenant, reports, year],
  )

  const stats = useMemo(() => {
    const dataRows = rows.filter((r) => r.hasData)
    const hasAnyData = dataRows.length > 0

    return {
      avgAmount: hasAnyData ? dataRows.reduce((sum, r) => sum + r.amount, 0) / dataRows.length : null,
      avgTxCount: hasAnyData ? dataRows.reduce((sum, r) => sum + r.txCount, 0) / dataRows.length : null,
      avgApyvartaPerM2: hasAnyData ? dataRows.reduce((sum, r) => sum + (r.apyvartaPerM2 ?? 0), 0) / dataRows.filter((r) => r.apyvartaPerM2 != null).length : null,
      avgEfektyvumas: hasAnyData ? dataRows.reduce((sum, r) => sum + (r.efektyvumas ?? 0), 0) / dataRows.filter((r) => r.efektyvumas != null).length : null,
    }
  }, [rows])

  const columns = useMemo<ColumnDef<typeof rows[0]>[]>(() => [
    {
      id: 'monthName',
      accessorKey: 'monthName',
      header: ({ column }) => <DataGridColumnHeader title="Mėnuo" column={column} />,
      cell: ({ row }) => <span className="font-medium">{row.original.monthName}</span>,
      footer: () => 'Vidurkis',
      size: 130,
    },
    {
      id: 'amount',
      accessorKey: 'amount',
      header: ({ column }) => <DataGridColumnHeader title="Apyvarta (EUR)" column={column} />,
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.hasData ? fmtEur(row.original.amount) : '—'}
        </div>
      ),
      footer: () => (
        <div className="text-right">{stats.avgAmount != null ? fmtEur(stats.avgAmount) : '—'}</div>
      ),
      size: 130,
    },
    {
      id: 'txCount',
      accessorKey: 'txCount',
      header: ({ column }) => <DataGridColumnHeader title="Čekių sk." column={column} />,
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.hasData ? row.original.txCount : '—'}
        </div>
      ),
      footer: () => (
        <div className="text-right">{stats.avgTxCount != null ? stats.avgTxCount.toFixed(0) : '—'}</div>
      ),
      size: 110,
    },
    {
      id: 'space',
      header: ({ column }) => <DataGridColumnHeader title="Plotas (m²)" column={column} />,
      cell: () => <div className="text-right">{tenant.space_m2 ?? '—'}</div>,
      footer: () => <div className="text-right">{tenant.space_m2 ?? '—'}</div>,
      size: 110,
    },
    {
      id: 'pk',
      header: ({ column }) => <DataGridColumnHeader title="P.K (EUR/m²)" column={column} />,
      cell: () => <div className="text-right text-muted-foreground">{pk != null ? fmtEur(pk) : '—'}</div>,
      footer: () => <div className="text-right">{pk != null ? fmtEur(pk) : '—'}</div>,
      size: 130,
      meta: { cellClassName: 'bg-muted/30' }
    },
    {
      id: 'apyvartaPerM2',
      accessorKey: 'apyvartaPerM2',
      header: ({ column }) => <DataGridColumnHeader title="Apyvarta (EUR/m²)" column={column} />,
      cell: ({ row }) => (
        <div className="text-right text-muted-foreground">
          {row.original.apyvartaPerM2 != null ? fmtEur(row.original.apyvartaPerM2) : '—'}
        </div>
      ),
      footer: () => (
        <div className="text-right">{stats.avgApyvartaPerM2 != null ? fmtEur(stats.avgApyvartaPerM2) : '—'}</div>
      ),
      size: 150,
      meta: { cellClassName: 'bg-muted/30' }
    },
    {
      id: 'efektyvumas',
      accessorKey: 'efektyvumas',
      header: ({ column }) => <DataGridColumnHeader title="Efektyvumas (%)" column={column} />,
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.efektyvumas != null ? (
            <span className={efektyvumasClass(row.original.efektyvumas)}>
              {fmtPct(row.original.efektyvumas)}
            </span>
          ) : '—'}
        </div>
      ),
      footer: () => (
        <div className="text-right">
          {stats.avgEfektyvumas != null ? (
            <span className={efektyvumasClass(stats.avgEfektyvumas)}>
              {fmtPct(stats.avgEfektyvumas)}
            </span>
          ) : '—'}
        </div>
      ),
      size: 140,
      meta: { cellClassName: 'bg-muted/30' }
    }
  ], [tenant, pk, stats])

  const defaultColumnOrder = useMemo(
    () => ['monthName', 'amount', 'txCount', 'space', 'pk', 'apyvartaPerM2', 'efektyvumas'],
    [],
  )
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(defaultColumnOrder)

  const table = useReactTable({
    data: rows,
    columns,
    state: { columnOrder },
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <DataGrid
      table={table}
      recordCount={rows.length}
      tableLayout={{
        width: 'fixed',
        rowBorder: true,
        columnsMovable: true,
      }}
    >
      <RevenueTableContent />
    </DataGrid>
  )
}

function RevenueTableContent() {
  "use no memo"
  const { table } = useDataGrid()

  return (
    <div className="overflow-x-auto rounded-b-xl">
      <DataGridTableBase>
        <DataGridTableHead>
          {table.getHeaderGroups().map((headerGroup) => (
            <DataGridTableHeadRow headerGroup={headerGroup} key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <DataGridTableHeadRowCell header={header} key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </DataGridTableHeadRowCell>
              ))}
            </DataGridTableHeadRow>
          ))}
        </DataGridTableHead>

        <DataGridTableBody>
          {table.getRowModel().rows.map((row) => (
            <DataGridTableBodyRow row={row} key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <DataGridTableBodyRowCell cell={cell} key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </DataGridTableBodyRowCell>
              ))}
            </DataGridTableBodyRow>
          ))}
        </DataGridTableBody>

        <TableFooter>
          {table.getFooterGroups().map((footerGroup) => (
            <TableRow key={footerGroup.id} className="font-bold hover:bg-muted/50 transition-colors">
              {footerGroup.headers.map((header) => (
                <TableCell
                  key={header.id}
                  className={cn('px-3 py-3', header.column.columnDef.meta?.cellClassName)}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.footer, header.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableFooter>
      </DataGridTableBase>
    </div>
  )
}
