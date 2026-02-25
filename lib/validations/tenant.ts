// lib/validations/tenant.ts — Zod schema for tenant form
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
  space_m2: z.coerce
    .number()
    .positive('Plotas turi būti teigiamas skaičius'),
  rent_eur: z.coerce
    .number()
    .positive('Nuomos kaina turi būti teigiamas skaičius'),
})

export type TenantFormValues = z.infer<typeof tenantSchema>
