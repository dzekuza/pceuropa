'use client'
import type { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Tenant } from '@/types/database'
import { DataGridColumnHeader } from '@/components/reui/data-grid/data-grid-column-header'
import { Badge } from '@/components/reui/badge'

export function getColumns(
  onEdit: (tenant: Tenant) => void,
  onDelete: (tenant: Tenant) => void
): ColumnDef<Tenant>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Pažymėti visus"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Pažymėti eilutę"
          />
        </div>
      ),
      size: 48,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'logo_url',
      id: 'logo_url',
      header: ({ column }) => (
        <DataGridColumnHeader title="Logo" column={column} />
      ),
      cell: ({ row }) => {
        const url = row.getValue<string | null>('logo_url')
        const name = row.getValue<string>('store_name') ?? ''
        return (
          <Avatar className="size-8">
            <AvatarImage src={url ?? ''} alt={name} />
            <AvatarFallback className="text-xs">{name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        )
      },
      size: 64,
      enableSorting: false,
    },
    {
      accessorKey: 'store_name',
      id: 'store_name',
      header: ({ column }) => (
        <DataGridColumnHeader
          title="Parduotuvė"
          column={column}
        />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue('store_name')}</span>
      ),
      size: 200,
    },
    {
      accessorKey: 'operator',
      id: 'operator',
      header: ({ column }) => (
        <DataGridColumnHeader
          title="Operatorius"
          column={column}
        />
      ),
      cell: ({ row }) => row.getValue('operator') ?? '—',
      size: 150,
    },
    {
      accessorKey: 'category',
      id: 'category',
      header: ({ column }) => (
        <DataGridColumnHeader
          title="Kategorija"
          column={column}
        />
      ),
      cell: ({ row }) => {
        const category = row.getValue('category') as string
        return category ? (
          <Badge variant="primary-light" size="sm">
            {category}
          </Badge>
        ) : '—'
      },
      size: 130,
    },
    {
      accessorKey: 'space_m2',
      id: 'space_m2',
      header: ({ column }) => (
        <DataGridColumnHeader
          title="Plotas (m²)"
          column={column}
        />
      ),
      cell: ({ row }) => {
        const val = row.getValue<number | null>('space_m2')
        return val != null ? val.toLocaleString('lt-LT') : '—'
      },
      size: 120,
    },
    {
      accessorKey: 'rent_eur',
      id: 'rent_eur',
      header: ({ column }) => (
        <DataGridColumnHeader
          title="Nuomos kaina (EUR)"
          column={column}
        />
      ),
      cell: ({ row }) => {
        const val = row.getValue<number | null>('rent_eur')
        return val != null ? val.toFixed(2) : '—'
      },
      size: 150,
    },
    {
      accessorKey: 'company_code',
      id: 'company_code',
      header: ({ column }) => (
        <DataGridColumnHeader title="Įmonės kodas" column={column} />
      ),
      cell: ({ row }) => row.getValue('company_code') ?? '—',
      size: 140,
    },
    {
      accessorKey: 'description',
      id: 'description',
      header: ({ column }) => (
        <DataGridColumnHeader title="Aprašymas" column={column} />
      ),
      cell: ({ row }) => {
        const val = row.getValue<string | null>('description')
        return val ? (
          <span className="truncate block max-w-[220px]" title={val}>{val}</span>
        ) : '—'
      },
      size: 240,
    },
    {
      accessorKey: 'created_at',
      id: 'created_at',
      header: ({ column }) => (
        <DataGridColumnHeader title="Sukurta" column={column} />
      ),
      cell: ({ row }) => {
        const val = row.getValue<string | null>('created_at')
        return val ? new Date(val).toLocaleDateString('lt-LT') : '—'
      },
      size: 120,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const tenant = row.original
        return (
          <div
            className="flex items-center justify-end gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Enter Profile — opens tenant portal in new tab */}
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={() => {
                window.open(
                  `/api/admin/impersonate?tenantId=${tenant.id}`,
                  '_blank'
                )
              }}
            >
              <LogIn className="h-3.5 w-3.5" />
              Įeiti į profilį
            </Button>

            {/* Edit / Delete dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Atidaryti meniu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(tenant)}>
                  Redaguoti
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(tenant)}
                  className="text-destructive focus:text-destructive"
                >
                  Ištrinti
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
      size: 180,
      enableSorting: false,
      enableHiding: false,
    },
  ]
}
