'use client'

// components/analytics/category-bar-chart.tsx
// Horizontal bar chart for per-category revenue breakdown

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CategoryRevenuePoint } from '@/lib/utils/analytics'

interface CategoryBarChartProps {
  data: CategoryRevenuePoint[]
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

export function CategoryBarChart({ data }: CategoryBarChartProps) {
  const hasData = data.length > 0

  // Dynamic height: min 200, max 400 based on number of categories
  const chartHeight = Math.max(200, Math.min(400, data.length * 48 + 40))

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Pajamos pagal kategorija</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">
            Nera duomenu pasirinktam laikotarpiui
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 8, right: 80, left: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted" />
              <XAxis
                type="number"
                tickFormatter={(v) => formatEur(v)}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="category"
                width={160}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]}>
                <LabelList
                  dataKey="total"
                  position="right"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(v: any) => (v != null ? formatEur(Number(v)) : '')}
                  style={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
