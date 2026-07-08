import { z } from 'zod'

export const PROMO_CATEGORIES = ['stores', 'services', 'food'] as const
export type PromoCategory = (typeof PROMO_CATEGORIES)[number]

export const promoFormSchema = z
  .object({
    title: z.string().min(3, 'Pavadinimas per trumpas'),
    slug: z.string().min(3, 'Nuoroda per trumpa').regex(/^[a-z0-9-]+$/, 'Tik mažosios raidės, skaičiai ir brūkšneliai'),
    content: z.string().default(''),
    image: z.string().nullable().default(null),
    starts_at: z.string().min(1, 'Nurodykite pradžios datą'),
    ends_at: z.string().min(1, 'Nurodykite pabaigos datą'),
    category: z.enum(PROMO_CATEGORIES),
    published: z.boolean().default(false),
  })
  .refine((v) => v.ends_at >= v.starts_at, {
    message: 'Pabaigos data turi būti po pradžios datos',
    path: ['ends_at'],
  })

export type PromoFormValues = z.infer<typeof promoFormSchema>
