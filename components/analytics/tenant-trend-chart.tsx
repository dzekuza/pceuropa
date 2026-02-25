'use client'

// components/analytics/tenant-trend-chart.tsx
// Per-tenant month-over-month revenue trend chart
// Uses a Select dropdown to pick one tenant and see their individual trend (ANLT-03)
// Single-tenant approach chosen over multi-line for readability with many tenants

import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { TenantTrendSeries } from '@/lib/utils/analytics'

interface TenantTrendChartProps {
  data: TenantTrendSeries[]
}

function formatEur(value: number): string {
  return new Intl.NumberFormat('lt-LT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function CustomTooltip({
  active,
  payload,
  label,
  storeName,
}: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
  storeName?: string
}) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="rounded-md border bg-background px-3 py-2 shadow-sm text-sm">
      {storeName && <p className="font-medium mb-0.5">{storeName}</p>}
      <p className="text-muted-foreground mb-1">{label}</p>
      <p className="font-semibold">{formatEur(payload[0].value)}</p>
    </div>
  )
}

export function TenantTrendChart({ data }: TenantTrendChartProps) {
  const [selectedTenantId, setSelectedTenantId] = useState<string>(
    data[0]?.tenantId ?? ''
  )

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nuomininku apyvartos tendencijos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">
            Nera nuomininku duomenu
          </div>
        </CardContent>
      </Card>
    )
  }

  const selectedSeries = data.find((s) => s.tenantId === selectedTenantId) ?? data[0]
  const hasData = selectedSeries?.data.some((d) => d.total > 0)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Nuomininku apyvartos tendencijos</CardTitle>
        <Select value={selectedTenantId} onValueChange={setSelectedTenantId}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Pasirinkite nuomininką" />
          </SelectTrigger>
          <SelectContent>
            {data.map((series) => (
              <SelectItem key={series.tenantId} value={series.tenantId}>
                {series.storeName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">
            Nera duomenu pasirinktam nuomininkui
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart
              data={selectedSeries.data}
              margin={{ top: 8, right: 24, left: 16, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tickFormatter={(v) => formatEur(v)}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={90}
              />
              <Tooltip
                content={
                  <CustomTooltip storeName={selectedSeries.storeName} />
                }
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 3, fill: 'hsl(var(--primary))' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
