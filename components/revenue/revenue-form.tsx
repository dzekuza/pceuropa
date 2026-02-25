'use client'
// components/revenue/revenue-form.tsx — Weekly revenue submission table
// Seller fills in per-week Pirkimų skaičius + Apyvarta be PVM (weeks I–V)
// Suma row auto-calculates totals
import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { revenueFormSchema, type RevenueFormValues } from '@/lib/validations/revenue'
import { submitRevenue } from '@/actions/revenue'
import { MONTHS_LT } from '@/lib/constants'
import type { RevenueReport } from '@/types/database'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const WEEK_LABELS = ['I', 'II', 'III', 'IV', 'V'] as const

const EMPTY_WEEKS: RevenueFormValues['weeks'] = [
  { tx_count: '', amount_eur: '' },
  { tx_count: '', amount_eur: '' },
  { tx_count: '', amount_eur: '' },
  { tx_count: '', amount_eur: '' },
  { tx_count: '', amount_eur: '' },
]

// Generate last 12 months as "YYYY-MM" values, most recent first
function generateMonthOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = []
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const year = d.getFullYear()
    const month = d.getMonth()
    const value = `${year}-${String(month + 1).padStart(2, '0')}`
    const label = `${MONTHS_LT[month]} ${year}`
    options.push({ value, label })
  }
  return options
}

interface RevenueFormProps {
  reports: RevenueReport[]
  selectedMonth: string
  onSelectMonth: (month: string) => void
}

export function RevenueForm({ reports, selectedMonth, onSelectMonth }: RevenueFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const monthOptions = generateMonthOptions()

  // Find existing report for currently selected month
  const existingReport = reports.find((r) => r.month.startsWith(selectedMonth))
  const isEditing = !!existingReport

  // Convert existing weekly data back to form strings
  function existingWeeksToForm(): RevenueFormValues['weeks'] {
    if (!existingReport?.weeks || !Array.isArray(existingReport.weeks)) return EMPTY_WEEKS
    return existingReport.weeks.map((w) => ({
      tx_count: w.tx_count ? String(w.tx_count) : '',
      amount_eur: w.amount_eur ? String(w.amount_eur) : '',
    })) as RevenueFormValues['weeks']
  }

  const form = useForm<RevenueFormValues>({
    resolver: zodResolver(revenueFormSchema),
    defaultValues: {
      month: selectedMonth,
      weeks: existingWeeksToForm(),
      submitted_by: existingReport?.submitted_by ?? '',
    },
  })

  // Watch weeks for live Suma calculation
  const watchedWeeks = useWatch({ control: form.control, name: 'weeks' })

  const totals = useMemo(() => {
    let totalTx = 0
    let totalAmount = 0
    for (const w of watchedWeeks) {
      const tx = parseInt(w.tx_count)
      const amt = parseFloat(w.amount_eur)
      if (!isNaN(tx)) totalTx += tx
      if (!isNaN(amt)) totalAmount += amt
    }
    return { tx_count: totalTx, amount_eur: totalAmount }
  }, [watchedWeeks])

  // Re-sync form values when selectedMonth or reports change
  useEffect(() => {
    const existing = reports.find((r) => r.month.startsWith(selectedMonth))
    const weeks = existing?.weeks && Array.isArray(existing.weeks)
      ? (existing.weeks.map((w) => ({
          tx_count: w.tx_count ? String(w.tx_count) : '',
          amount_eur: w.amount_eur ? String(w.amount_eur) : '',
        })) as RevenueFormValues['weeks'])
      : EMPTY_WEEKS
    form.reset({
      month: selectedMonth,
      weeks,
      submitted_by: existing?.submitted_by ?? '',
    })
    setSubmitMessage(null)
  }, [selectedMonth, reports, form])

  function onSubmit(values: RevenueFormValues) {
    const wasEditing = isEditing
    startTransition(async () => {
      const result = await submitRevenue(values)
      if ('error' in result) {
        setSubmitMessage({ type: 'error', text: result.error })
        return
      }
      setSubmitMessage({
        type: 'success',
        text: wasEditing ? 'Duomenys atnaujinti' : 'Duomenys išsaugoti',
      })
      router.refresh()
    })
  }

  return (
    <div className="rounded-lg border p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {/* Editing indicator */}
          {isEditing && (
            <div className="rounded-md bg-blue-50 border border-blue-200 px-3 py-2 text-sm text-blue-700">
              Redaguojate jau pateiktus duomenis
            </div>
          )}

          {/* Submit feedback */}
          {submitMessage && (
            <div
              className={`rounded-md border px-3 py-2 text-sm ${
                submitMessage.type === 'success'
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : 'border-destructive/50 bg-destructive/10 text-destructive'
              }`}
            >
              {submitMessage.text}
            </div>
          )}

          {/* Month selector */}
          <FormField
            control={form.control}
            name="month"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ataskaitinis laikotarpis</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value)
                    onSelectMonth(value)
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full max-w-xs">
                      <SelectValue placeholder="Pasirinkite mėnesį" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {monthOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Weekly breakdown table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Savaitė</TableHead>
                  <TableHead className="text-right">Pirkimų skaičius</TableHead>
                  <TableHead className="text-right">Apyvarta be PVM</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {([0, 1, 2, 3, 4] as const).map((idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{WEEK_LABELS[idx]}</TableCell>
                    <TableCell className="text-right p-1">
                      <FormField
                        control={form.control}
                        name={`weeks.${idx}.tx_count` as const}
                        render={({ field }) => (
                          <FormItem className="space-y-0">
                            <FormControl>
                              <Input
                                type="text"
                                inputMode="numeric"
                                placeholder="0"
                                className="text-right h-9"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    <TableCell className="text-right p-1">
                      <FormField
                        control={form.control}
                        name={`weeks.${idx}.amount_eur` as const}
                        render={({ field }) => (
                          <FormItem className="space-y-0">
                            <FormControl>
                              <Input
                                type="text"
                                inputMode="decimal"
                                placeholder="0.00"
                                className="text-right h-9"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow className="font-bold">
                  <TableCell>Suma:</TableCell>
                  <TableCell className="text-right">{totals.tx_count}</TableCell>
                  <TableCell className="text-right">{totals.amount_eur.toFixed(2)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>

          {/* Submitted by */}
          <FormField
            control={form.control}
            name="submitted_by"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Užpildė</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Vardas Pavardė"
                    className="max-w-xs"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isPending} className="mt-2 w-fit">
            {isPending
              ? 'Saugoma...'
              : isEditing
              ? 'Atnaujinti'
              : 'Pateikti'}
          </Button>
        </form>
      </Form>
    </div>
  )
}
