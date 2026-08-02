'use client'
import { useState, useRef, useTransition, useMemo } from 'react'
import * as XLSX from 'xlsx'
import { FileSpreadsheet, AlertCircle, CheckCircle2, ImageIcon, Images } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { importTenants, type TenantImportRow } from '@/actions/tenants'
import { compressImageFile } from '@/lib/image-compression'
import { cn, toTenantFileKey } from '@/lib/utils'
import { resizeImage } from '@/lib/storage/resize-image'

const HEADER_MAP: Record<string, keyof TenantImportRow> = {
  // exact export column names (English) — reliable for round-trip
  id: 'id',
  store_name: 'store_name',
  operator: 'operator',
  company_code: 'company_code',
  category: 'category',
  space_m2: 'space_m2',
  rent_eur: 'rent_eur',
  description: 'description',
  logo_url: 'logo_url',
  gallery_images: 'gallery_images',
  // export display names (Lithuanian)
  'parduotuvė': 'store_name',
  'plotas (m²)': 'space_m2',
  'nuomos kaina (eur)': 'rent_eur',
  'įmonės kodas': 'company_code',
  'logo url': 'logo_url',
  // aliases
  pavadinimas: 'store_name',
  parduotuve: 'store_name',
  name: 'store_name',
  title: 'store_name',
  operatorius: 'operator',
  'company code': 'company_code',
  'imones kodas': 'company_code',
  kodas: 'company_code',
  kategorija: 'category',
  'space m2': 'space_m2',
  plotas: 'space_m2',
  'm2': 'space_m2',
  'rent eur': 'rent_eur',
  rent: 'rent_eur',
  nuoma: 'rent_eur',
  'nuomos kaina': 'rent_eur',
  'aprašymas': 'description',
  aprasas: 'description',
  'gallery images': 'gallery_images',
}

interface ParsedRow {
  index: number
  data: Partial<TenantImportRow>
  logoFile?: string       // matched key in logoFileMap
  galleryFiles: string[]  // matched keys in galleryFileMap
  valid: boolean
  errors: string[]
}

function stemOf(filename: string): string {
  return filename.toLowerCase().replace(/\.[^.]+$/, '')
}

function buildFileMap(files: File[]): Map<string, File> {
  const map = new Map<string, File>()
  for (const f of files) map.set(f.name.toLowerCase(), f)
  return map
}

// Logo: stem === {file_key}_logo  (e.g., nike_store_logo.jpg)
// Gallery: stem === {file_key}_gallery{N}  (e.g., nike_store_gallery1.jpg)
function matchImages(
  rawRows: ParsedRow[],
  logoMap: Map<string, File>,
  galleryMap: Map<string, File>
): ParsedRow[] {
  const logoKeys = [...logoMap.keys()]
  const galleryKeys = [...galleryMap.keys()]

  return rawRows.map((row) => {
    const name = row.data.store_name
    if (!name) return { ...row, galleryFiles: [] }

    const key = toTenantFileKey(name)

    const logoFile = logoKeys.find((f) => stemOf(f) === `${key}_logo`)

    const galleryFiles = galleryKeys
      .filter((f) => {
        const stem = stemOf(f)
        const suffix = stem.slice(`${key}_gallery`.length)
        return stem.startsWith(`${key}_gallery`) && /^\d+$/.test(suffix)
      })
      .sort((a, b) => stemOf(a).localeCompare(stemOf(b), undefined, { numeric: true }))

    return { ...row, logoFile, galleryFiles }
  })
}

