'use client'

import { CSSProperties } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Badge } from '@/components/reui/badge'
import { TrendingUpIcon } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardToolbar,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import type { MonthlyRevenuePoint } from '@/lib/utils/analytics'

interface RevenueLineChartProps {
  data: MonthlyRevenuePoint[]
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

export function RevenueLineChart({ data }: RevenueLineChartProps) {
  const hasData = data.some((d) => d.total > 0)

  // Calculate trend (dummy calculation for UI purpose as per pattern)
  const lastTotal = data[data.length - 1]?.total || 0
  const prevTotal = data[data.length - 2]?.total || 0
  const trend = prevTotal > 0 ? ((lastTotal - prevTotal) / prevTotal) * 100 : 0

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Bendros pajamos
          {hasData && (
            <Badge variant={trend >= 0 ? "success-light" : "destructive-light"} className="ml-0">
              <TrendingUpIcon className={`h-3 w-3 ${trend < 0 ? 'rotate-180' : ''}`} aria-hidden="true" />
              {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Mėnesinė apyvarta — pasirinktam laikotarpiui</CardDescription>
        <CardToolbar />
      </CardHeader>
      <CardContent className="px-2 pt-2 sm:px-6 sm:pt-4">
        {!hasData ? (
          <div className="flex items-center justify-center h-[220px] sm:h-[280px] text-muted-foreground text-sm">
            Nėra duomenų pasirinktam laikotarpiui
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[220px] sm:h-[280px] w-full">
            <AreaChart
              accessibilityLayer
              data={data}
              margin={{ left: 12, right: 12, top: 20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="chart14-total" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-total)" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="var(--color-total)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis
                tickFormatter={(v) => `€${(v as number / 1000).toFixed(0)}k`}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
                width={45}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    className="min-w-40 gap-2.5"
                    labelFormatter={(value) => (
                      <div className="border-border/50 mb-0.5 border-b pb-2">
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
                        <span className="text-foreground font-semibold tabular-nums">
                          {formatEur(value as number)}
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <Area
                dataKey="total"
                type="natural"
                fill="url(#chart14-total)"
                fillOpacity={0.4}
                stroke="var(--color-total)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

