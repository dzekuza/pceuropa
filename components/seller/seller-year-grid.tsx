'use client'
// components/seller/seller-year-grid.tsx — Seller full-year submission grid
// Shows every month (Sausis–Gruodis) for the selected year with turnover,
// receipt counts, and a same-month-last-year (YoY) delta.
import { useMemo, useState } from 'react'
import { calculateYoYPercent } from '@/lib/utils/calculations'
import { formatEur, formatInt, formatPct } from '@/lib/utils/format'
import { buildSellerYearRows } from './seller-year-rows'
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
  DataGridTableBodyRowCell,
} from '@/components/reui/data-grid/data-grid-table'
import { DataGridColumnHeader } from '@/components/reui/data-grid/data-grid-column-header'
import { TableFooter, TableRow, TableCell } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { RevenueReport } from '@/types/database'

interface SellerYearGridProps {
  reports: RevenueReport[]
  prevReports: RevenueReport[]
  year: number
}

function yoyDisplay(value: number | null): { text: string; cls: string } {
  if (value == null) return { text: '—', cls: 'text-muted-foreground' }
  const sign = value > 0 ? '+' : value < 0 ? '−' : ''
  const cls =
    value > 0 ? 'text-success' : value < 0 ? 'text-destructive' : 'text-muted-foreground'
  return { text: `${sign}${formatPct(Math.abs(value))}`, cls }
}

export function SellerYearGrid({ reports, prevReports, year }: SellerYearGridProps) {
  const rows = useMemo(
    () => buildSellerYearRows(reports, prevReports, year),
    [reports, prevReports, year],
  )

  const totals = useMemo(() => {
    const data = rows.filter((r) => r.hasData)
    const amount = data.reduce((s, r) => s + (r.amount ?? 0), 0)
    const tx = data.reduce((s, r) => s + (r.tx ?? 0), 0)
    const prevAmount = prevReports.reduce((s, r) => s + r.amount_eur, 0)
    return { amount, tx, yoy: calculateYoYPercent(amount, prevAmount || null) }
  }, [rows, prevReports])

  const columns = useMemo<ColumnDef<typeof rows[0]>[]>(() => [
    {
      id: 'monthName',
      accessorKey: 'monthName',
      header: ({ column }) => <DataGridColumnHeader title="Mėnuo" column={column} />,
      cell: ({ row }) => (
        <span className={cn('font-medium', !row.original.hasData && 'text-muted-foreground')}>
          {row.original.monthName}
        </span>
      ),
      footer: () => 'Iš viso',
      size: 130,
    },
    {
      id: 'amount',
      accessorKey: 'amount',
      header: ({ column }) => <DataGridColumnHeader title="Apyvarta (EUR)" column={column} />,
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.hasData ? formatEur(row.original.amount ?? 0) : '—'}
        </div>
      ),
      footer: () => <div className="text-right">{formatEur(totals.amount)}</div>,
      size: 150,
    },
    {
      id: 'tx',
      accessorKey: 'tx',
      header: ({ column }) => <DataGridColumnHeader title="Čekių sk." column={column} />,
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.hasData ? formatInt(row.original.tx ?? 0) : '—'}
        </div>
      ),
      footer: () => <div className="text-right">{formatInt(totals.tx)}</div>,
      size: 120,
    },
    {
      id: 'yoy',
      accessorKey: 'yoy',
      header: ({ column }) => <DataGridColumnHeader title={`vs ${year - 1}`} column={column} />,
      cell: ({ row }) => {
        const yoy = yoyDisplay(row.original.yoy)
        return <div className={cn('text-right', yoy.cls)}>{yoy.text}</div>
      },
      footer: () => {
        const totalYoy = yoyDisplay(totals.yoy)
        return <div className={cn('text-right', totalYoy.cls)}>{totalYoy.text}</div>
      },
      size: 120,
    },
  ], [totals, year])

  const defaultColumnOrder = useMemo(() => ['monthName', 'amount', 'tx', 'yoy'], [])
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
      <SellerYearGridContent />
    </DataGrid>
  )
}

function SellerYearGridContent() {
  "use no memo"
  const { table } = useDataGrid()

  return (
    <div className="rounded-lg border overflow-x-auto">
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
            <TableRow key={footerGroup.id} className="font-bold">
              {footerGroup.headers.map((header) => (
                <TableCell key={header.id}>
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
