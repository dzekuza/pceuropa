// lib/validations/tenant.ts — Zod schema for tenant form
// Note: space_m2 and rent_eur are string in the form (HTML inputs return strings).
// Server Actions receive them as numbers after parsing. The schema validates as strings
// to keep react-hook-form types compatible (no transform type mismatch with Zod v4).
import { z } from 'zod'

export const tenantSchema = z.object({
  username: z
    .string()
    .min(3, 'Vartotojo vardas turi būti bent 3 simbolių'),
  password: z
    .string()
    .min(6, 'Slaptažodis turi būti bent 6 simbolių'),
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
    .min(1, 'Plotas yra privalomas')
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, {
      message: 'Plotas turi būti teigiamas skaičius',
    }),
  rent_eur: z
    .string()
    .min(1, 'Nuomos kaina yra privaloma')
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, {
      message: 'Nuomos kaina turi būti teigiamas skaičius',
    }),
})

export type TenantFormValues = z.infer<typeof tenantSchema>
