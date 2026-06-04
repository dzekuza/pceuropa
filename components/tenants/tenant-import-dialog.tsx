'use client'
import { useState, useRef, useTransition } from 'react'
import * as XLSX from 'xlsx'
import { FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react'
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
import { cn } from '@/lib/utils'

// Maps lowercase header names from the file to our field keys
const HEADER_MAP: Record<string, keyof TenantImportRow> = {
  id: 'id',
  store_name: 'store_name',
  pavadinimas: 'store_name',
  parduotuve: 'store_name',
  'parduotuvė': 'store_name',
  name: 'store_name',
  title: 'store_name',
  operator: 'operator',
  operatorius: 'operator',
  company_code: 'company_code',
  'company code': 'company_code',
  'imones kodas': 'company_code',
  'įmonės kodas': 'company_code',
  kodas: 'company_code',
  category: 'category',
  kategorija: 'category',
  space_m2: 'space_m2',
  'space m2': 'space_m2',
  'space_m2 (m²)': 'space_m2',
  plotas: 'space_m2',
  'plotas (m²)': 'space_m2',
  'm2': 'space_m2',
  rent_eur: 'rent_eur',
  'rent eur': 'rent_eur',
  'rent_eur (eur)': 'rent_eur',
  rent: 'rent_eur',
  nuoma: 'rent_eur',
  'nuomos kaina': 'rent_eur',
  'nuomos kaina (eur)': 'rent_eur',
  description: 'description',
  'aprašymas': 'description',
  aprasas: 'description',
  logo_url: 'logo_url',
  'logo url': 'logo_url',
  logo: 'logo_url',
}

interface ParsedRow {
  index: number
  data: Partial<TenantImportRow>
  valid: boolean
  errors: string[]
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
      } else {
        const str = String(rawVal).trim()
        if (str) data[field] = str
      }
    }

    const errors: string[] = []
    if (!data.store_name?.trim()) errors.push('Parduotuvės pavadinimas privalomas')
    if (data.space_m2 != null && isNaN(data.space_m2)) errors.push('Plotas turi būti skaičius')
    if (data.rent_eur != null && isNaN(data.rent_eur)) errors.push('Nuomos kaina turi būti skaičius')

    return { index: idx, data, valid: errors.length === 0, errors }
  })
}

