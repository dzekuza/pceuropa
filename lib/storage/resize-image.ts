// lib/storage/resize-image.ts — resize images served from local-disk storage
// via our own on-demand resize endpoint (app/api/storage/[bucket]/[...path]),
// replacing Supabase Storage's render/image transform endpoint now that
// Storage no longer backs uploads. Drop-in replacement for
// lib/utils/supabase-image.ts's resizeSupabaseImage — same call signature,
// so call sites only need an import swap (Phase 5).
const STORAGE_PREFIX = '/api/storage/'

interface ResizeOptions {
  width: number
  height: number
  quality?: number
  // 'cover' crops to exactly fill width×height (matches CSS object-cover).
  // 'contain' scales down to fit within width×height without cropping or
  // distorting (matches CSS object-contain) — same semantics as the old
  // Supabase-backed helper, now implemented with sharp in the route handler.
  fit?: 'cover' | 'contain'
}

// No-op for anything that isn't one of our own local-disk storage URLs
// (external assets, blob: previews mid-upload, other hosts) — safe to call
// unconditionally at every image call site, same contract as the old
// resizeSupabaseImage.
export function resizeImage(
  url: string | null | undefined,
  { width, height, quality = 85, fit = 'cover' }: ResizeOptions
): string {
  if (!url || !url.includes(STORAGE_PREFIX)) return url ?? ''

  const [path, existingQuery] = url.split('?')
  const params = new URLSearchParams(existingQuery)
  params.set('width', String(width))
  params.set('height', String(height))
  params.set('fit', fit)
  params.set('quality', String(quality))

  return `${path}?${params.toString()}`
}
