'use client'
// components/tenants/tenant-form-sheet.tsx — Sheet drawer for create/edit tenant
import { useEffect, useTransition, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createTenant, updateTenant } from '@/actions/tenants'
import { tenantSchema, type TenantFormValues } from '@/lib/validations/tenant'
import { TENANT_CATEGORIES } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'
import { compressImageFile, imageExtension } from '@/lib/image-compression'
import { resizeSupabaseImage } from '@/lib/utils/supabase-image'
import type { Tenant } from '@/types/database'
import type { TenantListRow } from '@/lib/admin-data'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ImageIcon, Loader2, X, Upload } from 'lucide-react'

interface TenantFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenant: (Tenant | TenantListRow) | null
}

async function uploadFile(file: File, folder: 'logos' | 'gallery'): Promise<string> {
  const compressed = await compressImageFile(file)
  const supabase = createClient()
  const path = `${folder}/${crypto.randomUUID()}.${imageExtension(compressed)}`
  const { error } = await supabase.storage
    .from('tenant-assets')
    .upload(path, compressed, { upsert: true, contentType: compressed.type, cacheControl: '31536000' })
  if (error) throw new Error(error.message)
  const { data } = supabase.storage.from('tenant-assets').getPublicUrl(path)
  return data.publicUrl
}

