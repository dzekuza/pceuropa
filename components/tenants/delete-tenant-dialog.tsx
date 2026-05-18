'use client'
// components/tenants/delete-tenant-dialog.tsx — AlertDialog for delete confirmation
import { useTransition } from 'react'
import { deleteTenant } from '@/actions/tenants'
import type { Tenant } from '@/types/database'
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

interface DeleteTenantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenant: Tenant | null
}

export function DeleteTenantDialog({
  open,
  onOpenChange,
  tenant,
}: DeleteTenantDialogProps) {
  const [isPending, startTransition] = useTransition()

  function handleConfirm() {
    if (!tenant) return
    startTransition(async () => {
      await deleteTenant(tenant.id)
      onOpenChange(false)
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Ištrinti nuomininką</AlertDialogTitle>
          <AlertDialogDescription>
            Ar tikrai norite ištrinti{' '}
            <strong>{tenant?.store_name}</strong>? Šis veiksmas negrįžtamas.
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
