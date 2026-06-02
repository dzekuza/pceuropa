'use client'
import { useState, useMemo } from 'react'
import { Card, CardToolbar, CardDescription, CardHeader, CardHeading, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/reui/badge'
import { cn } from '@/lib/utils'
import type { Tenant } from '@/types/database'
import { MONTHS_LT } from '@/lib/constants'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type Column,
} from '@tanstack/react-table'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

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
      accessorKey: 'store_name',
      header: ({ column }) => <SortHeader column={column} title="Parduotuvė" />,
      cell: ({ row }) => <span className="font-medium">{row.original.store_name}</span>,
    },
    {
      accessorKey: 'category',
      header: ({ column }) => <SortHeader column={column} title="Kategorija" />,
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.category ?? 'Kita'}</span>,
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
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card variant="accent">
          <CardHeader>
            <CardHeading>
              <CardDescription className="text-base font-medium">Pateikė ({monthLabel})</CardDescription>
              <CardTitle className="text-4xl font-bold tabular-nums text-success">
                {submittedCount}
                <span className="text-xl font-normal text-muted-foreground">/{totalCount}</span>
              </CardTitle>
            </CardHeading>
          </CardHeader>
        </Card>
        <Card variant="accent">
          <CardHeader>
            <CardHeading>
              <CardDescription className="text-base font-medium">Laukiama</CardDescription>
              <CardTitle className="text-4xl font-bold tabular-nums text-warning">
                {pendingCount}
                <span className="text-xl font-normal text-muted-foreground">/{totalCount}</span>
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
              style={{ width: `${progressPercent}%` }}
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
                  onClick={() => setFilter(f)}
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
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b bg-muted/40">
                  {hg.headers.map((header) => (
                    <th key={header.id} className="px-3 h-9 font-normal text-secondary-foreground/80 align-middle">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b last:border-0 hover:bg-muted/40">
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
