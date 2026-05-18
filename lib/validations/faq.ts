// lib/validations/faq.ts — Zod schema for FAQ form
import { z } from 'zod'

export const faqFormSchema = z.object({
  question: z.string().min(3, 'Klausimas per trumpas'),
  answer: z.string().min(3, 'Atsakymas per trumpas'),
})

export type FaqFormValues = z.infer<typeof faqFormSchema>
