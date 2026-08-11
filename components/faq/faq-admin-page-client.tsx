'use client'
// components/faq/faq-admin-page-client.tsx — Client wrapper: owns add/edit state for the FAQ page
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FaqAdminList } from './faq-admin-list'
import { FaqFormDialog } from './faq-form-dialog'
import type { FaqItem } from '@/types/database'

interface FaqAdminPageClientProps {
  items: FaqItem[]
}

export function FaqAdminPageClient({ items: initialItems }: FaqAdminPageClientProps) {
  const [items, setItems] = useState<FaqItem[]>(initialItems)
  const [formOpen, setFormOpen] = useState(false)
  const [editItem, setEditItem] = useState<FaqItem | null>(null)

  function handleAdd() {
    setEditItem(null)
    setFormOpen(true)
  }

  function handleEdit(item: FaqItem) {
    setEditItem(item)
    setFormOpen(true)
  }

  function handleFormSuccess(item: FaqItem, isEdit: boolean) {
    setItems((prev) =>
      isEdit ? prev.map((i) => (i.id === item.id ? item : i)) : [...prev, item]
    )
  }

  function handleDeleteSuccess(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">DUK valdymas</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Kurkite ir tvarkykite dažnai užduodamus klausimus
          </p>
        </div>
        <Button size="sm" onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Pridėti klausimą
        </Button>
      </div>

      <FaqAdminList
        items={items}
        onEdit={handleEdit}
        onDeleteSuccess={handleDeleteSuccess}
      />

      <FaqFormDialog
        key={editItem?.id ?? 'new'}
        open={formOpen}
        onOpenChange={setFormOpen}
        editItem={editItem}
        onSuccess={handleFormSuccess}
      />
    </div>
  )
}
