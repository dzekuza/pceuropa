import { z } from 'zod'

export const ARTICLE_CATEGORIES = ['Naujiena', 'Akcija', 'Renginys'] as const
export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number]

export const articleFormSchema = z.object({
  title: z.string().min(3, 'Pavadinimas per trumpas'),
  slug: z.string().min(3, 'Nuoroda per trumpa').regex(/^[a-z0-9-]+$/, 'Tik mažosios raidės, skaičiai ir brūkšneliai'),
  content: z.string().default(''),
  title_en: z.string().default(''),
  content_en: z.string().default(''),
  cover_image: z.string().nullable().default(null),
  category: z.enum(ARTICLE_CATEGORIES),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
})

export type ArticleFormValues = z.infer<typeof articleFormSchema>
