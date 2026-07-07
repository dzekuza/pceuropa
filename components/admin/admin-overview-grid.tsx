'use client'
// components/admin/admin-overview-grid.tsx
// Cross-tenant year overview: rows = tenants, columns = months, with heatmap coloring.
import { useMemo, useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardTable } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

// Custom month abbreviations — Rugpjūtis/Rugsėjis both start with "Rug"
const MONTH_SHORT = ['Sau', 'Vas', 'Kov', 'Bal', 'Geg', 'Bir', 'Lie', 'Rgp', 'Rgs', 'Spa', 'Lap', 'Grd']

type Mode = 'revenue' | 'tx'

interface TenantRow {
  id: string
  store_name: string
  category: string | null
}

interface ReportRow {
  tenant_id: string | null
  month: string
  amount_eur: number
  tx_count: number | null
}

interface AdminOverviewGridProps {
  tenants: TenantRow[]
  reports: ReportRow[]
  year: number
}

interface GridRow {
  id: string
  storeName: string
  category: string | null
  months: (number | null)[]
  total: number
}

type FlatItem =
  | { type: 'cat'; category: string; key: string }
  | { type: 'row'; row: GridRow }

const eurFmt = new Intl.NumberFormat('lt-LT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
const intFmt = new Intl.NumberFormat('lt-LT', { maximumFractionDigits: 0 })

function fmtEur(v: number): string { return eurFmt.format(v) }
function fmtInt(v: number): string { return intFmt.format(v) }

function buildGrid(tenants: TenantRow[], reports: ReportRow[], mode: Mode): GridRow[] {
  const lookup = new Map<string, Map<number, { amount: number; tx: number }>>()

  for (const r of reports) {
    if (!r.tenant_id) continue
    const monthIdx = parseInt(r.month.slice(5, 7), 10) - 1
    if (monthIdx < 0 || monthIdx > 11) continue
    if (!lookup.has(r.tenant_id)) lookup.set(r.tenant_id, new Map())
    const tm = lookup.get(r.tenant_id)!
    const cur = tm.get(monthIdx)
    if (cur) {
      cur.amount += r.amount_eur
      cur.tx += r.tx_count ?? 0
    } else {
      tm.set(monthIdx, { amount: r.amount_eur, tx: r.tx_count ?? 0 })
    }
  }

  return tenants.map((t) => {
    const tm = lookup.get(t.id)
    const months = Array.from({ length: 12 }, (_, i) => {
      const e = tm?.get(i)
      if (!e) return null
      return mode === 'revenue' ? e.amount : e.tx
    })
    const total = months.reduce<number>((s, v) => s + (v ?? 0), 0)
    return { id: t.id, storeName: t.store_name, category: t.category, months, total }
  })
}

// Green heatmap tint — proportional to value within its column
function heatStyle(value: number | null, colMax: number): React.CSSProperties {
  if (!value || colMax === 0) return {}
  const alpha = 0.05 + (value / colMax) * 0.38
  return { backgroundColor: `rgba(34, 197, 94, ${alpha.toFixed(2)})` }
}

export function AdminOverviewGrid({ tenants, reports }: AdminOverviewGridProps) {
  const [mode, setMode] = useState<Mode>('revenue')

  const rows = useMemo(() => buildGrid(tenants, reports, mode), [tenants, reports, mode])

  const sortedRows = useMemo(
    () =>
      [...rows].sort((a, b) => {
        const ca = a.category ?? '￿'
        const cb = b.category ?? '￿'
        if (ca !== cb) return ca.localeCompare(cb, 'lt')
        return b.total - a.total
      }),
    [rows]
  )

  // Flatten into category-header + data-row sequence
  const flatItems = useMemo<FlatItem[]>(() => {
    const out: FlatItem[] = []
    let lastCat: string | null | undefined = undefined
    for (const row of sortedRows) {
      if (row.category !== lastCat) {
        out.push({ type: 'cat', category: row.category ?? 'Kita', key: `cat-${row.category ?? 'null'}` })
        lastCat = row.category
      }
      out.push({ type: 'row', row })
    }
    return out
  }, [sortedRows])

  // Per-column max for heatmap scaling
  const colMaxes = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) =>
        Math.max(0, ...sortedRows.map((r) => r.months[i] ?? 0))
      ),
    [sortedRows]
  )

  // Column totals + grand total
  const colTotals = useMemo(
    () => Array.from({ length: 12 }, (_, i) => sortedRows.reduce((s, r) => s + (r.months[i] ?? 0), 0)),
    [sortedRows]
  )
  const grandTotal = colTotals.reduce((s, v) => s + v, 0)

  const fmt = mode === 'revenue' ? fmtEur : fmtInt

  return (
    <div className="flex flex-col gap-3">
      <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
        <TabsList>
          <TabsTrigger value="revenue">Apyvarta (€)</TabsTrigger>
          <TabsTrigger value="tx">Čekiai</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="overflow-hidden">
        <CardTable>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="sticky left-0 z-20 bg-muted/40 min-w-[180px] font-semibold text-foreground">
                  Nuomininkas
                </TableHead>
                {MONTH_SHORT.map((m, i) => (
                  <TableHead
                    key={i}
                    className="text-right w-[72px] font-semibold text-foreground uppercase tracking-wide text-xs"
                  >
                    {m}
                  </TableHead>
                ))}
                <TableHead className="text-right min-w-[90px] font-semibold text-foreground">
                  Iš viso
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {flatItems.map((item) => {
                if (item.type === 'cat') {
                  return (
                    <TableRow key={item.key} className="bg-muted/20 hover:bg-muted/20 border-b-0">
                      <TableCell
                        colSpan={14}
                        className="py-1.5 px-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest"
                      >
                        {item.category}
                      </TableCell>
                    </TableRow>
                  )
                }

                const { row } = item
                return (
                  <TableRow key={row.id} className="group border-b border-border/40">
                    <TableCell
                      className={cn(
                        'sticky left-0 z-10 bg-background transition-colors',
                        'group-hover:bg-muted/50',
                        'font-medium max-w-[220px] truncate'
                      )}
                    >
                      {row.storeName}
                    </TableCell>
                    {row.months.map((v, i) => (
                      <TableCell
                        key={i}
                        className="text-right tabular-nums text-xs px-2"
                        style={heatStyle(v, colMaxes[i])}
                      >
                        {v != null ? fmt(v) : <span className="text-muted-foreground/30">—</span>}
                      </TableCell>
                    ))}
                    <TableCell className="text-right tabular-nums text-xs font-semibold px-3">
                      {fmt(row.total)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>

            <TableFooter>
              <TableRow className="border-t-2">
                <TableCell className="sticky left-0 z-10 bg-muted/50 font-bold px-4">
                  Iš viso
                </TableCell>
                {colTotals.map((v, i) => (
                  <TableCell key={i} className="text-right tabular-nums text-xs px-2 font-semibold">
                    {v > 0 ? fmt(v) : <span className="text-muted-foreground/30">—</span>}
                  </TableCell>
                ))}
                <TableCell className="text-right tabular-nums font-bold px-3">
                  {fmt(grandTotal)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardTable>
      </Card>
    </div>
  )
}