function parseSheet(sheet: XLSX.WorkSheet): ParsedRow[] {
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })
  return json.map((rawRow, idx) => {
    const data: Partial<TenantImportRow> = {}
    for (const [rawKey, rawVal] of Object.entries(rawRow)) {
      const field = HEADER_MAP[rawKey.toLowerCase().trim()]
      if (!field) continue
      if (field === 'id') {
        const str = String(rawVal).trim()
        if (str) data.id = str
      } else if (field === 'space_m2' || field === 'rent_eur') {
        const num = parseFloat(String(rawVal))
        data[field] = isNaN(num) ? undefined : num
      } else if (field === 'gallery_images') {
        const str = String(rawVal).trim()
        data.gallery_images = str ? str.split(',').map((u) => u.trim()).filter(Boolean) : []
      } else {
        const str = String(rawVal).trim()
        if (str) data[field] = str
      }
    }

    const errors: string[] = []
    if (!data.store_name?.trim()) errors.push('Parduotuvės pavadinimas privalomas')
    if (data.space_m2 != null && isNaN(data.space_m2)) errors.push('Plotas turi būti skaičius')
    if (data.rent_eur != null && isNaN(data.rent_eur)) errors.push('Nuomos kaina turi būti skaičius')

    return { index: idx, data, galleryFiles: [], valid: errors.length === 0, errors }
  })
}

async function uploadToStorage(file: File, folder: 'logos' | 'gallery'): Promise<string> {
  const compressed = await compressImageFile(file)
  const formData = new FormData()
  formData.set('file', compressed)
  formData.set('bucket', 'tenant-assets')
  formData.set('folder', folder)

  const res = await fetch('/api/upload', { method: 'POST', body: formData })
  if (!res.ok) throw new Error(`Nepavyko įkelti ${file.name}: ${await res.text()}`)
  const { url } = (await res.json()) as { url: string }
  return url
}

interface TenantImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface DragState {
  csv: boolean
  logo: boolean
  gallery: boolean
}

