import { z } from 'zod'

export const customPageFormSchema = z.object({
  title: z.string().min(3, 'Pavadinimas per trumpas'),
  slug: z.string().min(3, 'Nuoroda per trumpa').regex(/^[a-z0-9-]+$/, 'Tik mažosios raidės, skaičiai ir brūkšneliai'),
  content: z.string().default(''),
  title_en: z.string().default(''),
  content_en: z.string().default(''),
  cover_image: z.string().nullable().default(null),
  published: z.boolean().default(false),
})

export type CustomPageFormValues = z.infer<typeof customPageFormSchema>
