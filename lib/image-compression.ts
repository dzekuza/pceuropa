import imageCompression from 'browser-image-compression'

const COMPRESSIBLE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])

const MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
}

/**
 * Resizes and re-encodes an image to WebP client-side before upload.
 * GIFs are skipped to preserve animation; non-image files pass through unchanged.
 */
export async function compressImageFile(file: File): Promise<File> {
  if (!COMPRESSIBLE_TYPES.has(file.type)) return file

  try {
    return await imageCompression(file, {
      maxSizeMB: 2,
      maxWidthOrHeight: 1920,
      initialQuality: 0.9,
      fileType: 'image/webp',
      useWebWorker: true,
    })
  } catch (err) {
    console.error('Image compression failed, uploading original:', err)
    return file
  }
}

/** Extension matching the file's current MIME type, falling back to its filename. */
export function imageExtension(file: File): string {
  return MIME_EXTENSIONS[file.type] ?? file.name.split('.').pop() ?? 'bin'
}
