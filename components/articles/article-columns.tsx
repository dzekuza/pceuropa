'use client'
import type { ColumnDef } from '@tanstack/react-table'
import { Star, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { DataGridColumnHeader } from '@/components/reui/data-grid/data-grid-column-header'
import { DeleteArticleDialog } from './delete-article-dialog'
import type { Article } from '@/types/database'
import { ARTICLES_STRINGS } from '@/lib/strings'
import { resizeImage } from '@/lib/storage/resize-image'

const CATEGORY_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  Naujiena: 'default',
  Akcija: 'secondary',
  Renginys: 'outline',
}

export function getArticleColumns(
  onTogglePublished: (article: Article) => void,
  onToggleFeatured: (article: Article) => void,
  onEdit: (article: Article) => void,
  onDelete: (id: string) => void,
  pending: boolean,
): ColumnDef<Article>[] {
  return [
    {
      id: 'cover_image',
      accessorKey: 'cover_image',
      header: ({ column }) => <DataGridColumnHeader title="" column={column} />,
      cell: ({ row }) => {
        const src = row.getValue<string | null>('cover_image')
        return src ? (
          <img src={resizeImage(src, { width: 80, height: 80 })} alt="" loading="lazy" className="h-10 w-10 rounded object-cover" />
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
        <DataGridColumnHeader title={ARTICLES_STRINGS.colTitle} column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue('title')}</span>
      ),
    },
    {
      id: 'category',
      accessorKey: 'category',
      header: ({ column }) => (
        <DataGridColumnHeader title={ARTICLES_STRINGS.colCategory} column={column} />
      ),
      cell: ({ row }) => {
        const cat = row.getValue<string>('category')
        return <Badge variant={CATEGORY_VARIANT[cat] ?? 'default'}>{cat}</Badge>
      },
      size: 128,
    },
    {
      id: 'featured',
      accessorKey: 'featured',
      header: ({ column }) => (
        <DataGridColumnHeader title={ARTICLES_STRINGS.colFeatured} column={column} />
      ),
      cell: ({ row }) => {
        const article = row.original
        return (
          <Button
            variant="ghost"
            size="icon"
            disabled={pending}
            onClick={(e) => { e.stopPropagation(); onToggleFeatured(article) }}
            className={article.featured ? 'text-yellow-500' : 'text-muted-foreground'}
          >
            <Star className="h-4 w-4" fill={article.featured ? 'currentColor' : 'none'} />
          </Button>
        )
      },
      size: 128,
      enableSorting: false,
    },
    {
      id: 'published',
      accessorKey: 'published',
      header: ({ column }) => (
        <DataGridColumnHeader title={ARTICLES_STRINGS.colPublished} column={column} />
      ),
      cell: ({ row }) => {
        const article = row.original
        return (
          <Switch
            checked={article.published}
            disabled={pending}
            onCheckedChange={() => { onTogglePublished(article) }}
            onClick={(e) => e.stopPropagation()}
          />
        )
      },
      size: 128,
      enableSorting: false,
    },
    {
      id: 'created_at',
      accessorKey: 'created_at',
      header: ({ column }) => (
        <DataGridColumnHeader title={ARTICLES_STRINGS.colDate} column={column} />
      ),
      cell: ({ row }) => {
        const val = row.getValue<string | null>('created_at')
        return (
          <span className="text-sm text-muted-foreground">
            {val ? new Date(val).toLocaleDateString('lt-LT') : '—'}
          </span>
        )
      },
      size: 128,
    },
    {
      id: 'actions',
      header: ({ column }) => (
        <DataGridColumnHeader title={ARTICLES_STRINGS.colActions} column={column} />
      ),
      cell: ({ row }) => {
        const article = row.original
        return (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(article)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <DeleteArticleDialog id={article.id} onSuccess={onDelete} />
          </div>
        )
      },
      size: 96,
      enableSorting: false,
    },
  ]
}
