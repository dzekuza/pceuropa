'use client'
// components/revenue/revenue-form.tsx — Revenue submission form
// Handles month selection, pre-fill for existing entries, and upsert via Server Action
import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
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

function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
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

  const form = useForm<RevenueFormValues>({
    resolver: zodResolver(revenueFormSchema),
    defaultValues: {
      month: selectedMonth,
      amount_eur: existingReport ? String(existingReport.amount_eur) : '',
      tx_count: existingReport?.tx_count != null ? String(existingReport.tx_count) : '',
    },
  })

  // Re-sync form values when selectedMonth or reports change
  useEffect(() => {
    const existing = reports.find((r) => r.month.startsWith(selectedMonth))
    form.reset({
      month: selectedMonth,
      amount_eur: existing ? String(existing.amount_eur) : '',
      tx_count: existing?.tx_count != null ? String(existing.tx_count) : '',
    })
    setSubmitMessage(null)
  }, [selectedMonth, reports, form])

  function handleMonthChange(value: string) {
    onSelectMonth(value)
  }

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
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
                <FormLabel>Mėnuo</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value)
                    handleMonthChange(value)
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
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

          {/* Apyvarta (EUR) */}
          <FormField
            control={form.control}
            name="amount_eur"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apyvarta (EUR)</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Pirkimų sk. */}
          <FormField
            control={form.control}
            name="tx_count"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pirkimų sk.</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isPending} className="mt-2">
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
