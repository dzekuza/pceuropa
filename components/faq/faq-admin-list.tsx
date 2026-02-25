'use client'
// components/faq/faq-admin-list.tsx — Admin FAQ list with CRUD and reorder controls
import { useState } from 'react'
import { reorderFaqItems } from '@/actions/faq'
import type { FaqItem } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FaqFormDialog } from './faq-form-dialog'
import { DeleteFaqDialog } from './delete-faq-dialog'
import { Pencil, Trash2, ChevronUp, ChevronDown, Plus } from 'lucide-react'

interface FaqAdminListProps {
  items: FaqItem[]
}

export function FaqAdminList({ items: initialItems }: FaqAdminListProps) {
  const [items, setItems] = useState<FaqItem[]>(initialItems)
  const [formOpen, setFormOpen] = useState(false)
  const [editItem, setEditItem] = useState<FaqItem | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteItem, setDeleteItem] = useState<FaqItem | null>(null)

  function handleEdit(item: FaqItem) {
    setEditItem(item)
    setFormOpen(true)
  }

  function handleDelete(item: FaqItem) {
    setDeleteItem(item)
    setDeleteOpen(true)
  }

  function handleCreate() {
    setEditItem(null)
    setFormOpen(true)
  }

  async function handleMove(index: number, direction: 'up' | 'down') {
    const newItems = [...items]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newItems.length) return

    // Swap items (optimistic update)
    ;[newItems[index], newItems[targetIndex]] = [
      newItems[targetIndex],
      newItems[index],
    ]
    setItems(newItems)

    // Persist new order to the server
    await reorderFaqItems(newItems.map((item) => item.id))
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-end">
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Pridėti klausimą
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <p className="text-base">
            Dar nėra DUK įrašų. Pridėkite pirmą klausimą.
          </p>
        </div>
        <FaqFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          editItem={editItem}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Pridėti klausimą
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {items.map((item, index) => (
          <Card key={item.id}>
            <CardContent className="flex items-start gap-4 p-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm leading-snug">
                  {item.question}
                </p>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {item.answer}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleMove(index, 'up')}
                  disabled={index === 0}
                  title="Perkelti aukštyn"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleMove(index, 'down')}
                  disabled={index === items.length - 1}
                  title="Perkelti žemyn"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(item)}
                  title="Redaguoti"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(item)}
                  title="Ištrinti"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <FaqFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editItem={editItem}
      />
      <DeleteFaqDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        item={deleteItem}
      />
    </div>
  )
}
