'use client'

import { useState } from 'react'
import { PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TenantFormSheet } from '@/components/tenants/tenant-form-sheet'

export function AddTenantButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <PlusIcon className="mr-2 h-4 w-4" />
        Pridėti nuomininką
      </Button>
      <TenantFormSheet open={open} onOpenChange={setOpen} tenant={null} />
    </>
  )
}
