// lib/validations/faq.ts — Zod schema for FAQ form
import { z } from 'zod'

export const faqFormSchema = z.object({
  question: z.string().min(3, 'Klausimas per trumpas'),
  answer: z.string().min(3, 'Atsakymas per trumpas'),
  question_en: z.string().default(''),
  answer_en: z.string().default(''),
  attachments: z.array(z.string()),
})

export type FaqFormValues = z.infer<typeof faqFormSchema>
