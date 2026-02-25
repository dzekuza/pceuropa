'use client'
// components/revenue/revenue-page-client.tsx — Thin client wrapper holding selectedMonth state
// Renders RevenueForm and SubmissionHistory, coordinates month selection between them
import { useState } from 'react'
import type { RevenueReport } from '@/types/database'
import { RevenueForm } from '@/components/revenue/revenue-form'
import { SubmissionHistory } from '@/components/revenue/submission-history'

function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

interface RevenuePageClientProps {
  reports: RevenueReport[]
}

export function RevenuePageClient({ reports }: RevenuePageClientProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth)

  return (
    <div className="flex flex-col gap-6">
      <RevenueForm
        reports={reports}
        selectedMonth={selectedMonth}
        onSelectMonth={setSelectedMonth}
      />

      <div>
        <h2 className="text-lg font-semibold mb-3">Pateikti duomenys</h2>
        <SubmissionHistory reports={reports} onSelectMonth={setSelectedMonth} />
      </div>
    </div>
  )
}
