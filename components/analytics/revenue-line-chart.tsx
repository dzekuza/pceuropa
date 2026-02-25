'use client'

// components/analytics/revenue-line-chart.tsx
// Monthly center-wide revenue line chart using recharts

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
import type { MonthlyRevenuePoint } from '@/lib/utils/analytics'

interface RevenueLineChartProps {
  data: MonthlyRevenuePoint[]
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
}: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="rounded-md border bg-background px-3 py-2 shadow-sm text-sm">
      <p className="font-medium text-muted-foreground mb-1">{label}</p>
      <p className="font-semibold">{formatEur(payload[0].value)}</p>
    </div>
  )
}

export function RevenueLineChart({ data }: RevenueLineChartProps) {
  const hasData = data.some((d) => d.total > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Menesines pajamos (tendencija)</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">
            Nera duomenu pasirinktam laikotarpiui
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data} margin={{ top: 8, right: 24, left: 16, bottom: 8 }}>
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
              <Tooltip content={<CustomTooltip />} />
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
