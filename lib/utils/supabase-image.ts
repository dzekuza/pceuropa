// lib/utils/supabase-image.ts — resize images served from Supabase Storage
// using its built-in image transformation endpoint, instead of shipping the
// original full-resolution file to every avatar/thumbnail that renders it.
const OBJECT_PREFIX = '/storage/v1/object/public/'
const RENDER_PREFIX = '/storage/v1/render/image/public/'

// Base URL for public Storage objects. Derived from the env var so assets
// follow whichever Supabase instance the app points at — never hardcode the
// project URL at call sites (see CLAUDE.md).
export const STORAGE_PUBLIC_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public`

interface ResizeOptions {
  width: number
  height: number
  quality?: number
  // 'cover' crops to exactly fill width×height (matches CSS object-cover).
  // 'contain' scales down to fit within width×height without cropping or
  // distorting (matches CSS object-contain) — Supabase does NOT preserve
  // aspect ratio when only one dimension is given, so both are required.
  fit?: 'cover' | 'contain'
}

// No-op for anything that isn't a Supabase Storage public object URL
// (local assets, blob: previews mid-upload, other hosts) — safe to call
// unconditionally at every image call site.
export function resizeSupabaseImage(
  url: string | null | undefined,
  { width, height, quality = 85, fit = 'cover' }: ResizeOptions
): string {
  if (!url || !url.includes(OBJECT_PREFIX)) return url ?? ''

  const params = new URLSearchParams({
    width: String(width),
    height: String(height),
    resize: fit,
    quality: String(quality),
  })

  return `${url.replace(OBJECT_PREFIX, RENDER_PREFIX)}?${params.toString()}`
}
