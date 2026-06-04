'use client'
// components/faq/delete-faq-dialog.tsx — AlertDialog for FAQ delete confirmation
import { useTransition } from 'react'
import { deleteFaqItem } from '@/actions/faq'
import type { FaqItem } from '@/types/database'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface DeleteFaqDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: FaqItem | null
  onSuccess?: (id: string) => void
}

export function DeleteFaqDialog({
  open,
  onOpenChange,
  item,
  onSuccess,
}: DeleteFaqDialogProps) {
  const [isPending, startTransition] = useTransition()

  function handleConfirm() {
    if (!item) return
    startTransition(async () => {
      const result = await deleteFaqItem(item.id)
      if (!('error' in result)) {
        onSuccess?.(item.id)
      }
      onOpenChange(false)
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Ištrinti klausimą</AlertDialogTitle>
          <AlertDialogDescription>
            Ar tikrai norite ištrinti šį klausimą?{' '}
            {item && (
              <span className="block mt-1 font-medium text-foreground">
                &ldquo;{item.question}&rdquo;
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Atšaukti</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isPending}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {isPending ? 'Trinama...' : 'Ištrinti'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
