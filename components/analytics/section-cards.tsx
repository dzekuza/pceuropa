import { UsersIcon, BarChart3Icon, WalletIcon } from 'lucide-react'
import { StatisticsCard } from '@/components/ui/statistics-card-1'

interface SectionCardsProps {
    totalRevenue: number
    totalRevenueLabel: string
    prevRevenue: number | null
    tenantCount: number
    submittedCount: number
    avgRevenue: number
}

function formatEur(value: number): string {
    return new Intl.NumberFormat('lt-LT', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value)
}

function pct(current: number, prev: number): number {
    if (prev === 0) return 0
    return ((current - prev) / prev) * 100
}

export function AnalyticsSectionCards({
    totalRevenue,
    totalRevenueLabel,
    prevRevenue,
    tenantCount,
    submittedCount,
    avgRevenue,
}: SectionCardsProps) {
    const hasPrev = prevRevenue !== null && prevRevenue > 0
    const trendValue = hasPrev ? pct(totalRevenue, prevRevenue!) : 0
    const isUp = hasPrev && totalRevenue >= prevRevenue!

    const submissionRate = tenantCount > 0 ? Math.round((submittedCount / tenantCount) * 100) : 0
    const submissionOk = submissionRate >= 80

    return (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

            {/* Card 1 — Total revenue */}
            <StatisticsCard
                title="Viso pajamų"
                value={formatEur(totalRevenue)}
                description={totalRevenueLabel}
                icon={WalletIcon}
                trend={hasPrev ? {
                    value: Math.abs(Math.round(trendValue * 10) / 10),
                    isUp: isUp,
                    label: "lyginant su praėjusiu laikotarpiu"
                } : undefined}
            />

            {/* Card 2 — Tenant count */}
            <StatisticsCard
                title="Nuomininkai"
                value={tenantCount}
                description="Visi aktyvūs nuomininkai sistemoje"
                icon={UsersIcon}
            />

            {/* Card 3 — Submission rate this month */}
            <StatisticsCard
                title="Pateikta šį mėnesį"
                value={`${submittedCount}/${tenantCount}`}
                description="Mėnesinių ataskaitų statusas"
                icon={BarChart3Icon}
                trend={{
                    value: submissionRate,
                    isUp: submissionOk,
                    label: "pateikimo rodiklis"
                }}
            />

            {/* Card 4 — Avg revenue per submitted tenant */}
            <StatisticsCard
                title="Vid. apyvarta / nuomininkas"
                value={formatEur(avgRevenue)}
                description="Skaičiuojama iš pateiktų ataskaitų"
                icon={BarChart3Icon}
            />
        </div>
    )
}
