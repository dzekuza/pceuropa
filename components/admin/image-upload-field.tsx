'use client'

import { useCallback, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { compressImageFile, imageExtension } from '@/lib/image-compression'
import { resizeSupabaseImage } from '@/lib/utils/supabase-image'

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
}
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

interface ImageUploadFieldProps {
  value: string
  onChange: (url: string) => void
  label?: string
}

export function ImageUploadField({ value, onChange, label }: ImageUploadFieldProps) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const upload = useCallback(async (file: File) => {
    const ext = MIME_TO_EXT[file.type]
    if (!ext) {
      setError('Palaikomi formatai: jpg, png, webp, gif, avif')
      return
    }
    if (file.size > MAX_SIZE) {
      setError('Maksimalus dydis — 10 MB')
      return
    }

    setUploading(true)
    setError(null)

    const compressed = await compressImageFile(file)
    const supabase = createClient()
    const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${imageExtension(compressed)}`

    const { error: uploadError } = await supabase.storage
      .from('marketing-assets')
      .upload(path, compressed, { cacheControl: '31536000', upsert: false, contentType: compressed.type })

    if (uploadError) {
      setError('Įkėlimo klaida. Bandykite dar kartą.')
      console.error('Storage upload error:', uploadError)
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from('marketing-assets').getPublicUrl(path)
    onChange(data.publicUrl)
    setUploading(false)
  }, [onChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) upload(file)
  }, [upload])

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) upload(file)
  }, [upload])

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }, [onChange])

  const dropZoneClass = [
    'relative overflow-hidden rounded-lg border-2 border-dashed cursor-pointer flex items-center justify-center transition-colors duration-150',
    value ? 'h-[120px] border-transparent' : 'h-[80px]',
    dragging ? 'border-indigo-500 bg-indigo-50' : value ? '' : 'border-gray-300 bg-gray-50 hover:bg-gray-100',
  ].join(' ')

  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-xs font-medium text-gray-700">{label}</span>}

      <div
        className={dropZoneClass}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={resizeSupabaseImage(value, { width: 480, height: 240 })} alt="" className="w-full h-full object-cover block" />
            <div
              className={[
                'absolute inset-0 bg-black/45 flex items-center justify-center gap-3 transition-opacity duration-150',
                hovering ? 'opacity-100' : 'opacity-0',
              ].join(' ')}
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
            >
              <span className="text-white text-xs font-medium">
                {uploading ? 'Įkeliama…' : 'Keisti nuotrauką'}
              </span>
              {!uploading && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="text-white text-xs font-medium underline underline-offset-2 hover:text-red-300"
                >
                  Pašalinti
                </button>
              )}
            </div>
          </>
        ) : (
          <span className={['text-xs text-center px-3', uploading ? 'text-indigo-500' : 'text-gray-400'].join(' ')}>
            {uploading ? 'Įkeliama…' : 'Vilkite arba spustelėkite'}
          </span>
        )}
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://..."
        className="text-[11px] px-2 py-1 rounded border border-gray-200 text-gray-500 bg-white w-full"
      />

      {error && <span className="text-[11px] text-red-500">{error}</span>}

      <input
        ref={inputRef}
        type="file"
        accept={Object.keys(MIME_TO_EXT).join(',')}
        className="hidden"
        onChange={handleFile}
      />
    </div>
  )
}
