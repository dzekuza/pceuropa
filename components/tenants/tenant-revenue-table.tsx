'use client'
// components/tenants/tenant-revenue-table.tsx — Updated to use DataGrid aesthetic
import { useMemo } from 'react'
import { MONTHS_LT } from '@/lib/constants'
import {
  calculatePK,
  calculateApyvartaPerM2,
  calculateEfektyvumas,
} from '@/lib/utils/calculations'
import type { Tenant, RevenueReport } from '@/types/database'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  ColumnDef,
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

interface TenantRevenueTableProps {
  tenant: Tenant
  reports: RevenueReport[]
  year: number
}

function efektyvumasClass(value: number | null): string {
  if (value == null) return 'text-muted-foreground'
  if (value >= 100) return 'rounded px-1.5 py-0.5 bg-green-100 text-green-800 font-medium'
  if (value >= 70) return 'rounded px-1.5 py-0.5 bg-yellow-100 text-yellow-800 font-medium'
  return 'rounded px-1.5 py-0.5 bg-red-100 text-red-800 font-medium'
}

function fmtEur(value: number): string {
  return value.toFixed(2)
}

function fmtPct(value: number): string {
  return value.toFixed(1) + '%'
}

export function TenantRevenueTable({ tenant, reports, year }: TenantRevenueTableProps) {
  const reportMap = useMemo(() => {
    const map = new Map<string, RevenueReport>()
    for (const report of reports) {
      map.set(report.month.slice(0, 7), report)
    }
    return map
  }, [reports])

  const pk = useMemo(() => calculatePK(tenant.rent_eur, tenant.space_m2), [tenant])

  const rows = useMemo(() => MONTHS_LT.map((monthName, idx) => {
    const monthNum = idx + 1
    const monthKey = `${year}-${String(monthNum).padStart(2, '0')}`
    const report = reportMap.get(monthKey) ?? null

    const hasData = report !== null
    const amount = hasData ? report!.amount_eur : 0
    const txCount = hasData ? (report!.tx_count ?? 0) : 0
    const apyvartaPerM2 = hasData ? calculateApyvartaPerM2(amount, tenant.space_m2) : null
    const efektyvumas = hasData ? calculateEfektyvumas(amount, tenant.rent_eur) : null

    return {
      monthName,
      hasData,
      amount,
      txCount,
      apyvartaPerM2,
      efektyvumas,
    }
  }), [year, reportMap, tenant])

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
      accessorKey: 'monthName',
      header: ({ column }) => <DataGridColumnHeader title="Mėnuo" column={column} />,
      cell: ({ row }) => <span className="font-medium">{row.original.monthName}</span>,
      size: 130,
    },
    {
      id: 'space',
      header: ({ column }) => <DataGridColumnHeader title="Plotas (m²)" column={column} />,
      cell: () => <div className="text-right">{tenant.space_m2 ?? '—'}</div>,
      size: 110,
    },
    {
      accessorKey: 'txCount',
      header: ({ column }) => <DataGridColumnHeader title="Pirkimų sk." column={column} />,
      cell: ({ row }) => <div className="text-right">{row.original.txCount}</div>,
      size: 110,
    },
    {
      accessorKey: 'amount',
      header: ({ column }) => <DataGridColumnHeader title="Apyvarta (EUR)" column={column} />,
      cell: ({ row }) => <div className="text-right">{fmtEur(row.original.amount)}</div>,
      size: 130,
    },
    {
      id: 'pk',
      header: ({ column }) => <DataGridColumnHeader title="P.K (EUR/m²)" column={column} />,
      cell: () => <div className="text-right text-muted-foreground">{pk != null ? fmtEur(pk) : '—'}</div>,
      size: 130,
      meta: { cellClassName: 'bg-muted/30' }
    },
    {
      accessorKey: 'apyvartaPerM2',
      header: ({ column }) => <DataGridColumnHeader title="Apyvarta (EUR/m²)" column={column} />,
      cell: ({ row }) => (
        <div className="text-right text-muted-foreground">
          {row.original.apyvartaPerM2 != null ? fmtEur(row.original.apyvartaPerM2) : '—'}
        </div>
      ),
      size: 150,
      meta: { cellClassName: 'bg-muted/30' }
    },
    {
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
      size: 140,
      meta: { cellClassName: 'bg-muted/30' }
    }
  ], [tenant, pk])

  const table = useReactTable({
    data: rows,
    columns,
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
        columnsPinnable: true,
        columnsMovable: true,
        columnsVisibility: true,
      }}
    >
      <RevenueTableContent stats={stats} pk={pk} tenantSpace={tenant.space_m2} />
    </DataGrid>
  )
}

function RevenueTableContent({ stats, pk, tenantSpace }: { stats: { avgAmount: number | null, avgTxCount: number | null, avgApyvartaPerM2: number | null, avgEfektyvumas: number | null }, pk: number | null, tenantSpace: number | null }) {
  const { table } = useDataGrid()

  return (
    <div className="rounded-md border overflow-x-auto">
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
          <TableRow className="font-bold hover:bg-muted/50 transition-colors">
            <TableCell className="px-3 py-3">Vidurkis</TableCell>
            <TableCell className="text-right px-3 py-3">{tenantSpace ?? '—'}</TableCell>
            <TableCell className="text-right px-3 py-3">{stats.avgTxCount != null ? stats.avgTxCount.toFixed(0) : '—'}</TableCell>
            <TableCell className="text-right px-3 py-3">{stats.avgAmount != null ? fmtEur(stats.avgAmount) : '—'}</TableCell>
            <TableCell className="text-right bg-muted/40 px-3 py-3">{pk != null ? fmtEur(pk) : '—'}</TableCell>
            <TableCell className="text-right bg-muted/40 px-3 py-3">{stats.avgApyvartaPerM2 != null ? fmtEur(stats.avgApyvartaPerM2) : '—'}</TableCell>
            <TableCell className="text-right bg-muted/40 px-3 py-3">
              {stats.avgEfektyvumas != null ? (
                <span className={efektyvumasClass(stats.avgEfektyvumas)}>
                  {fmtPct(stats.avgEfektyvumas)}
                </span>
              ) : '—'}
            </TableCell>
          </TableRow>
        </TableFooter>
      </DataGridTableBase>
    </div>
  )
}
