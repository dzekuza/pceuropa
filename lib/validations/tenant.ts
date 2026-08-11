// lib/validations/tenant.ts — Zod schema for tenant form
// Note: space_m2 and rent_eur are string in the form (HTML inputs return strings).
// Server Actions receive them as numbers after parsing. The schema validates as strings
// to keep react-hook-form types compatible (no transform type mismatch with Zod v4).
import { z } from 'zod'

export const tenantSchema = z.object({
  username: z.string().optional(),
  password: z.string().optional(),
  store_name: z
    .string()
    .min(1, 'Parduotuvės pavadinimas yra privalomas'),
  operator: z.string().optional(),
  company_code: z.string().optional(),
  category: z
    .string()
    .min(1, 'Pasirinkite kategoriją'),
  space_m2: z
    .string()
    .optional()
    .refine((v) => !v || (!isNaN(parseFloat(v)) && parseFloat(v) > 0), {
      message: 'Plotas turi būti teigiamas skaičius',
    }),
  rent_eur: z
    .string()
    .optional()
    .refine((v) => !v || (!isNaN(parseFloat(v)) && parseFloat(v) > 0), {
      message: 'Nuomos kaina turi būti teigiamas skaičius',
    }),
  description: z.string().optional(),
  contact_email: z
    .string()
    .optional()
    .refine((v) => !v || z.string().email().safeParse(v).success, {
      message: 'Neteisingas el. pašto formatas',
    }),
  contact_phone: z.string().optional(),
  logo_url: z.string().optional(),
  gallery_images: z.array(z.string()).optional(),
  weekday_hours: z.string().optional(),
  saturday_hours: z.string().optional(),
  sunday_hours: z.string().optional(),
  is_visible: z.boolean().optional(),
})

export type TenantFormValues = z.infer<typeof tenantSchema>
