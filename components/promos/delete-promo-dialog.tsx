'use client'

import { useState, useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { deletePromo } from '@/actions/promos'
import { ADMIN_PROMOS_STRINGS } from '@/lib/strings'

interface DeletePromoDialogProps {
  id: string
  onSuccess: (id: string) => void
}

export function DeletePromoDialog({ id, onSuccess }: DeletePromoDialogProps) {
  const [open, setOpen] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleConfirm() {
    startTransition(async () => {
      const result = await deletePromo(id)
      if ('success' in result) {
        onSuccess(id)
        setOpen(false)
      } else {
        setErrorMsg(result.error)
      }
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setErrorMsg(null) }}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{ADMIN_PROMOS_STRINGS.deleteConfirmTitle}</AlertDialogTitle>
          <AlertDialogDescription>{ADMIN_PROMOS_STRINGS.deleteConfirmDesc}</AlertDialogDescription>
        </AlertDialogHeader>
        {errorMsg && (
          <p className="text-sm text-destructive px-6 pb-2">{errorMsg}</p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>{ADMIN_PROMOS_STRINGS.deleteCancel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {ADMIN_PROMOS_STRINGS.deleteConfirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
