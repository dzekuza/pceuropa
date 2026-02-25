'use client'

// components/analytics/submission-tracker.tsx
// Submission status tracker — summary cards + progress bar + filterable tenant table
// Client component for filter toggle interactivity

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import type { Tenant } from '@/types/database'
import { MONTHS_LT } from '@/lib/constants'

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

  const allTenants: (Tenant & { _submitted: boolean })[] = [
    ...submitted.map((t) => ({ ...t, _submitted: true })),
    ...pending.map((t) => ({ ...t, _submitted: false })),
  ]

  const filtered = allTenants.filter((t) => {
    if (filter === 'pateike') return t._submitted
    if (filter === 'laukiama') return !t._submitted
    return true
  })

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pateike ({monthLabel})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {submittedCount}
              <span className="text-base font-normal text-muted-foreground">
                /{totalCount}
              </span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Laukiama
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">
              {pendingCount}
              <span className="text-base font-normal text-muted-foreground">
                /{totalCount}
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Pateikimo progresai</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Tenant table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Nuomininku busena</CardTitle>
            <div className="flex gap-1">
              {(['visi', 'pateike', 'laukiama'] as FilterType[]).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 px-2 text-xs capitalize"
                  onClick={() => setFilter(f)}
                >
                  {f === 'visi' ? 'Visi' : f === 'pateike' ? 'Pateike' : 'Laukiama'}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parduotuve</TableHead>
                <TableHead>Kategorija</TableHead>
                <TableHead className="text-right">Busena</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                    Nera nuomininku
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell className="font-medium">{tenant.store_name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {tenant.category ?? 'Kita'}
                    </TableCell>
                    <TableCell className="text-right">
                      {tenant._submitted ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
                          Pateikta
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">
                          Nepateikta
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
