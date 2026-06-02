'use client'

// components/analytics/analytics-date-range.tsx
// Date range picker — two Select dropdowns for "Nuo" and "Iki" month filters
// On change, pushes ?from=YYYY-MM&to=YYYY-MM to URL → triggers Server Component refetch

import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MONTHS_LT } from '@/lib/constants'

interface AnalyticsDateRangeProps {
  from: string  // current "YYYY-MM" value
  to: string    // current "YYYY-MM" value
}

interface MonthOption {
  value: string   // "YYYY-MM"
  label: string   // "Sausis 2026"
}

/** Generate last N months as options, newest first */
function generateMonthOptions(count: number = 24): MonthOption[] {
  const options: MonthOption[] = []
  const now = new Date()
  let year = now.getFullYear()
  let month = now.getMonth() + 1 // 1-indexed

  for (let i = 0; i < count; i++) {
    const value = `${year}-${String(month).padStart(2, '0')}`
    const label = `${MONTHS_LT[month - 1]} ${year}`
    options.push({ value, label })

    month--
    if (month < 1) {
      month = 12
      year--
    }
  }

  return options
}

export function AnalyticsDateRange({ from, to }: AnalyticsDateRangeProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const options = generateMonthOptions(24)

  function updateParam(key: 'from' | 'to', value: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set(key, value)
    router.push(`/admin/analytics?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground whitespace-nowrap">Nuo</span>
      <Select value={from} onValueChange={(v) => updateParam('from', v)}>
        <SelectTrigger className="w-36 min-w-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <span className="text-sm text-muted-foreground whitespace-nowrap">Iki</span>
      <Select value={to} onValueChange={(v) => updateParam('to', v)}>
        <SelectTrigger className="w-36 min-w-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
