'use client'
// components/tenants/tenant-columns.tsx — Column definitions for TanStack Table
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Tenant } from '@/types/database'

/**
 * getColumns — factory that injects callbacks so column definitions stay stateless.
 */
export function getColumns(
  onEdit: (tenant: Tenant) => void,
  onDelete: (tenant: Tenant) => void
): ColumnDef<Tenant>[] {
  return [
    {
      accessorKey: 'store_name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-3 h-8 px-3"
        >
          Parduotuvė
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue('store_name')}</span>
      ),
    },
    {
      accessorKey: 'operator',
      header: 'Operatorius',
      cell: ({ row }) => row.getValue('operator') ?? '—',
    },
    {
      accessorKey: 'category',
      header: 'Kategorija',
      cell: ({ row }) => row.getValue('category') ?? '—',
    },
    {
      accessorKey: 'space_m2',
      header: 'Plotas (m²)',
      cell: ({ row }) => {
        const val = row.getValue<number | null>('space_m2')
        return val != null ? val.toLocaleString('lt-LT') : '—'
      },
    },
    {
      accessorKey: 'rent_eur',
      header: 'Nuomos kaina (EUR)',
      cell: ({ row }) => {
        const val = row.getValue<number | null>('rent_eur')
        return val != null ? val.toFixed(2) : '—'
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const tenant = row.original
        return (
          <div
            className="flex justify-end"
            onClick={(e) => e.stopPropagation()}
          >
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
    },
  ]
}
