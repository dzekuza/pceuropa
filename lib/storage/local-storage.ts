// lib/storage/local-storage.ts — shared path/validation config for local-disk
// storage, used by both the upload route (app/api/upload) and the serving/
// resize route (app/api/storage/[bucket]/[...path]). SERVER ONLY.
import path from 'node:path'

// Buckets carried over 1:1 from the Supabase Storage bucket names so that
// existing DB rows' relative keys (e.g. "logos/<uuid>.png") keep resolving
// under the same bucket segment post-migration.
export const STORAGE_BUCKETS = [
  'marketing-assets',
  'tenant-assets',
  'faq-attachments',
] as const
export type StorageBucket = (typeof STORAGE_BUCKETS)[number]

export function isStorageBucket(value: string): value is StorageBucket {
  return (STORAGE_BUCKETS as readonly string[]).includes(value)
}

// Image types accepted across all upload call sites (faq-form-dialog,
// article-form, image-upload-field, tenant-import-dialog, tenant-form-sheet,
// promo-form) — union of their `accept` lists / MIME_TO_EXT maps.
export const IMAGE_MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
}

// faq-form-dialog additionally accepts PDF attachments (ACCEPTED includes
// 'application/pdf') — only the faq-attachments bucket allows this.
export const FAQ_EXTRA_MIME_TO_EXT: Record<string, string> = {
  'application/pdf': 'pdf',
}

export function allowedMimeToExt(bucket: StorageBucket): Record<string, string> {
  return bucket === 'faq-attachments'
    ? { ...IMAGE_MIME_TO_EXT, ...FAQ_EXTRA_MIME_TO_EXT }
    : IMAGE_MIME_TO_EXT
}

// 10 MB — the cap already enforced client-side in faq-form-dialog and
// image-upload-field; applied uniformly here since this is now the only
// enforcement point (it used to also live in Supabase Storage bucket policy).
export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024

// Root directory files are written to/read from. Defaults to a repo-relative
// path for local dev; production sets STORAGE_ROOT to a volume-mounted path
// outside the app directory (see lib/storage/MIGRATION_NOTES.md) so uploads
// survive redeploys/container recreation.
export function getStorageRoot(): string {
  return process.env.STORAGE_ROOT ?? path.join(process.cwd(), '.data', 'uploads')
}

// Rejects path traversal / absolute-path segments — object keys are built
// server-side (random name) but folder segments may be client-supplied.
export function isSafeObjectKey(key: string): boolean {
  if (!key || key.startsWith('/') || key.includes('..')) return false
  return key.split('/').every((segment) => /^[a-zA-Z0-9._-]+$/.test(segment))
}

export function resolveObjectPath(bucket: StorageBucket, key: string): string {
  return path.join(getStorageRoot(), bucket, key)
}
