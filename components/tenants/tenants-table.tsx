'use client'
// components/tenants/tenants-table.tsx — Updated DataTable using ReUI DataGrid
import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type SortingState,
  type ColumnFiltersState,
  type PaginationState,
} from '@tanstack/react-table'
import { PlusIcon } from 'lucide-react'
import { getColumns } from '@/components/tenants/tenant-columns'
import { TenantFormSheet } from '@/components/tenants/tenant-form-sheet'
import { DeleteTenantDialog } from '@/components/tenants/delete-tenant-dialog'
import type { Tenant } from '@/types/database'
import { TENANT_CATEGORIES } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataGrid } from '@/components/reui/data-grid/data-grid'
import { DataGridTable } from '@/components/reui/data-grid/data-grid-table'
import { DataGridPagination } from '@/components/reui/data-grid/data-grid-pagination'
import { Card, CardToolbar, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'

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
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const handleEdit = useCallback((tenant: Tenant) => {
    setSelectedTenant(tenant)
    setSheetOpen(true)
  }, [])

  const handleDelete = useCallback((tenant: Tenant) => {
    setTenantToDelete(tenant)
    setDeleteDialogOpen(true)
  }, [])

  function handleSheetClose(open: boolean) {
    setSheetOpen(open)
    if (!open) setSelectedTenant(null)
  }

  const columns = useMemo(() => getColumns(handleEdit, handleDelete), [handleEdit, handleDelete])

  const [columnOrder, setColumnOrder] = useState<string[]>(
    columns.map((column) => (column as { id?: string; accessorKey?: string }).id || (column as { id?: string; accessorKey?: string }).accessorKey || '')
  )

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, pagination, columnOrder },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false, // local pagination for now
  })

  const categoryFilterValue = (table
    .getColumn('category')
    ?.getFilterValue() as string) ?? ''

  return (
    <div className="flex flex-col gap-4">
      <DataGrid
        table={table}
        recordCount={data.length}
        onRowClick={(row) => router.push(`/admin/tenants/${row.id}`)}
        tableLayout={{
          columnsPinnable: true,
          columnsMovable: true,
          columnsVisibility: true,
        }}
      >
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between px-4 py-3">
            <div className="flex items-center gap-4">
              <CardTitle className="text-lg">Nuomininkai</CardTitle>
              <Select
                value={categoryFilterValue || 'all'}
                onValueChange={(val) => {
                  table
                    .getColumn('category')
                    ?.setFilterValue(val === 'all' ? '' : val)
                }}
              >
                <SelectTrigger className="w-[200px] h-9">
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
            </div>
            <CardToolbar>
              <Button
                size="sm"
                onClick={() => {
                  setSelectedTenant(null)
                  setSheetOpen(true)
                }}
                className="h-9"
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Pridėti nuomininką
              </Button>
            </CardToolbar>
          </CardHeader>

          <div className="w-full overflow-x-auto border-y">
            <DataGridTable />
          </div>

          <CardFooter className="flex items-center justify-between px-4 py-3 bg-transparent border-none">
            <DataGridPagination />
          </CardFooter>
        </Card>
      </DataGrid>

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
