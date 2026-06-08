'use client'

import { useCallback, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ImageUploadFieldProps {
  value: string
  onChange: (url: string) => void
  label?: string
}

export function ImageUploadField({ value, onChange, label }: ImageUploadFieldProps) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const upload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Tik nuotraukų failai (jpg, png, webp)')
      return
    }
    setUploading(true)
    setError(null)

    const supabase = createClient()
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('marketing-assets')
      .upload(path, file, { cacheControl: '31536000', upsert: false })

    if (uploadError) {
      setError(uploadError.message)
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <span style={{ fontSize: 12, fontWeight: 500, color: '#374151' }}>{label}</span>
      )}

      {/* Drop zone / preview */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          position: 'relative',
          height: value ? 120 : 80,
          borderRadius: 8,
          border: `2px dashed ${dragging ? '#6366f1' : value ? 'transparent' : '#d1d5db'}`,
          background: dragging ? '#eef2ff' : value ? 'transparent' : '#f9fafb',
          cursor: 'pointer',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'border-color 0.15s, background 0.15s',
        }}
      >
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            {/* Hover overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.45)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.15s',
            }}
              className="img-overlay"
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
            >
              <span style={{ color: '#fff', fontSize: 12, fontWeight: 500 }}>
                {uploading ? 'Įkeliama…' : 'Keisti nuotrauką'}
              </span>
            </div>
          </>
        ) : (
          <span style={{ fontSize: 12, color: uploading ? '#6366f1' : '#9ca3af', textAlign: 'center', padding: '0 12px' }}>
            {uploading ? 'Įkeliama…' : 'Vilkite arba spustelėkite'}
          </span>
        )}
      </div>

      {/* URL text input */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://..."
        style={{
          fontSize: 11,
          padding: '4px 8px',
          borderRadius: 4,
          border: '1px solid #e5e7eb',
          color: '#6b7280',
          background: '#fff',
          width: '100%',
          boxSizing: 'border-box',
        }}
      />

      {error && (
        <span style={{ fontSize: 11, color: '#ef4444' }}>{error}</span>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFile}
      />
    </div>
  )
}
