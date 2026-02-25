'use client'

import { useState, CSSProperties } from 'react'
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

const chartConfig = {
  total: {
    label: 'Apyvarta',
    color: 'var(--chart-2)',
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

function CrosshatchPattern({ config }: { config: ChartConfig }) {
  const entries = Object.entries(config).filter(([, v]) => v.color)
  return (
    <>
      {entries.map(([key, { color }]) => (
        <pattern
          key={key}
          id={`chart18-crosshatch-${key}`}
          x="0"
          y="0"
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
        >
          <path d="M0,8 L8,0" stroke={color} strokeWidth="0.8" opacity="0.4" />
          <path d="M0,0 L8,8" stroke={color} strokeWidth="0.8" opacity="0.2" />
        </pattern>
      ))}
    </>
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
          <CardTitle>Nuomininko apyvartos tendencija</CardTitle>
          <CardDescription>Pasirinkite nuomininką</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">
            Nėra nuomininkų duomenų
          </div>
        </CardContent>
      </Card>
    )
  }

  const selectedSeries = data.find((s) => s.tenantId === selectedTenantId) ?? data[0]
  const hasData = selectedSeries?.data.some((d) => d.total > 0)

  // Calculate trend
  const seriesData = selectedSeries?.data || []
  const lastTotal = seriesData[seriesData.length - 1]?.total || 0
  const prevTotal = seriesData[seriesData.length - 2]?.total || 0
  const trend = prevTotal > 0 ? ((lastTotal - prevTotal) / prevTotal) * 100 : 0

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Nuomininko apyvartos tendencija
          {hasData && (
            <Badge variant={trend >= 0 ? "success-light" : "destructive-light"} className="ml-0">
              <TrendingUpIcon className={`h-3 w-3 ${trend < 0 ? 'rotate-180' : ''}`} aria-hidden="true" />
              {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {selectedSeries?.storeName ?? 'Pasirinkite nuomininką'}
        </CardDescription>
        <CardToolbar>
          <Select value={selectedTenantId} onValueChange={setSelectedTenantId}>
            <SelectTrigger className="w-[200px]" size="sm">
              <SelectValue placeholder="Pasirinkite nuomininką" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {data.map((series) => (
                <SelectItem key={series.tenantId} value={series.tenantId} className="rounded-lg">
                  {series.storeName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardToolbar>
      </CardHeader>
      <CardContent className="px-2 pt-2 sm:px-6 sm:pt-4">
        {!hasData ? (
          <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">
            Nėra duomenų pasirinktam nuomininkui
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
            <AreaChart
              accessibilityLayer
              data={selectedSeries.data}
              margin={{ left: 12, right: 12, top: 20, bottom: 0 }}
            >
              <defs>
                <CrosshatchPattern config={chartConfig} />
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 11 }}
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
                fill="url(#chart18-crosshatch-total)"
                fillOpacity={0.5}
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

