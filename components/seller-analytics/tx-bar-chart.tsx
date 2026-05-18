'use client'
// components/seller-analytics/tx-bar-chart.tsx
// Bar chart: seller's monthly transaction count (Pirkimų sk.)

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
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
import type { RevenueReport } from '@/types/database'
import { MONTHS_LT } from '@/lib/constants'

interface TxBarChartProps {
    reports: RevenueReport[]
}

const chartConfig = {
    tx_count: {
        label: 'Pirkimų sk.',
        color: 'var(--chart-2)',
    },
} satisfies ChartConfig

interface TxPoint {
    label: string
    tx_count: number
}

function buildData(reports: RevenueReport[]): TxPoint[] {
    return [...reports]
        .sort((a, b) => a.month.localeCompare(b.month))
        .map((r) => {
            const parts = r.month.split('-')
            const monthIdx = parseInt(parts[1], 10) - 1
            const year = parts[0]
            return {
                label: `${MONTHS_LT[monthIdx]} ${year}`,
                tx_count: r.tx_count ?? 0,
            }
        })
}

export function TxBarChart({ reports }: TxBarChartProps) {
    const data = buildData(reports)

    if (data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Pirkimų skaičius</CardTitle>
                    <CardDescription>Mėnesiniai sandoriai</CardDescription>
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
                <CardTitle>Pirkimų skaičius</CardTitle>
                <CardDescription>Mėnesiniai sandoriai</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-64 w-full">
                    <BarChart data={data} margin={{ left: 4, right: 12, top: 4 }}>
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
                            tick={{ fontSize: 11 }}
                            allowDecimals={false}
                            width={36}
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    formatter={(value) => [`${value}`, 'Pirkimų sk.']}
                                    labelKey="label"
                                />
                            }
                        />
                        <Bar
                            dataKey="tx_count"
                            fill="var(--color-tx_count)"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
