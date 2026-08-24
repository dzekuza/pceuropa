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
import { formatEur, formatInt } from '@/lib/utils/format'
import type { RevenueReport, WeekData } from '@/types/database'
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

// Convert a report's weekly data back to form strings. Reports imported
// without a weekly breakdown have only totals — put those into Week I so
// the Suma matches the stored total and the seller can redistribute them.
function reportToWeeksForm(report: RevenueReport | undefined): RevenueFormValues['weeks'] {
  if (report?.weeks && Array.isArray(report.weeks) && report.weeks.length > 0) {
    return (report.weeks as unknown as WeekData[]).map((w) => ({
      tx_count: w.tx_count ? String(w.tx_count) : '',
      amount_eur: w.amount_eur ? String(w.amount_eur) : '',
    })) as RevenueFormValues['weeks']
  }
  if (report) {
    return [
      { tx_count: String(report.tx_count ?? ''), amount_eur: String(report.amount_eur ?? '') },
      { tx_count: '', amount_eur: '' },
      { tx_count: '', amount_eur: '' },
      { tx_count: '', amount_eur: '' },
      { tx_count: '', amount_eur: '' },
    ]
  }
  return EMPTY_WEEKS
}

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
  // Reports imported without a weekly breakdown (e.g. Moderan turnover sync) have
  // totals but no `weeks` — the form grid would otherwise render blank and a save
  // would overwrite the real total with 0. Detect that to warn the user.
  const existingHasWeeks =
    Array.isArray(existingReport?.weeks) && existingReport.weeks.length > 0
  const missingWeeklyBreakdown = isEditing && !existingHasWeeks

  const form = useForm<RevenueFormValues>({
    resolver: zodResolver(revenueFormSchema),
    defaultValues: {
      month: selectedMonth,
      weeks: reportToWeeksForm(existingReport),
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
    form.reset({
      month: selectedMonth,
      weeks: reportToWeeksForm(existing),
      submitted_by: existing?.submitted_by ?? '',
    })
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
          {isEditing && !missingWeeklyBreakdown && (
            <div className="rounded-md bg-info/10 border border-info/20 px-3 py-2 text-sm text-info-foreground">
              Redaguojate jau pateiktus duomenis
            </div>
          )}

          {/* Imported data without a weekly breakdown — totals were placed in I savaitė */}
          {missingWeeklyBreakdown && (
            <div className="rounded-md bg-warning/10 border border-warning/20 px-3 py-2 text-sm text-warning-foreground">
              Šio mėnesio duomenys įvesti be savaitinio suskirstymo — bendra apyvarta{' '}
              <strong>{formatEur(existingReport!.amount_eur)} EUR</strong> ir čekių sk.{' '}
              <strong>{formatInt(existingReport!.tx_count)}</strong> įrašyti į I savaitę.
              Paskirstykite juos tarp savaičių, jei reikia, ir išsaugokite.
            </div>
          )}

          {/* Submit feedback */}
          {submitMessage && (
            <div
              className={`rounded-md border px-3 py-2 text-sm ${submitMessage.type === 'success'
                ? 'border-success/20 bg-success/10 text-success-foreground'
                : 'border-destructive/20 bg-destructive/10 text-destructive-foreground'
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
                    setSubmitMessage(null)
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
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Savaitė</TableHead>
                  <TableHead className="text-right">Čekių skaičius</TableHead>
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
