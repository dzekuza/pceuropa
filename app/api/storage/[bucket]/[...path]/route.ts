// app/api/storage/[bucket]/[...path]/route.ts — serves files written by
// app/api/upload from local disk, optionally resizing images on the fly via
// sharp. Replaces Supabase Storage's public object endpoint and its
// render/image transform endpoint (see lib/storage/resize-image.ts, the
// drop-in replacement for lib/utils/supabase-image.ts).
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { NextResponse } from 'next/server'
import sharp from 'sharp'
import {
  getStorageRoot,
  isSafeObjectKey,
  isStorageBucket,
} from '@/lib/storage/local-storage'

const EXT_CONTENT_TYPE: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  avif: 'image/avif',
  pdf: 'application/pdf',
  svg: 'image/svg+xml',
}

interface RouteParams {
  params: Promise<{ bucket: string; path: string[] }>
}

export async function GET(request: Request, { params }: RouteParams) {
  const { bucket, path: pathSegments } = await params

  if (!isStorageBucket(bucket) || !pathSegments.every(isSafeObjectKey)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const key = pathSegments.join('/')
  const filePath = path.join(getStorageRoot(), bucket, key)
  const ext = key.split('.').pop()?.toLowerCase() ?? ''
  const contentType = EXT_CONTENT_TYPE[ext]

  if (!contentType) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  let buffer: Buffer
  try {
    buffer = await readFile(filePath)
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { searchParams } = new URL(request.url)
  const width = searchParams.get('width')
  const height = searchParams.get('height')

  // Resize is raster-image-only — PDFs, SVGs (which scale natively via
  // width/height attributes), and requests with no width/height pass
  // through as the original file.
  if (contentType.startsWith('image/') && ext !== 'svg' && width && height) {
    const quality = Number(searchParams.get('quality') ?? 85)
    const fit = searchParams.get('fit') === 'contain' ? 'contain' : 'cover'

    let pipeline = sharp(buffer).resize(Number(width), Number(height), { fit })
    // Re-encode in the source format so output content-type stays accurate;
    // gif has no sharp quality knob so it passes through resize only.
    if (ext === 'jpg' || ext === 'jpeg') pipeline = pipeline.jpeg({ quality })
    else if (ext === 'png') pipeline = pipeline.png({ quality })
    else if (ext === 'webp') pipeline = pipeline.webp({ quality })
    else if (ext === 'avif') pipeline = pipeline.avif({ quality })

    const resized = await pipeline.toBuffer()

    return new NextResponse(new Uint8Array(resized), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  }

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
