'use client'
import type { ColumnDef } from '@tanstack/react-table'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { DataGridColumnHeader } from '@/components/reui/data-grid/data-grid-column-header'
import { DeletePromoDialog } from './delete-promo-dialog'
import type { Promo } from '@/types/database'
import { ADMIN_PROMOS_STRINGS } from '@/lib/strings'
import { resizeSupabaseImage } from '@/lib/utils/supabase-image'

const CATEGORY_LABEL: Record<Promo['category'], string> = {
  stores: ADMIN_PROMOS_STRINGS.categoryStores,
  services: ADMIN_PROMOS_STRINGS.categoryServices,
  food: ADMIN_PROMOS_STRINGS.categoryFood,
}

const CATEGORY_VARIANT: Record<Promo['category'], 'default' | 'secondary' | 'outline'> = {
  stores: 'default',
  services: 'secondary',
  food: 'outline',
}

function formatDateRange(startsAt: string, endsAt: string): string {
  const fmt = (d: string) => new Date(d).toLocaleDateString('lt-LT')
  return `${fmt(startsAt)} – ${fmt(endsAt)}`
}

export function getPromoColumns(
  onTogglePublished: (promo: Promo) => void,
  onEdit: (promo: Promo) => void,
  onDelete: (id: string) => void,
  pending: boolean,
): ColumnDef<Promo>[] {
  return [
    {
      id: 'image',
      accessorKey: 'image',
      header: ({ column }) => <DataGridColumnHeader title="" column={column} />,
      cell: ({ row }) => {
        const src = row.getValue<string | null>('image')
        return src ? (
          <img src={resizeSupabaseImage(src, { width: 80, height: 80 })} alt="" loading="lazy" className="h-10 w-10 rounded object-cover" />
        ) : (
          <div className="h-10 w-10 rounded bg-muted" />
        )
      },
      size: 48,
      enableSorting: false,
    },
    {
      id: 'title',
      accessorKey: 'title',
      header: ({ column }) => (
        <DataGridColumnHeader title={ADMIN_PROMOS_STRINGS.colTitle} column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue('title')}</span>
      ),
    },
    {
      id: 'category',
      accessorKey: 'category',
      header: ({ column }) => (
        <DataGridColumnHeader title={ADMIN_PROMOS_STRINGS.colCategory} column={column} />
      ),
      cell: ({ row }) => {
        const cat = row.getValue<Promo['category']>('category')
        return <Badge variant={CATEGORY_VARIANT[cat]}>{CATEGORY_LABEL[cat]}</Badge>
      },
      size: 160,
    },
    {
      id: 'dates',
      header: ({ column }) => (
        <DataGridColumnHeader title={ADMIN_PROMOS_STRINGS.colDates} column={column} />
      ),
      cell: ({ row }) => {
        const promo = row.original
        return (
          <span className="text-sm text-muted-foreground">
            {formatDateRange(promo.starts_at, promo.ends_at)}
          </span>
        )
      },
      size: 176,
      enableSorting: false,
    },
    {
      id: 'published',
      accessorKey: 'published',
      header: ({ column }) => (
        <DataGridColumnHeader title={ADMIN_PROMOS_STRINGS.colPublished} column={column} />
      ),
      cell: ({ row }) => {
        const promo = row.original
        return (
          <Switch
            checked={promo.published}
            disabled={pending}
            onCheckedChange={() => { onTogglePublished(promo) }}
            onClick={(e) => e.stopPropagation()}
          />
        )
      },
      size: 128,
      enableSorting: false,
    },
    {
      id: 'actions',
      header: ({ column }) => (
        <DataGridColumnHeader title={ADMIN_PROMOS_STRINGS.colActions} column={column} />
      ),
      cell: ({ row }) => {
        const promo = row.original
        return (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" onClick={() => onEdit(promo)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <DeletePromoDialog id={promo.id} onSuccess={onDelete} />
          </div>
        )
      },
      size: 96,
      enableSorting: false,
    },
  ]
}