export function TenantImportDialog({ open, onOpenChange }: TenantImportDialogProps) {
  const [rawRows, setRawRows] = useState<ParsedRow[]>([])
  const [logoFileMap, setLogoFileMap] = useState<Map<string, File>>(new Map())
  const [galleryFileMap, setGalleryFileMap] = useState<Map<string, File>>(new Map())
  const [step, setStep] = useState<'upload' | 'preview' | 'done'>('upload')
  const [fileName, setFileName] = useState('')
  const [result, setResult] = useState<{ imported: number; errors: string[] } | null>(null)
  const [drag, setDrag] = useState<DragState>({ csv: false, logo: false, gallery: false })
  const [isPending, startTransition] = useTransition()

  const csvRef = useRef<HTMLInputElement>(null)
  const logoRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)

  const rows = useMemo(
    () => matchImages(rawRows, logoFileMap, galleryFileMap),
    [rawRows, logoFileMap, galleryFileMap]
  )

  function reset() {
    setRawRows([])
    setLogoFileMap(new Map())
    setGalleryFileMap(new Map())
    setStep('upload')
    setFileName('')
    setResult(null)
    if (csvRef.current) csvRef.current.value = ''
    if (logoRef.current) logoRef.current.value = ''
    if (galleryRef.current) galleryRef.current.value = ''
  }

  function handleClose(isOpen: boolean) {
    if (!isOpen) reset()
    onOpenChange(isOpen)
  }

  async function processCSV(file: File) {
    setFileName(file.name)
    const buffer = await file.arrayBuffer()
    const wb = XLSX.read(buffer, { type: 'array' })
    const parsed = parseSheet(wb.Sheets[wb.SheetNames[0]])
    setRawRows(parsed)
    setStep('preview')
  }

  function addLogoFiles(files: FileList | File[]) {
    const next = new Map(logoFileMap)
    for (const f of Array.from(files)) next.set(f.name.toLowerCase(), f)
    setLogoFileMap(next)
  }

  function addGalleryFiles(files: FileList | File[]) {
    const next = new Map(galleryFileMap)
    for (const f of Array.from(files)) next.set(f.name.toLowerCase(), f)
    setGalleryFileMap(next)
  }

  function handleDropCSV(e: React.DragEvent) {
    e.preventDefault()
    setDrag((d) => ({ ...d, csv: false }))
    const file = Array.from(e.dataTransfer.files).find((f) => /\.(csv|xlsx|xls)$/i.test(f.name))
    if (file) processCSV(file)
  }

  function handleDropLogo(e: React.DragEvent) {
    e.preventDefault()
    setDrag((d) => ({ ...d, logo: false }))
    const imgs = Array.from(e.dataTransfer.files).filter((f) => /\.(jpe?g|png|webp|gif|avif|svg)$/i.test(f.name))
    if (imgs.length) addLogoFiles(imgs)
  }

  function handleDropGallery(e: React.DragEvent) {
    e.preventDefault()
    setDrag((d) => ({ ...d, gallery: false }))
    const imgs = Array.from(e.dataTransfer.files).filter((f) => /\.(jpe?g|png|webp|gif|avif|svg)$/i.test(f.name))
    if (imgs.length) addGalleryFiles(imgs)
  }

  function handleImport() {
    const validRows = rows.filter((r) => r.valid)
    startTransition(async () => {
      const uploadErrors: string[] = []
      const resolved: TenantImportRow[] = await Promise.all(
        validRows.map(async (row) => {
          const data: TenantImportRow = { ...(row.data as TenantImportRow) }

          if (row.logoFile) {
            const file = logoFileMap.get(row.logoFile)
            if (file) {
              try { data.logo_url = await uploadToStorage(file, 'logos') }
              catch (err) { uploadErrors.push(err instanceof Error ? err.message : String(err)) }
            }
          }

          const galleryUrls: string[] = [...(data.gallery_images ?? [])]
          for (const filename of row.galleryFiles) {
            const file = galleryFileMap.get(filename)
            if (file) {
              try { galleryUrls.push(await uploadToStorage(file, 'gallery')) }
              catch (err) { uploadErrors.push(err instanceof Error ? err.message : String(err)) }
            }
          }
          if (galleryUrls.length) data.gallery_images = galleryUrls

          return data
        })
      )

      const res = await importTenants(resolved)
      setResult({ imported: res.imported, errors: [...uploadErrors, ...res.errors] })
      setStep('done')
    })
  }

  const validCount = rows.filter((r) => r.valid).length
  const invalidCount = rows.filter((r) => !r.valid).length
  const updateCount = rows.filter((r) => r.valid && r.data.id).length
  const createCount = rows.filter((r) => r.valid && !r.data.id).length
  const logoCount = logoFileMap.size
  const galleryCount = galleryFileMap.size
  const matchedLogos = rows.filter((r) => r.logoFile).length
  const matchedGallery = rows.filter((r) => r.galleryFiles.length > 0).length

  // Shared zone classes
  const zoneBase = 'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 cursor-pointer transition-colors select-none text-center'
  const zoneIdle = 'border-muted-foreground/25 hover:border-primary/50'
  const zoneActive = 'border-primary bg-primary/5'

  const imageZones = (compact = false) => (
    <div className={cn('grid grid-cols-2 gap-3', compact && 'mt-1')}>
      {/* Logo zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Įkelti logotipus"
        className={cn(zoneBase, drag.logo ? zoneActive : zoneIdle, compact && 'py-3')}
        onClick={() => logoRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && logoRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag((d) => ({ ...d, logo: true })) }}
        onDragLeave={() => setDrag((d) => ({ ...d, logo: false }))}
        onDrop={handleDropLogo}
      >
        <ImageIcon className={cn('text-muted-foreground', compact ? 'size-5' : 'size-7')} />
        <div>
          <p className={cn('font-medium', compact ? 'text-xs' : 'text-sm')}>Logotipai</p>
          <p className="text-xs text-muted-foreground">
            {logoCount > 0
              ? <span className="text-green-600">{logoCount} failų · {matchedLogos} sutapo</span>
              : <>{compact ? 'Vilkite' : 'Vilkite logotipų failus čia'}<br /><code className="text-[10px]">{'{file_key}_logo.jpg'}</code></>
            }
          </p>
        </div>
        <input ref={logoRef} type="file" accept="image/*" multiple className="hidden"
          onChange={(e) => { if (e.target.files?.length) addLogoFiles(e.target.files) }} />
      </div>

      {/* Gallery zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Įkelti galerijos nuotraukas"
        className={cn(zoneBase, drag.gallery ? zoneActive : zoneIdle, compact && 'py-3')}
        onClick={() => galleryRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && galleryRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag((d) => ({ ...d, gallery: true })) }}
        onDragLeave={() => setDrag((d) => ({ ...d, gallery: false }))}
        onDrop={handleDropGallery}
      >
        <Images className={cn('text-muted-foreground', compact ? 'size-5' : 'size-7')} />
        <div>
          <p className={cn('font-medium', compact ? 'text-xs' : 'text-sm')}>Galerija</p>
          <p className="text-xs text-muted-foreground">
            {galleryCount > 0
              ? <span className="text-green-600">{galleryCount} failų · {matchedGallery} nuomininkų</span>
              : <>{compact ? 'Vilkite' : 'Vilkite galerijos failus čia'}<br /><code className="text-[10px]">{'{file_key}_gallery1.jpg, _gallery2.jpg…'}</code></>
            }
          </p>
        </div>
        <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden"
          onChange={(e) => { if (e.target.files?.length) addGalleryFiles(e.target.files) }} />
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importuoti nuomininkus</DialogTitle>
          <DialogDescription>
            Įkelkite CSV ir nuotraukų failus. Nuotraukų pavadinimai:{' '}
            <code className="font-mono text-xs">file_key_logo.jpg</code> (logotipas),{' '}
            <code className="font-mono text-xs">file_key_gallery1.jpg</code>,{' '}
            <code className="font-mono text-xs">file_key_gallery2.jpg</code>… (galerija).{' '}
            Kolona <code className="font-mono text-xs">file_key</code> matoma eksportuotame CSV.
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div className="flex flex-col gap-3">
            {/* CSV zone */}
            <div
              role="button"
              tabIndex={0}
              aria-label="Pasirinkti CSV failą"
              className={cn(zoneBase, drag.csv ? zoneActive : zoneIdle, 'p-6')}
              onClick={() => csvRef.current?.click()}
              onKeyDown={(e) => e.key === 'Enter' && csvRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDrag((d) => ({ ...d, csv: true })) }}
              onDragLeave={() => setDrag((d) => ({ ...d, csv: false }))}
              onDrop={handleDropCSV}
            >
              <FileSpreadsheet className="size-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Vilkite CSV arba Excel failą čia</p>
                <p className="text-xs text-muted-foreground mt-0.5">CSV, XLSX, XLS</p>
              </div>
              <input ref={csvRef} type="file" accept=".csv,.xlsx,.xls" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) processCSV(f) }} />
            </div>

            {imageZones()}
          </div>
        )}

        {step === 'preview' && (
          <div className="flex flex-col gap-3 min-w-0 overflow-hidden">
            <div className="flex items-center justify-between text-sm flex-wrap gap-2">
              <span className="text-muted-foreground">
                <span className="font-medium text-foreground">{fileName}</span>
              </span>
              <div className="flex items-center gap-3">
                {updateCount > 0 && (
                  <span className="flex items-center gap-1 text-blue-600 text-xs">
                    <CheckCircle2 className="size-3.5" />{updateCount} atnaujinti
                  </span>
                )}
                {createCount > 0 && (
                  <span className="flex items-center gap-1 text-green-600 text-xs">
                    <CheckCircle2 className="size-3.5" />{createCount} nauji
                  </span>
                )}
                {invalidCount > 0 && (
                  <span className="flex items-center gap-1 text-destructive text-xs">
                    <AlertCircle className="size-3.5" />{invalidCount} su klaidomis
                  </span>
                )}
              </div>
            </div>

            <div className="h-52 min-w-0 overflow-auto rounded-md border">
              <table className="w-full min-w-[1100px] text-xs">
                <thead className="sticky top-0 z-10 bg-muted">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground w-8">#</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Parduotuvė</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Operatorius</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Kategorija</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Plotas</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Nuoma</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Įm. kodas</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Aprašymas</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Logo</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Galerija</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Veiksmas</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Statusas</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const logoFile = row.logoFile ? logoFileMap.get(row.logoFile) : undefined
                    const logoPreview = logoFile
                      ? URL.createObjectURL(logoFile)
                      : row.data.logo_url ?? undefined
                    const galleryTotal = row.galleryFiles.length + (row.data.gallery_images?.length ?? 0)

                    return (
                      <tr key={row.index} className={cn('border-t', row.valid ? 'hover:bg-muted/50' : 'bg-destructive/5')}>
                        <td className="px-3 py-2 text-muted-foreground">{row.index + 1}</td>
                        <td className="px-3 py-2 font-medium">{row.data.store_name ?? '—'}</td>
                        <td className="px-3 py-2 text-muted-foreground">{row.data.operator ?? '—'}</td>
                        <td className="px-3 py-2">{row.data.category ?? '—'}</td>
                        <td className="px-3 py-2">{row.data.space_m2 ?? '—'}</td>
                        <td className="px-3 py-2">{row.data.rent_eur ?? '—'}</td>
                        <td className="px-3 py-2">{row.data.company_code ?? '—'}</td>
                        <td className="px-3 py-2 max-w-[120px] truncate" title={row.data.description ?? undefined}>
                          {row.data.description ?? '—'}
                        </td>
                        <td className="px-3 py-2">
                          {logoPreview
                            ? <img src={resizeImage(logoPreview, { width: 48, height: 48 })} alt="" className="size-6 rounded object-cover" title={row.logoFile ?? row.data.logo_url ?? undefined} />
                            : '—'}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {galleryTotal > 0 ? `${galleryTotal} nuotr.` : '—'}
                        </td>
                        <td className="px-3 py-2">
                          {row.data.id
                            ? <span className="text-blue-600 font-medium">Atnaujinti</span>
                            : <span className="text-green-600 font-medium">Sukurti</span>}
                        </td>
                        <td className="px-3 py-2">
                          {row.valid
                            ? <span className="text-green-600">✓</span>
                            : <span className="text-destructive" title={row.errors.join(', ')}>✗ {row.errors[0]}</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {imageZones(true)}

            <p className="text-xs text-muted-foreground">
              Importuoti nuomininkai neturės prisijungimo paskyros. Ją galėsite sukurti atskirai.
            </p>
          </div>
        )}

        {step === 'done' && result && (
          <div className="flex flex-col items-center gap-4 py-6">
            {result.imported > 0
              ? <CheckCircle2 className="size-12 text-green-500" />
              : <AlertCircle className="size-12 text-destructive" />}
            <div className="text-center">
              <p className="text-base font-medium">
                {result.imported > 0
                  ? `Sėkmingai importuota ${result.imported} nuomininkų`
                  : 'Nepavyko importuoti'}
              </p>
              {result.errors.length > 0 && (
                <ul className="mt-2 text-sm text-destructive text-left space-y-1">
                  {result.errors.map((err, i) => <li key={i}>• {err}</li>)}
                </ul>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          {step === 'upload' && (
            <Button variant="outline" onClick={() => handleClose(false)}>Atšaukti</Button>
          )}
          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={reset}>Pasirinkti kitą failą</Button>
              <Button disabled={validCount === 0 || isPending} onClick={handleImport}>
                {isPending ? 'Importuojama...' : `Importuoti ${validCount} eilučių`}
              </Button>
            </>
          )}
          {step === 'done' && (
            <>
              {result && result.imported > 0 && (
                <Button variant="outline" onClick={reset}>Importuoti dar</Button>
              )}
              <Button onClick={() => handleClose(false)}>Uždaryti</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
