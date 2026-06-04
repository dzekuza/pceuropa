'use client'
import { useState, useMemo } from 'react'
import { Card, CardToolbar, CardDescription, CardHeader, CardHeading, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/reui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Tenant } from '@/types/database'
import { MONTHS_LT } from '@/lib/constants'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type Column,
  type RowSelectionState,
} from '@tanstack/react-table'
import { ArrowUpDown, ArrowUp, ArrowDown, X, Download } from 'lucide-react'

function SortHeader<T>({ column, title }: { column: Column<T>; title: string }) {
  const sorted = column.getIsSorted()
  return (
    <button
      onClick={() => column.toggleSorting(sorted === 'asc')}
      className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
    >
      {title}
      {sorted === 'asc' ? <ArrowUp className="h-3 w-3" /> : sorted === 'desc' ? <ArrowDown className="h-3 w-3" /> : <ArrowUpDown className="h-3 w-3 opacity-50" />}
    </button>
  )
}

interface SubmissionTrackerProps {
  submitted: Tenant[]
  pending: Tenant[]
  submittedCount: number
  totalCount: number
  targetMonth: string
}

function formatTargetMonth(targetMonth: string): string {
  const parts = targetMonth.split('-')
  const month = parseInt(parts[1], 10)
  const year = parseInt(parts[0], 10)
  return `${MONTHS_LT[month - 1]} ${year}`
}

type FilterType = 'visi' | 'pateike' | 'laukiama'
type TenantRow = Tenant & { _submitted: boolean }

