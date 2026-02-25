'use client'
// components/tenants/tenants-table.tsx — DataTable with sorting, filtering, pagination
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table'
import { PlusIcon } from 'lucide-react'
import { getColumns } from '@/components/tenants/tenant-columns'
import { TenantFormSheet } from '@/components/tenants/tenant-form-sheet'
import { DeleteTenantDialog } from '@/components/tenants/delete-tenant-dialog'
import type { Tenant } from '@/types/database'
import { TENANT_CATEGORIES } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface TenantsTableProps {
  data: Tenant[]
}

export function TenantsTable({ data }: TenantsTableProps) {
  const router = useRouter()

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null)

  // Table state
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  function handleEdit(tenant: Tenant) {
    setSelectedTenant(tenant)
    setSheetOpen(true)
  }

  function handleDelete(tenant: Tenant) {
    setTenantToDelete(tenant)
    setDeleteDialogOpen(true)
  }

  function handleSheetClose(open: boolean) {
    setSheetOpen(open)
    if (!open) setSelectedTenant(null)
  }

  const columns = getColumns(handleEdit, handleDelete)

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  })

  const categoryFilterValue = (table
    .getColumn('category')
    ?.getFilterValue() as string) ?? ''

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <Select
          value={categoryFilterValue || 'all'}
          onValueChange={(val) => {
            table
              .getColumn('category')
              ?.setFilterValue(val === 'all' ? '' : val)
          }}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Visos kategorijos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Visos kategorijos</SelectItem>
            {TENANT_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={() => {
            setSelectedTenant(null)
            setSheetOpen(true)
          }}
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Pridėti nuomininką
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() =>
                    router.push(`/admin/tenants/${row.original.id}`)
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  Nuomininkų nerasta.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end gap-2">
        <span className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} įrašų
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Ankstesnis
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Kitas
        </Button>
      </div>

      {/* Sheet and Dialog */}
      <TenantFormSheet
        open={sheetOpen}
        onOpenChange={handleSheetClose}
        tenant={selectedTenant}
      />
      <DeleteTenantDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        tenant={tenantToDelete}
      />
    </div>
  )
}
