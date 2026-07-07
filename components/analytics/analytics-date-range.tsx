'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MONTHS_LT } from '@/lib/constants'

interface AnalyticsYearFilterProps {
  year: string  // "YYYY"
  month: string // "1"–"12" or "" for full year
}

export function AnalyticsYearFilter({ year, month }: AnalyticsYearFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  const selectedYear = parseInt(year)

  const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i))

  // Cap months at current month when viewing the current year
  const maxMonth = selectedYear === currentYear ? currentMonth : 12
  const monthOptions = Array.from({ length: maxMonth }, (_, i) => ({
    value: String(i + 1),
    label: MONTHS_LT[i],
  }))

  function update(key: 'year' | 'month', value: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('from')
    params.delete('to')

    if (key === 'year') {
      params.set('year', value)
      params.delete('month')
    } else if (value === 'all') {
      params.delete('month')
    } else {
      params.set('month', value)
    }

    router.push(`/admin/analytics?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={year} onValueChange={(v) => update('year', v)}>
        <SelectTrigger className="w-24">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={y}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={month || 'all'} onValueChange={(v) => update('month', v)}>
        <SelectTrigger className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Visi mėnesiai</SelectItem>
          {monthOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
