'use client'
// components/analytics/submission-tracker.tsx — Updated to use DataGrid aesthetic
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
  getFilteredRowModel,
  ColumnDef,
} from '@tanstack/react-table'
import { DataGrid } from '@/components/reui/data-grid/data-grid'
import { DataGridTable } from '@/components/reui/data-grid/data-grid-table'
import { DataGridColumnHeader } from '@/components/reui/data-grid/data-grid-column-header'

interface SubmissionTrackerProps {
  submitted: Tenant[]
  pending: Tenant[]
  submittedCount: number
  totalCount: number
  targetMonth: string  // "YYYY-MM-01"
}

function formatTargetMonth(targetMonth: string): string {
  const parts = targetMonth.split('-')
  const month = parseInt(parts[1], 10)
  const year = parseInt(parts[0], 10)
  return `${MONTHS_LT[month - 1]} ${year}`
}

type FilterType = 'visi' | 'pateike' | 'laukiama'

export function SubmissionTracker({
  submitted,
  pending,
  submittedCount,
  totalCount,
  targetMonth,
}: SubmissionTrackerProps) {
  const [filter, setFilter] = useState<FilterType>('visi')

  const pendingCount = totalCount - submittedCount
  const progressPercent = totalCount > 0 ? Math.round((submittedCount / totalCount) * 100) : 0
  const monthLabel = formatTargetMonth(targetMonth)

  const allTenants = useMemo(() => [
    ...submitted.map((t) => ({ ...t, _submitted: true })),
    ...pending.map((t) => ({ ...t, _submitted: false })),
  ], [submitted, pending])

  const filtered = useMemo(() =>
    allTenants.filter((t) => {
      if (filter === 'pateike') return t._submitted
      if (filter === 'laukiama') return !t._submitted
      return true
    }),
    [allTenants, filter])

  const columns = useMemo<ColumnDef<typeof allTenants[0]>[]>(() => [
    {
      accessorKey: 'store_name',
      header: ({ column }) => <DataGridColumnHeader title="Parduotuvė" column={column} />,
      cell: ({ row }) => <span className="font-medium">{row.original.store_name}</span>,
      size: 200,
    },
    {
      accessorKey: 'category',
      header: ({ column }) => <DataGridColumnHeader title="Kategorija" column={column} />,
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.category ?? 'Kita'}</span>,
      size: 150,
    },
    {
      id: 'status',
      header: ({ column }) => <DataGridColumnHeader title="Būsena" column={column} />,
      cell: ({ row }) => (
        <div className="flex justify-end">
          {row.original._submitted ? (
            <Badge variant="success-light" size="sm">
              Pateikta
            </Badge>
          ) : (
            <Badge variant="warning-light" size="sm">
              Nepateikta
            </Badge>
          )}
        </div>
      ),
      size: 130,
    },
  ], [])

  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className="space-y-4">
      {/* Summary cards */}
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

      {/* Progress bar */}
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

      {/* Tenant table */}
      <DataGrid
        table={table}
        recordCount={filtered.length}
        tableLayout={{ rowBorder: true }}
      >
        <Card>
          <CardHeader>
            <CardHeading>
              <CardTitle className="text-lg">Nuomininkų būsena</CardTitle>
            </CardHeading>
            <CardToolbar>
              <div className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
                {(['visi', 'pateike', 'laukiama'] as FilterType[]).map((f) => {
                  const isActive = filter === f
                  return (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={cn(
                        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 min-w-16",
                        isActive ? "bg-background text-foreground shadow-xs" : "hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {f === 'visi' ? 'Visi' : f === 'pateike' ? 'Pateikė' : 'Laukiama'}
                    </button>
                  )
                })}
              </div>
            </CardToolbar>
          </CardHeader>
          <div className="w-full">
            <DataGridTable />
          </div>
        </Card>
      </DataGrid>
    </div>
  )
}