interface TenantImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TenantImportDialog({ open, onOpenChange }: TenantImportDialogProps) {
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [step, setStep] = useState<'upload' | 'preview' | 'done'>('upload')
  const [fileName, setFileName] = useState('')
  const [result, setResult] = useState<{ imported: number; errors: string[] } | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  function reset() {
    setRows([])
    setStep('upload')
    setFileName('')
    setResult(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  function handleClose(open: boolean) {
    if (!open) reset()
    onOpenChange(open)
  }

  async function processFile(file: File) {
    setFileName(file.name)
    const buffer = await file.arrayBuffer()
    const wb = XLSX.read(buffer, { type: 'array' })
    const parsed = parseSheet(wb.Sheets[wb.SheetNames[0]])
    setRows(parsed)
    setStep('preview')
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  function handleImport() {
    const validRows = rows.filter((r) => r.valid).map((r) => r.data as TenantImportRow)
    startTransition(async () => {
      const res = await importTenants(validRows)
      setResult(res)
      setStep('done')
    })
  }

  const validCount = rows.filter((r) => r.valid).length
  const invalidCount = rows.filter((r) => !r.valid).length
  const updateCount = rows.filter((r) => r.valid && r.data.id).length
  const createCount = rows.filter((r) => r.valid && !r.data.id).length

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl overflow-auto">
        <DialogHeader>
          <DialogTitle>Importuoti nuomininkus</DialogTitle>
          <DialogDescription>
            Įkelkite CSV arba Excel failą (.csv, .xlsx, .xls) su nuomininkų duomenimis.
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div
            role="button"
            tabIndex={0}
            aria-label="Pasirinkti failą"
            className={cn(
              'flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-10 cursor-pointer transition-colors select-none',
              dragOver
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            )}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <FileSpreadsheet className="size-10 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium">Vilkite failą čia arba spauskite norėdami pasirinkti</p>
              <p className="text-xs text-muted-foreground mt-1">CSV, XLSX, XLS</p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) processFile(file)
              }}
            />
          </div>
        )}

        {step === 'preview' && (
          <div className="flex flex-col gap-3 overflow-x-auto">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Failas: <span className="font-medium text-foreground">{fileName}</span>
              </span>
              <div className="flex items-center gap-3">
                {updateCount > 0 && (
                  <span className="flex items-center gap-1 text-blue-600 text-xs">
                    <CheckCircle2 className="size-3.5" />
                    {updateCount} atnaujinti
                  </span>
                )}
                {createCount > 0 && (
                  <span className="flex items-center gap-1 text-green-600 text-xs">
                    <CheckCircle2 className="size-3.5" />
                    {createCount} nauji
                  </span>
                )}
                {invalidCount > 0 && (
                  <span className="flex items-center gap-1 text-destructive text-xs">
                    <AlertCircle className="size-3.5" />
                    {invalidCount} su klaidomis
                  </span>
                )}
              </div>
            </div>

            <div className="h-64 overflow-auto rounded-md border">
              <table className="w-full min-w-[900px] text-xs">
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
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Veiksmas</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Statusas</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.index}
                      className={cn(
                        'border-t',
                        row.valid ? 'hover:bg-muted/50' : 'bg-destructive/5'
                      )}
                    >
                      <td className="px-3 py-2 text-muted-foreground">{row.index + 1}</td>
                      <td className="px-3 py-2 font-medium">{row.data.store_name ?? '—'}</td>
                      <td className="px-3 py-2 text-muted-foreground">{row.data.operator ?? '—'}</td>
                      <td className="px-3 py-2">{row.data.category ?? '—'}</td>
                      <td className="px-3 py-2">{row.data.space_m2 ?? '—'}</td>
                      <td className="px-3 py-2">{row.data.rent_eur ?? '—'}</td>
                      <td className="px-3 py-2">{row.data.company_code ?? '—'}</td>
                      <td className="px-3 py-2 max-w-[160px] truncate" title={row.data.description ?? undefined}>
                        {row.data.description ?? '—'}
                      </td>
                      <td className="px-3 py-2">
                        {row.data.id ? (
                          <span className="text-blue-600 font-medium">Atnaujinti</span>
                        ) : (
                          <span className="text-green-600 font-medium">Sukurti</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {row.valid ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-destructive" title={row.errors.join(', ')}>
                            ✗ {row.errors[0]}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-muted-foreground">
              Importuoti nuomininkai neturės prisijungimo paskyros. Ją galėsite sukurti atskirai kiekvienam nuomininkui.
            </p>
          </div>
        )}

        {step === 'done' && result && (
          <div className="flex flex-col items-center gap-4 py-6">
            {result.imported > 0 ? (
              <CheckCircle2 className="size-12 text-green-500" />
            ) : (
              <AlertCircle className="size-12 text-destructive" />
            )}
            <div className="text-center">
              <p className="text-base font-medium">
                {result.imported > 0
                  ? `Sėkmingai importuota ${result.imported} nuomininkų`
                  : 'Nepavyko importuoti'}
              </p>
              {result.errors.length > 0 && (
                <ul className="mt-2 text-sm text-destructive text-left space-y-1">
                  {result.errors.map((err, i) => (
                    <li key={i}>• {err}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          {step === 'upload' && (
            <Button variant="outline" onClick={() => handleClose(false)}>
              Atšaukti
            </Button>
          )}
          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={reset}>
                Pasirinkti kitą failą
              </Button>
              <Button disabled={validCount === 0 || isPending} onClick={handleImport}>
                {isPending ? 'Importuojama...' : `Importuoti ${validCount} eilučių`}
              </Button>
            </>
          )}
          {step === 'done' && (
            <>
              {result && result.imported > 0 && (
                <Button variant="outline" onClick={reset}>
                  Importuoti dar
                </Button>
              )}
              <Button onClick={() => handleClose(false)}>Uždaryti</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
