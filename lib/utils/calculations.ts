// lib/utils/calculations.ts — Pure calculation functions for tenant revenue metrics
// All functions guard against division by zero and null/undefined inputs

/**
 * P.K (Plotas/Kaina) — Rent per square meter
 * Constant per tenant — does not vary by month
 */
export function calculatePK(
  rentEur: number | null,
  spaceM2: number | null
): number | null {
  if (rentEur == null || spaceM2 == null || spaceM2 === 0) return null
  return rentEur / spaceM2
}

/**
 * Apyvarta/m² — Revenue per square meter
 * Per-month calculation based on reported amount
 */
export function calculateApyvartaPerM2(
  amountEur: number,
  spaceM2: number | null
): number | null {
  if (spaceM2 == null || spaceM2 === 0) return null
  return amountEur / spaceM2
}

/**
 * Efektyvumas — Revenue efficiency as a percentage of rent
 * Per-month: how much the tenant's revenue covers their rent obligation
 */
export function calculateEfektyvumas(
  amountEur: number,
  rentEur: number | null
): number | null {
  if (rentEur == null || rentEur === 0) return null
  return (amountEur / rentEur) * 100
}

/**
 * Year-over-year change as a percentage: (current - previous) / previous * 100.
 * Returns null when a comparison isn't meaningful (missing data or zero base),
 * e.g. same month last year had no submission.
 */
export function calculateYoYPercent(
  current: number | null,
  previous: number | null
): number | null {
  if (current == null || previous == null || previous === 0) return null
  return ((current - previous) / previous) * 100
}