function LogoUploader({
  value,
  onChange,
}: {
  value: string | undefined
  onChange: (url: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  async function handleFile(file: File) {
    setUploading(true)
    setUploadError(null)
    try {
      const url = await uploadFile(file, 'logos')
      onChange(url)
    } catch (err) {
      console.error('[LogoUploader] upload failed:', err)
      setUploadError('Nepavyko įkelti logotipo. Bandykite dar kartą.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      {value ? (
        <div className="relative size-16 rounded-lg overflow-hidden border bg-muted shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={resizeSupabaseImage(value, { width: 192, height: 192, quality: 90 })} alt="Logo" className="size-full object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-0.5 right-0.5 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
          >
            <X className="size-3" />
          </button>
        </div>
      ) : (
        <div className="size-16 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center bg-muted/30 shrink-0">
          <ImageIcon className="size-6 text-muted-foreground/40" />
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? <Loader2 className="size-3.5 mr-1.5 animate-spin" /> : <Upload className="size-3.5 mr-1.5" />}
          {uploading ? 'Keliama...' : value ? 'Keisti' : 'Įkelti logotipą'}
        </Button>
        <p className="text-xs text-muted-foreground">PNG, JPG iki 2 MB</p>
        {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}

function GalleryUploader({
  value,
  onChange,
}: {
  value: string[]
  onChange: (urls: string[]) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  async function handleFiles(files: FileList) {
    setUploading(true)
    setUploadError(null)
    try {
      const uploads = Array.from(files).map((file) => uploadFile(file, 'gallery'))
      const urls = await Promise.all(uploads)
      onChange([...value, ...urls])
    } catch (err) {
      console.error('[GalleryUploader] upload failed:', err)
      setUploadError('Nepavyko įkelti nuotraukų. Bandykite dar kartą.')
    } finally {
      setUploading(false)
    }
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {value.map((url, i) => (
          <div key={url} className="relative size-20 rounded-lg overflow-hidden border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={resizeSupabaseImage(url, { width: 240, height: 240, quality: 90 })} alt={`Galerija ${i + 1}`} className="size-full object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-0.5 right-0.5 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="size-20 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 bg-muted/30 hover:bg-muted/50 transition-colors disabled:opacity-50"
        >
          {uploading
            ? <Loader2 className="size-5 text-muted-foreground animate-spin" />
            : <Upload className="size-5 text-muted-foreground/50" />}
          <span className="text-[10px] text-muted-foreground/60">Įkelti</span>
        </button>
      </div>
      <p className="text-xs text-muted-foreground">Galite pasirinkti kelias nuotraukas vienu metu</p>
      {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files)
          e.target.value = ''
        }}
      />
    </div>
  )
}

const EMPTY_TENANT_FORM_VALUES: TenantFormValues = {
  username: '',
  password: '',
  store_name: '',
  operator: '',
  company_code: '',
  category: '',
  space_m2: '',
  rent_eur: '',
  description: '',
  logo_url: '',
  gallery_images: [],
  weekday_hours: '',
  saturday_hours: '',
  sunday_hours: '',
}

export function TenantFormSheet({
  open,
  onOpenChange,
  tenant,
}: TenantFormSheetProps) {
  const isEdit = tenant !== null
  const [isPending, startTransition] = useTransition()

  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema),
    defaultValues: EMPTY_TENANT_FORM_VALUES,
  })

  useEffect(() => {
    if (isEdit && tenant) {
      form.reset({
        ...EMPTY_TENANT_FORM_VALUES,
        store_name: tenant.store_name ?? '',
        operator: tenant.operator ?? '',
        company_code: tenant.company_code ?? '',
        category: tenant.category ?? '',
        space_m2: tenant.space_m2 != null ? String(tenant.space_m2) : '',
        rent_eur: tenant.rent_eur != null ? String(tenant.rent_eur) : '',
        description: tenant.description ?? '',
        logo_url: tenant.logo_url ?? '',
        gallery_images: tenant.gallery_images ?? [],
        weekday_hours: tenant.weekday_hours ?? '',
        saturday_hours: tenant.saturday_hours ?? '',
        sunday_hours: tenant.sunday_hours ?? '',
      })
    } else if (!isEdit) {
      form.reset(EMPTY_TENANT_FORM_VALUES)
    }
  }, [tenant, isEdit, form])

  function onSubmit(values: TenantFormValues) {
    startTransition(async () => {
      const result = isEdit && tenant
        ? await updateTenant(tenant.id, values)
        : await createTenant(values)

      if ('error' in result) {
        form.setError('root', { message: result.error })
        return
      }

      form.reset()
      onOpenChange(false)
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:w-[520px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isEdit ? 'Redaguoti nuomininką' : 'Naujas nuomininkas'}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? 'Keiskite nuomininko duomenis'
              : 'Užpildykite nuomininko duomenis'}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4 px-4 py-4"
          >
            {form.formState.errors.root && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {form.formState.errors.root.message}
              </div>
            )}

            {!isEdit && (
              <>
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vartotojo vardas</FormLabel>
                      <FormControl>
                        <Input placeholder="lindex" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slaptažodis</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="store_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parduotuvė</FormLabel>
                  <FormControl>
                    <Input placeholder="Lindex" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="operator"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Operatorius</FormLabel>
                  <FormControl>
                    <Input placeholder="Lindex UAB" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Įm. kodas</FormLabel>
                  <FormControl>
                    <Input placeholder="300636460" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategorija</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pasirinkite kategoriją" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TENANT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="space_m2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plotas (m²)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="639.69" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rent_eur"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nuoma (€)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="10.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="weekday_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Darbo laikas (I–V)</FormLabel>
                    <FormControl>
                      <Input placeholder="10:00–21:00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="saturday_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Šeštadienis</FormLabel>
                    <FormControl>
                      <Input placeholder="10:00–20:00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sunday_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sekmadienis</FormLabel>
                    <FormControl>
                      <Input placeholder="10:00–20:00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aprašymas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Trumpas parduotuvės aprašymas viešai puslapiui..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="logo_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logotipas</FormLabel>
                  <FormControl>
                    <LogoUploader
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gallery_images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Galerija</FormLabel>
                  <FormControl>
                    <GalleryUploader
                      value={field.value ?? []}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter className="px-0 pt-2">
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending
                  ? 'Saugoma...'
                  : isEdit
                  ? 'Išsaugoti'
                  : 'Sukurti'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
