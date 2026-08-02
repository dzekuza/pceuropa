import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
})

const outDir = join(process.cwd(), 'storage_backup')

async function listAllObjects(bucket, prefix = '') {
  const results = []
  const { data, error } = await supabase.storage.from(bucket).list(prefix, {
    limit: 1000,
    sortBy: { column: 'name', order: 'asc' },
  })
  if (error) throw error
  for (const entry of data) {
    const path = prefix ? `${prefix}/${entry.name}` : entry.name
    if (entry.id === null) {
      const nested = await listAllObjects(bucket, path)
      results.push(...nested)
    } else {
      results.push(path)
    }
  }
  return results
}

async function downloadObject(bucket, path) {
  const { data, error } = await supabase.storage.from(bucket).download(path)
  if (error) throw error
  const destPath = join(outDir, bucket, path)
  await mkdir(dirname(destPath), { recursive: true })
  const buffer = Buffer.from(await data.arrayBuffer())
  await writeFile(destPath, buffer)
  return buffer.length
}

async function main() {
  const { data: buckets, error } = await supabase.storage.listBuckets()
  if (error) throw error

  console.log(`Found ${buckets.length} bucket(s): ${buckets.map((b) => b.name).join(', ')}`)

  let totalFiles = 0
  let totalBytes = 0
  let failures = []

  for (const bucket of buckets) {
    console.log(`\nBucket: ${bucket.name}`)
    const objects = await listAllObjects(bucket.name)
    console.log(`  ${objects.length} object(s) to download`)

    for (const [i, path] of objects.entries()) {
      try {
        const size = await downloadObject(bucket.name, path)
        totalFiles++
        totalBytes += size
        if ((i + 1) % 25 === 0 || i === objects.length - 1) {
          console.log(`  [${bucket.name}] ${i + 1}/${objects.length}`)
        }
      } catch (err) {
        failures.push({ bucket: bucket.name, path, error: err.message })
        console.error(`  FAILED: ${bucket.name}/${path} — ${err.message}`)
      }
    }
  }

  console.log(`\nDone. ${totalFiles} files, ${(totalBytes / 1024 / 1024).toFixed(2)} MB written to ${outDir}`)
  if (failures.length) {
    console.log(`${failures.length} failure(s):`)
    for (const f of failures) console.log(`  ${f.bucket}/${f.path}: ${f.error}`)
    await writeFile(join(outDir, '_failures.json'), JSON.stringify(failures, null, 2))
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
