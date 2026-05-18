'use client'
// components/tenants/year-selector.tsx — Year selector navigating via ?year=YYYY URL param
import { useRouter, usePathname } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface YearSelectorProps {
  currentYear: number
}

export function YearSelector({ currentYear }: YearSelectorProps) {
  const router = useRouter()
  const pathname = usePathname()

  // Range: currentYear - 2 to currentYear + 1
  const years = Array.from({ length: 4 }, (_, i) => currentYear - 2 + i)

  function handleYearChange(value: string) {
    router.push(`${pathname}?year=${value}`)
  }

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-muted-foreground">Metai</label>
      <Select
        value={String(currentYear)}
        onValueChange={handleYearChange}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {years.map((year) => (
            <SelectItem key={year} value={String(year)}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
