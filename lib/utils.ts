import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Converts a store_name to the file prefix used for image matching during import/export.
// "Nike Store" → "nike_store", "ALI ŠOKOLADINĖ" → "ali__okoladin_"
export function toTenantFileKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
}
