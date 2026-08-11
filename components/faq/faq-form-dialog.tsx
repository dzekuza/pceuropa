'use client'
// components/faq/faq-form-dialog.tsx — Dialog for creating/editing FAQ items
import { useRef, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Paperclip, FileText, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { compressImageFile, imageExtension } from '@/lib/image-compression'
import { createFaqItem, updateFaqItem } from '@/actions/faq'
import { faqFormSchema, type FaqFormValues } from '@/lib/validations/faq'
import type { FaqItem } from '@/types/database'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

const BUCKET = 'faq-attachments'
const ACCEPTED = 'image/jpeg,image/png,image/webp,image/gif,application/pdf'
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

interface FaqFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editItem?: FaqItem | null
  onSuccess?: (item: FaqItem, isEdit: boolean) => void
}

function isImage(url: string) {
  return /\.(jpe?g|png|webp|gif)$/i.test(url)
}

function fileName(url: string) {
  return decodeURIComponent(url.split('/').pop() ?? url)
}

export function FaqFormDialog({
  open,
  onOpenChange,
  editItem,
  onSuccess,
}: FaqFormDialogProps) {
  const isEdit = editItem != null
  const [isPending, startTransition] = useTransition()
  const [uploading, setUploading] = useState(false)
  const [attachments, setAttachments] = useState<string[]>(() => editItem?.attachments ?? [])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<FaqFormValues>({
    resolver: zodResolver(faqFormSchema),
    defaultValues: isEdit && editItem
      ? { question: editItem.question, answer: editItem.answer, attachments: editItem.attachments ?? [] }
      : { question: '', answer: '', attachments: [] },
  })

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)

    const supabase = createClient()
    const uploaded: string[] = []

    for (const file of Array.from(files)) {
      if (file.size > MAX_SIZE) {
        form.setError('root', { message: `"${file.name}" per didelis (maks. 10 MB)` })
        setUploading(false)
        return
      }

      const compressed = await compressImageFile(file)
      const safeStem = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9._-]/g, '_')
      const path = `${crypto.randomUUID()}/${safeStem}.${imageExtension(compressed)}`

      const { error } = await supabase.storage.from(BUCKET).upload(path, compressed, { contentType: compressed.type })
      if (error) {
        form.setError('root', { message: `Nepavyko įkelti: ${file.name}` })
        setUploading(false)
        return
      }

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
      uploaded.push(data.publicUrl)
    }

    const next = [...attachments, ...uploaded]
    setAttachments(next)
    form.setValue('attachments', next)
    setUploading(false)
  }

  function removeAttachment(url: string) {
    const next = attachments.filter((a) => a !== url)
    setAttachments(next)
    form.setValue('attachments', next)
  }

  function onSubmit(values: FaqFormValues) {
    startTransition(async () => {
      const result =
        isEdit && editItem
          ? await updateFaqItem(editItem.id, { ...values, attachments })
          : await createFaqItem({ ...values, attachments })

      if ('error' in result) {
        form.setError('root', { message: result.error })
        return
      }

      onSuccess?.(result.data, isEdit)
      form.reset()
      setAttachments([])
      onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Redaguoti klausimą' : 'Naujas klausimas'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            {form.formState.errors.root && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {form.formState.errors.root.message}
              </div>
            )}

            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Klausimas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Įveskite klausimą..."
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
              name="answer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Atsakymas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Įveskite atsakymą..."
                      className="resize-none"
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File attachments */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Priedai</span>

              {attachments.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {attachments.map((url) => (
                    <li
                      key={url}
                      className="relative group rounded-md border overflow-hidden bg-muted"
                    >
                      {isImage(url) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={url}
                          alt={fileName(url)}
                          className="h-20 w-20 object-cover"
                        />
                      ) : (
                        <div className="h-20 w-20 flex flex-col items-center justify-center gap-1 p-2">
                          <FileText className="size-8 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground text-center break-all leading-tight line-clamp-2">
                            {fileName(url)}
                          </span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeAttachment(url)}
                        className="absolute top-1 right-1 rounded-full bg-black/60 p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Pašalinti priedą"
                      >
                        <X className="size-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED}
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit gap-2"
                disabled={uploading || isPending}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Paperclip className="size-4" />
                )}
                {uploading ? 'Įkeliama...' : 'Pridėti failą'}
              </Button>
              <p className="text-xs text-muted-foreground">
                JPG, PNG, WebP, GIF, PDF — maks. 10 MB
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending || uploading}
              >
                Atšaukti
              </Button>
              <Button type="submit" disabled={isPending || uploading}>
                {isPending ? 'Saugoma...' : isEdit ? 'Išsaugoti' : 'Sukurti'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
