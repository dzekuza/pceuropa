// lib/strings.ts — Lithuanian UI string constants
// All visible UI strings are defined here to ensure consistency and avoid scattered literals.
// SHLL-04: Lithuanian labels throughout all UI elements

export const ADMIN_NAV_ITEMS = [
  { label: 'Pagrindinis', href: '/admin', icon: 'Home' },
  { label: 'Nuomininkai', href: '/admin/tenants', icon: 'Building2' },
  { label: 'Analitika', href: '/admin/analytics', icon: 'BarChart2' },
  { label: 'DUK', href: '/admin/faq', icon: 'HelpCircle' },
] as const

export const SELLER_NAV_ITEMS = [
  { label: 'Apyvarta', href: '/seller/revenue', icon: 'TrendingUp' },
  { label: 'Analitika', href: '/seller/analytics', icon: 'BarChart2' },
  { label: 'DUK', href: '/seller/faq', icon: 'HelpCircle' },
] as const

export const AUTH_STRINGS = {
  loginTitle: 'Prisijungti',
  usernameLabel: 'Vartotojo vardas',
  passwordLabel: 'Slaptažodis',
  loginButton: 'Prisijungti',
  loginError: 'Neteisingas vartotojo vardas arba slaptažodis',
  logoutLabel: 'Atsijungti',
} as const

// Domain suffix appended to seller username to construct a Supabase auth email.
// Admin creates seller accounts with email: {username}@pceuropa.lt
// Login form appends this when the entered identifier contains no '@'.
export const SELLER_USERNAME_DOMAIN = '@pceuropa.lt'

export type NavItem = {
  label: string
  href: string
  icon: string
}

export const REVENUE_REMINDER_TITLE = 'Artėja mėnesio pabaiga'

export function revenueReminderBody(daysRemaining: number): string {
  const unit =
    daysRemaining === 1
      ? 'diena'
      : daysRemaining > 1 && daysRemaining < 10
      ? 'dienos'
      : 'dienų'
  return `Liko tik ${daysRemaining} ${unit} iki mėnesio pabaigos. Prašome įsitikinti, kad pateikėte visą reikiamą apyvartos informaciją.`
}