export function SubmissionTracker({
  submitted,
  pending,
  submittedCount,
  totalCount,
  targetMonth,
}: SubmissionTrackerProps) {
  const [filter, setFilter] = useState<FilterType>('visi')
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const pendingCount = totalCount - submittedCount
  const progressPercent = totalCount > 0 ? Math.round((submittedCount / totalCount) * 100) : 0
  const monthLabel = formatTargetMonth(targetMonth)

  const allTenants = useMemo<TenantRow[]>(() => [
    ...submitted.map((t) => ({ ...t, _submitted: true })),
    ...pending.map((t) => ({ ...t, _submitted: false })),
  ], [submitted, pending])

  const filtered = useMemo<TenantRow[]>(() =>
    allTenants.filter((t) => {
      if (filter === 'pateike') return t._submitted
      if (filter === 'laukiama') return !t._submitted
      return true
    }),
    [allTenants, filter])

  const columns = useMemo<ColumnDef<TenantRow>[]>(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() ? 'indeterminate' : false)}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Pasirinkti visus"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Pasirinkti eilutę"
        />
      ),
      enableSorting: false,
      size: 40,
    },
    {
      accessorKey: 'store_name',
      header: ({ column }) => <SortHeader column={column} title="Parduotuvė" />,
      cell: ({ row }) => <span className="font-medium">{row.original.store_name}</span>,
    },
    {
      accessorKey: 'operator',
      header: ({ column }) => <SortHeader column={column} title="Operatorius" />,
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.operator ?? '—'}</span>,
    },
    {
      accessorKey: 'category',
      header: ({ column }) => <SortHeader column={column} title="Kategorija" />,
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.category ?? 'Kita'}</span>,
    },
    {
      accessorKey: 'space_m2',
      header: ({ column }) => <SortHeader column={column} title="Plotas (m²)" />,
      cell: ({ row }) => (
        <span className="text-muted-foreground tabular-nums">
          {row.original.space_m2 != null ? `${row.original.space_m2} m²` : '—'}
        </span>
      ),
    },
    {
      accessorKey: 'rent_eur',
      header: ({ column }) => <SortHeader column={column} title="Nuoma (€)" />,
      cell: ({ row }) => (
        <span className="text-muted-foreground tabular-nums">
          {row.original.rent_eur != null
            ? new Intl.NumberFormat('lt-LT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(row.original.rent_eur)
            : '—'}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Būsena',
      cell: ({ row }) => (
        <div className="flex justify-end">
          {row.original._submitted ? (
            <Badge variant="success-light" size="sm">Pateikta</Badge>
          ) : (
            <Badge variant="warning-light" size="sm">Nepateikta</Badge>
          )}
        </div>
      ),
    },
  ], [])

  const table = useReactTable<TenantRow>({
    data: filtered,
    columns,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const selectedCount = Object.keys(rowSelection).length

  function exportSelectedCsv() {
    const rows = table.getSelectedRowModel().rows
    const header = ['Parduotuvė', 'Operatorius', 'Kategorija', 'Plotas (m²)', 'Nuoma (€)', 'Būsena']
    const lines = rows.map((row) => [
      `"${row.original.store_name}"`,
      `"${row.original.operator ?? ''}"`,
      `"${row.original.category ?? 'Kita'}"`,
      row.original.space_m2 ?? '',
      row.original.rent_eur ?? '',
      `"${row.original._submitted ? 'Pateikta' : 'Nepateikta'}"`,
    ].join(','))
    const csv = [header.join(','), ...lines].join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nuomininkai-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card variant="accent">
          <CardHeader className="px-4 py-3 min-h-0">
            <CardHeading>
              <CardDescription className="text-sm font-medium">Pateikė ({monthLabel})</CardDescription>
              <CardTitle className="text-2xl font-bold tabular-nums text-success">
                {submittedCount}
                <span className="text-base font-normal text-muted-foreground">/{totalCount}</span>
              </CardTitle>
            </CardHeading>
          </CardHeader>
        </Card>
        <Card variant="accent">
          <CardHeader className="px-4 py-3 min-h-0">
            <CardHeading>
              <CardDescription className="text-sm font-medium">Laukiama</CardDescription>
              <CardTitle className="text-2xl font-bold tabular-nums text-warning">
                {pendingCount}
                <span className="text-base font-normal text-muted-foreground">/{totalCount}</span>
              </CardTitle>
            </CardHeading>
          </CardHeader>
        </Card>
      </div>

      {totalCount > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Pateikimo progresas</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-success transition-all duration-500"
              style={{ width: `${progressPercent}%` }} // dynamic — Tailwind cannot generate arbitrary percentage widths at runtime
            />
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardHeading>
            <CardTitle className="text-lg">Nuomininkų būsena</CardTitle>
          </CardHeading>
          <CardToolbar>
            <div className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
              {(['visi', 'pateike', 'laukiama'] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => { setFilter(f); setRowSelection({}) }}
                  className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 min-w-16",
                    filter === f ? "bg-background text-foreground shadow-xs" : "hover:bg-muted hover:text-foreground"
                  )}
                >
                  {f === 'visi' ? 'Visi' : f === 'pateike' ? 'Pateikė' : 'Laukiama'}
                </button>
              ))}
            </div>
          </CardToolbar>
        </CardHeader>

        {selectedCount > 0 && (
          <div className="flex items-center justify-between gap-3 border-b px-4 py-2 bg-muted/40">
            <span className="text-sm text-muted-foreground">
              {selectedCount} pasirinkta
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportSelectedCsv}
              >
                <Download className="size-3.5 mr-1.5" />
                Eksportuoti CSV
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRowSelection({})}
              >
                <X className="size-3.5 mr-1.5" />
                Panaikinti
              </Button>
            </div>
          </div>
        )}

        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b bg-muted/40">
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-3 h-9 font-normal text-secondary-foreground/80 align-middle"
                      style={header.column.columnDef.size ? { width: header.column.columnDef.size } : undefined} // dynamic — TanStack Table column sizes are runtime values
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b last:border-0 hover:bg-muted/40",
                    row.getIsSelected() && "bg-muted/60"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
              {table.getRowModel().rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="px-3 py-6 text-center text-muted-foreground">
                    Įrašų nerasta
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
