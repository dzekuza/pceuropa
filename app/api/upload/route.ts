// app/api/upload/route.ts — accepts a single file upload and writes it to
// local disk, replacing the 6 components' direct `supabase.storage.from(...)
// .upload(...)` calls now that Supabase Storage no longer backs uploads.
// File-type and size validation used to live in Supabase Storage bucket
// policies — it now lives here, since there's no Storage layer providing it.
import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { NextResponse } from 'next/server'
import {
  allowedMimeToExt,
  isSafeObjectKey,
  isStorageBucket,
  MAX_UPLOAD_SIZE,
  resolveObjectPath,
  STORAGE_BUCKETS,
} from '@/lib/storage/local-storage'

export async function POST(request: Request) {
  const form = await request.formData()
  const file = form.get('file')
  const bucket = form.get('bucket')
  const folder = form.get('folder')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 })
  }
  if (typeof bucket !== 'string' || !isStorageBucket(bucket)) {
    return NextResponse.json(
      { error: `bucket must be one of: ${STORAGE_BUCKETS.join(', ')}` },
      { status: 400 }
    )
  }
  if (folder !== null && typeof folder === 'string' && !isSafeObjectKey(folder)) {
    return NextResponse.json({ error: 'Invalid folder' }, { status: 400 })
  }

  const mimeToExt = allowedMimeToExt(bucket)
  const ext = mimeToExt[file.type]
  if (!ext) {
    return NextResponse.json(
      { error: `Unsupported file type: ${file.type}. Allowed: ${Object.keys(mimeToExt).join(', ')}` },
      { status: 400 }
    )
  }
  if (file.size > MAX_UPLOAD_SIZE) {
    return NextResponse.json(
      { error: `File too large (max ${MAX_UPLOAD_SIZE / (1024 * 1024)} MB)` },
      { status: 413 }
    )
  }

  const key = folder ? `${folder}/${randomUUID()}.${ext}` : `${randomUUID()}.${ext}`
  const destination = resolveObjectPath(bucket, key)

  await mkdir(path.dirname(destination), { recursive: true })
  await writeFile(destination, Buffer.from(await file.arrayBuffer()))

  return NextResponse.json({ url: `/api/storage/${bucket}/${key}` }, { status: 201 })
}
