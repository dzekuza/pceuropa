'use client'

import { CSSProperties } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import type { CategoryRevenuePoint } from '@/lib/admin-data'

interface CategoryBarChartProps {
  data: CategoryRevenuePoint[]
}

const chartConfig = {
  total: {
    label: 'Pajamos',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

function formatEur(value: number): string {
  return new Intl.NumberFormat('lt-LT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function CategoryBarChart({ data }: CategoryBarChartProps) {
  const hasData = data.length > 0
  const chartHeight = Math.max(220, Math.min(420, data.length * 52 + 40))

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Pajamos pagal kategoriją</CardTitle>
        <CardDescription>Apyvarta kategorijų pjūviu — pasirinktam laikotarpiui</CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        {!hasData ? (
          <div className="flex items-center justify-center h-[220px] text-muted-foreground text-sm">
            Nėra duomenų pasirinktam laikotarpiui
          </div>
        ) : (
          <ChartContainer config={chartConfig} style={{ height: chartHeight }} className="w-full">
            <BarChart
              accessibilityLayer
              data={data}
              layout="vertical"
              margin={{ top: 20, right: 12, left: 4, bottom: 4 }}
            >
              <defs>
                <pattern
                  id="chart5-diagonal-stripe-pattern"
                  patternUnits="userSpaceOnUse"
                  width="8"
                  height="8"
                >
                  <rect
                    width="8"
                    height="8"
                    fill="var(--color-total)"
                    opacity="0.1"
                  />
                  <path
                    d="M0,8 L8,0 M4,12 L12,4 M-4,4 L4,-4"
                    stroke="var(--color-total)"
                    strokeWidth="1.5"
                    opacity="0.6"
                  />
                  <path
                    d="M2,10 L10,2 M6,14 L14,6 M-2,6 L6,-2"
                    stroke="var(--color-total)"
                    strokeWidth="1"
                    opacity="0.3"
                  />
                </pattern>
              </defs>
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <XAxis
                type="number"
                tickFormatter={(v) => `€${(v as number / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="category"
                width={150}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    className="min-w-40 gap-2.5"
                    labelFormatter={(value) => (
                      <div className="border-border/50 mb-0.5 flex flex-col gap-0.5 border-b pb-2">
                        <span className="text-xs font-medium">{value}</span>
                      </div>
                    )}
                    formatter={(value, name) => (
                      <div className="flex w-full items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2.5 w-2.5 shrink-0 rounded-xs bg-(--color-bg)"
                            style={
                              {
                                "--color-bg": `var(--color-${name})`,
                              } as CSSProperties
                            }
                          />
                          <span className="text-muted-foreground">
                            {chartConfig[name as keyof typeof chartConfig]?.label || name}
                          </span>
                        </div>
                        <span className="text-foreground font-semibold">
                          {formatEur(value as number)}
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <Bar
                dataKey="total"
                fill="url(#chart5-diagonal-stripe-pattern)"
                stroke="var(--color-total)"
                strokeWidth={1}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
