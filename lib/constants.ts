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
