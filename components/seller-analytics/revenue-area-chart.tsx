'use client'
// components/seller-analytics/revenue-area-chart.tsx
// Area chart: seller's own monthly EUR revenue trend

import {
    Area,
    AreaChart,
    CartesianGrid,
    XAxis,
    YAxis,
} from 'recharts'
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import type { MonthlyRevenuePoint } from '@/lib/utils/analytics'

interface RevenueAreaChartProps {
    data: MonthlyRevenuePoint[]
}

const chartConfig = {
    total: {
        label: 'Apyvarta (EUR)',
        color: 'var(--chart-1)',
    },
} satisfies ChartConfig

function formatEur(value: number) {
    return new Intl.NumberFormat('lt-LT', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value)
}

export function RevenueAreaChart({ data }: RevenueAreaChartProps) {
    if (data.length === 0 || data.every((d) => d.total === 0)) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Apyvartos tendencija</CardTitle>
                    <CardDescription>Mėnesinė apyvarta EUR</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-48">
                    <p className="text-muted-foreground text-sm">Nėra duomenų</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Apyvartos tendencija</CardTitle>
                <CardDescription>Mėnesinė apyvarta EUR</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-64 w-full">
                    <AreaChart data={data} margin={{ left: 12, right: 12, top: 4 }}>
                        <defs>
                            <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-total)"
                                    stopOpacity={0.3}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-total)"
                                    stopOpacity={0.02}
                                />
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
                            tickFormatter={(v) => `€${(v as number).toLocaleString()}`}
                            tick={{ fontSize: 11 }}
                            width={58}
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    formatter={(value) => [
                                        formatEur(value as number),
                                        'Apyvarta',
                                    ]}
                                    labelKey="label"
                                />
                            }
                        />
                        <Area
                            type="monotone"
                            dataKey="total"
                            stroke="var(--color-total)"
                            strokeWidth={2}
                            fill="url(#fillRevenue)"
                            dot={{ r: 3, fill: 'var(--color-total)', strokeWidth: 0 }}
                            activeDot={{ r: 5 }}
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
