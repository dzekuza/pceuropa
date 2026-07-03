// lib/constants.ts — Lithuanian constants shared across components

// Cookie set once a visitor unlocks the under-construction gate on public pages.
export const SITE_LOCK_COOKIE = 'pce_site_unlocked'

export const TENANT_CATEGORIES = [
  'Mada ir apranga',
  'Maistas ir restoranai',
  'Elektronika',
  'Sportas ir laisvalaikis',
  'Grožis ir sveikata',
  'Namų apyvoka',
  'Žaislai ir vaikų prekės',
  'Juvelyrika ir aksesuarai',
  'Paslaugos',
  'Kita',
] as const

export type TenantCategory = (typeof TENANT_CATEGORIES)[number]

// Maps legacy all-caps / alternate-spelling category values to canonical TENANT_CATEGORIES
const CATEGORY_ALIASES: Record<string, TenantCategory> = {
  'DRABUŽIAI': 'Mada ir apranga',
  'Mada': 'Mada ir apranga',
  'KAVINĖS/RESTORANAI': 'Maistas ir restoranai',
  'Kavinės': 'Maistas ir restoranai',
  'Restoranai': 'Maistas ir restoranai',
  'Maistas': 'Maistas ir restoranai',
  'MAISTO IR GĖRIMŲ PARDUOTUVĖS': 'Maistas ir restoranai',
  'LAISVALAIKIS IR PRAMOGOS': 'Sportas ir laisvalaikis',
  'SPORTAS IR SVEIKATINGUMAS': 'Sportas ir laisvalaikis',
  'Sportas': 'Sportas ir laisvalaikis',
  'GROŽIS IR SVEIKATA': 'Grožis ir sveikata',
  'VAISTINĖS OPTIKA': 'Grožis ir sveikata',
  'JUVELYRIKA IR AKSESUARAI': 'Juvelyrika ir aksesuarai',
  'ŽAISLAI IR VAIKŲ PREKĖS': 'Žaislai ir vaikų prekės',
  'PASLAUGOS': 'Paslaugos',
  'ELEKTRONIKA': 'Elektronika',
  'NAMŲ APYVOKA': 'Namų apyvoka',
}

export function normalizeCategory(raw: string | null | undefined): TenantCategory {
  if (!raw) return 'Kita'
  const canonical = TENANT_CATEGORIES.find((c) => c === raw)
  if (canonical) return canonical
  return CATEGORY_ALIASES[raw] ?? 'Kita'
}

export const MONTHS_LT = [
  'Sausis',
  'Vasaris',
  'Kovas',
  'Balandis',
  'Gegužė',
  'Birželis',
  'Liepa',
  'Rugpjūtis',
  'Rugsėjis',
  'Spalis',
  'Lapkritis',
  'Gruodis',
] as const
