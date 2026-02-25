'use client'

import { CSSProperties } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Badge } from '@/components/reui/badge'
import { TrendingUpIcon, TrendingDownIcon } from 'lucide-react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardToolbar,
    CardHeading,
} from '@/components/ui/card'
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart'
import type { MonthlyRevenuePoint } from '@/lib/utils/analytics'

interface RevenueAreaChartProps {
    data: MonthlyRevenuePoint[]
    title?: string
    description?: string
}

const chartConfig = {
    total: {
        label: 'Apyvarta',
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

export function RevenueAreaChart({
    data,
    title = "Apyvartos tendencija",
    description = "Mėnesinė apyvarta EUR"
}: RevenueAreaChartProps) {
    const hasData = data.some((d) => d.total > 0)

    // Calculate trend
    const lastTotal = data[data.length - 1]?.total || 0
    const prevTotal = data[data.length - 2]?.total || 0
    const trend = prevTotal > 0 ? ((lastTotal - prevTotal) / prevTotal) * 100 : 0
    const isUp = trend >= 0

    return (
        <Card className="w-full">
            <CardHeader>
                <CardHeading>
                    <CardTitle className="flex items-center gap-2">
                        {title}
                        {hasData && (
                            <Badge variant={isUp ? "success-light" : "destructive-light"} className="ml-0">
                                {isUp ? <TrendingUpIcon className="size-3" /> : <TrendingDownIcon className="size-3" />}
                                {isUp ? '+' : ''}{trend.toFixed(1)}%
                            </Badge>
                        )}
                    </CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeading>
                <CardToolbar />
            </CardHeader>
            <CardContent>
                {!hasData ? (
                    <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
                        Nėra duomenų pasirinktam laikotarpiui
                    </div>
                ) : (
                    <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
                        <AreaChart
                            accessibilityLayer
                            data={data}
                            margin={{ left: 12, right: 12, top: 20, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="revenue-gradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-total)" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="var(--color-total)" stopOpacity={0.05} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                            <XAxis
                                dataKey="label"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tick={{ fontSize: 11 }}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(v) => `€${(v as number / 1000).toFixed(0)}k`}
                                tick={{ fontSize: 11 }}
                                width={40}
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
                                fill="url(#revenue-gradient)"
                                fillOpacity={0.4}
                                stroke="var(--color-total)"
                                strokeWidth={2}
                                dot={{ r: 3, fill: 'var(--color-total)', strokeWidth: 0 }}
                                activeDot={{ r: 5 }}
                            />
                        </AreaChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    )
}
