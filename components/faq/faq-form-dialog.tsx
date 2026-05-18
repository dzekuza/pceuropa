'use client'
// components/faq/faq-form-dialog.tsx — Dialog for creating/editing FAQ items
import { useEffect, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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

interface FaqFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editItem?: FaqItem | null
}

export function FaqFormDialog({
  open,
  onOpenChange,
  editItem,
}: FaqFormDialogProps) {
  const isEdit = editItem != null
  const [isPending, startTransition] = useTransition()

  const form = useForm<FaqFormValues>({
    resolver: zodResolver(faqFormSchema),
    defaultValues: {
      question: '',
      answer: '',
    },
  })

  // Pre-fill form when editing, reset when creating
  useEffect(() => {
    if (isEdit && editItem) {
      form.reset({
        question: editItem.question,
        answer: editItem.answer,
      })
    } else if (!isEdit) {
      form.reset({ question: '', answer: '' })
    }
  }, [editItem, isEdit, form])

  function onSubmit(values: FaqFormValues) {
    startTransition(async () => {
      const result =
        isEdit && editItem
          ? await updateFaqItem(editItem.id, values)
          : await createFaqItem(values)

      if ('error' in result) {
        form.setError('root', { message: result.error })
        return
      }

      form.reset()
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
            {/* Root error (server error) */}
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Atšaukti
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saugoma...' : isEdit ? 'Išsaugoti' : 'Sukurti'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
