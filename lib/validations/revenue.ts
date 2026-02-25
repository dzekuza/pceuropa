// lib/validations/revenue.ts — Zod schema for revenue submission form
// Note: amount_eur and tx_count are strings in the form (HTML inputs return strings).
// Server Action parses them to float/int. Pattern mirrors tenant.ts for consistency.
import { z } from 'zod'

export const revenueFormSchema = z.object({
  month: z.string().min(1, 'Pasirinkite mėnesį'),
  amount_eur: z
    .string()
    .refine(
      (v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 0,
      'Apyvarta turi būti teigiamas skaičius'
    ),
  tx_count: z
    .string()
    .refine(
      (v) => !isNaN(parseInt(v)) && parseInt(v) >= 0,
      'Pirkimų skaičius turi būti teigiamas'
    ),
})

export type RevenueFormValues = z.infer<typeof revenueFormSchema>
