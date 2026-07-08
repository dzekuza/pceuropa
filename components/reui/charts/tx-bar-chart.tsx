'use client'

import { CSSProperties } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Badge } from '@/components/reui/badge'
import { ShoppingBagIcon } from 'lucide-react'
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
import type { RevenueReport } from '@/types/database'
import { MONTHS_LT } from '@/lib/constants'
import type { TxChartPoint } from '@/lib/admin-data'

type TxBarChartProps =
    | {
        reports: RevenueReport[]
        data?: never
        title?: string
        description?: string
      }
    | {
        reports?: never
        data: TxChartPoint[]
        title?: string
        description?: string
      }

const chartConfig = {
    tx_count: {
        label: 'Čekių sk.',
        color: 'var(--chart-2)',
    },
} satisfies ChartConfig

interface TxPoint {
    label: string
    tx_count: number
}

function buildData(reports: RevenueReport[]): TxPoint[] {
    // Aggregate receipt counts by calendar month (YYYY-MM), summing across all
    // reports/tenants that share a month, so each month renders as one total bar.
    const totals = new Map<string, number>()
    for (const r of reports) {
        const key = r.month.slice(0, 7)
        totals.set(key, (totals.get(key) ?? 0) + (r.tx_count ?? 0))
    }
    return [...totals.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([key, tx_count]) => {
            const [year, month] = key.split('-')
            const monthIdx = parseInt(month, 10) - 1
            return {
                label: `${MONTHS_LT[monthIdx]} ${year}`,
                tx_count,
            }
        })
}

export function TxBarChart({
    reports,
    data,
    title = "Čekių skaičius",
    description = "Mėnesiniai čekiai"
}: TxBarChartProps) {
    const resolvedData = data ?? buildData(reports)
    const hasData = resolvedData.length > 0 && resolvedData.some(d => d.tx_count > 0)
    const totalTx = resolvedData.reduce((sum, r) => sum + r.tx_count, 0)

    return (
        <Card className="w-full">
            <CardHeader>
                <CardHeading>
                    <CardTitle className="flex items-center gap-2">
                        {title}
                        {hasData && (
                            <Badge variant="primary-light" className="ml-0">
                                <ShoppingBagIcon className="size-3" />
                                Viso: {totalTx}
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
                        Nėra duomenų apie pirkimus
                    </div>
                ) : (
                    <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
                        <BarChart
                            accessibilityLayer
                            data={resolvedData}
                            margin={{ left: 12, right: 12, top: 20, bottom: 0 }}
                        >
                            <defs>
                                <pattern
                                    id="tx-bar-pattern"
                                    patternUnits="userSpaceOnUse"
                                    width="8"
                                    height="8"
                                >
                                    <rect
                                        width="8"
                                        height="8"
                                        fill="var(--color-tx_count)"
                                        opacity="0.1"
                                    />
                                    <path
                                        d="M0,8 L8,0 M4,12 L12,4 M-4,4 L4,-4"
                                        stroke="var(--color-tx_count)"
                                        strokeWidth="1.5"
                                        opacity="0.6"
                                    />
                                    <path
                                        d="M2,10 L10,2 M6,14 L14,6 M-2,6 L6,-2"
                                        stroke="var(--color-tx_count)"
                                        strokeWidth="1"
                                        opacity="0.3"
                                    />
                                </pattern>
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
                                tick={{ fontSize: 11 }}
                                allowDecimals={false}
                                width={30}
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
                                                    {Number(value).toLocaleString('lt-LT')}
                                                </span>
                                            </div>
                                        )}
                                    />
                                }
                            />
                            <Bar
                                dataKey="tx_count"
                                fill="url(#tx-bar-pattern)"
                                stroke="var(--color-tx_count)"
                                strokeWidth={1}
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    )
}
