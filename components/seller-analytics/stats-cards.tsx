import { StatisticsCard } from '@/components/ui/statistics-card-1'
import type { RevenueReport } from '@/types/database'
import { MONTHS_LT } from '@/lib/constants'
import { WalletIcon, ShoppingBagIcon, StarIcon, CalendarIcon } from 'lucide-react'

interface StatsCardsProps {
    reports: RevenueReport[]
}

function formatEur(value: number) {
    return new Intl.NumberFormat('lt-LT', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value)
}

function formatMonth(monthStr: string): string {
    const parts = monthStr.split('-')
    const monthIdx = parseInt(parts[1], 10) - 1
    const year = parts[0]
    return `${MONTHS_LT[monthIdx]} ${year}`
}

export function StatsCards({ reports }: StatsCardsProps) {
    const totalRevenue = reports.reduce((sum, r) => sum + r.amount_eur, 0)
    const totalTx = reports.reduce((sum, r) => sum + (r.tx_count ?? 0), 0)
    const monthsSubmitted = reports.length

    const bestReport = reports.reduce<RevenueReport | null>(
        (best, r) => (!best || r.amount_eur > best.amount_eur ? r : best),
        null
    )

    // Calculate simple trend for revenue (last vs second to last)
    let revenueTrend = undefined
    if (reports.length >= 2) {
        // reports are assumed ascending by month if coming from analytics page
        const last = reports[reports.length - 1].amount_eur
        const prev = reports[reports.length - 2].amount_eur
        if (prev > 0) {
            const diff = ((last - prev) / prev) * 100
            revenueTrend = {
                value: Math.abs(Math.round(diff * 10) / 10),
                isUp: diff >= 0,
                label: "lyginant su praėjusiu mėn."
            }
        }
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatisticsCard
                title="Viso apyvarta"
                value={reports.length === 0 ? '—' : formatEur(totalRevenue)}
                description="Viso pateikti mėnesiai"
                icon={WalletIcon}
                trend={revenueTrend}
            />

            <StatisticsCard
                title="Viso čekių"
                value={reports.length === 0 ? '—' : totalTx.toLocaleString('lt-LT')}
                description="Čekių iš viso"
                icon={ShoppingBagIcon}
            />

            <StatisticsCard
                title="Geriausias mėnuo"
                value={bestReport ? formatEur(bestReport.amount_eur) : '—'}
                description={bestReport ? `Pasiekta: ${formatMonth(bestReport.month)}` : 'nėra duomenų'}
                icon={StarIcon}
            />

            <StatisticsCard
                title="Pateikti mėnesiai"
                value={monthsSubmitted}
                description="Ataskaitų iš viso"
                icon={CalendarIcon}
            />
        </div>
    )
}
