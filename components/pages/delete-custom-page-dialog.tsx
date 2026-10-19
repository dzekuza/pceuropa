'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
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
import { deleteCustomPage } from '@/actions/custom-pages'
import { CUSTOM_PAGES_STRINGS } from '@/lib/strings'

interface DeleteCustomPageDialogProps {
  id: string
}

export function DeleteCustomPageDialog({ id }: DeleteCustomPageDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleConfirm() {
    startTransition(async () => {
      const result = await deleteCustomPage(id)
      if ('success' in result) {
        setOpen(false)
        router.refresh()
      } else {
        setErrorMsg(result.error)
      }
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setErrorMsg(null) }}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive"
          aria-label={CUSTOM_PAGES_STRINGS.delete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{CUSTOM_PAGES_STRINGS.deleteConfirmTitle}</AlertDialogTitle>
          <AlertDialogDescription>{CUSTOM_PAGES_STRINGS.deleteConfirmDesc}</AlertDialogDescription>
        </AlertDialogHeader>
        {errorMsg && <p className="text-sm text-destructive px-6 pb-2">{errorMsg}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel>{CUSTOM_PAGES_STRINGS.deleteCancel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {CUSTOM_PAGES_STRINGS.delete}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
