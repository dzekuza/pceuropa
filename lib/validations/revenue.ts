// lib/validations/revenue.ts — Zod schema for weekly revenue submission form
// Seller enters per-week Pirkimų skaičius + Apyvarta be PVM for weeks I–V
// Totals (amount_eur, tx_count) are auto-calculated server-side
import { z } from 'zod'

const weekSchema = z.object({
  tx_count: z.string().refine(
    (v) => v === '' || (!isNaN(parseInt(v)) && parseInt(v) >= 0),
    'Turi būti teigiamas skaičius'
  ),
  amount_eur: z.string().refine(
    (v) => v === '' || (!isNaN(parseFloat(v)) && parseFloat(v) >= 0),
    'Turi būti teigiamas skaičius'
  ),
})

export const revenueFormSchema = z.object({
  month: z.string().min(1, 'Pasirinkite mėnesį'),
  weeks: z.tuple([weekSchema, weekSchema, weekSchema, weekSchema, weekSchema]),
  submitted_by: z.string().min(1, 'Įveskite vardą ir pavardę'),
})

export type RevenueFormValues = z.infer<typeof revenueFormSchema>
