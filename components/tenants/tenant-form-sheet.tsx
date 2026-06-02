'use client'
// components/tenants/tenant-form-sheet.tsx — Sheet drawer for create/edit tenant
import { useEffect, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createTenant, updateTenant } from '@/actions/tenants'
import { tenantSchema, type TenantFormValues } from '@/lib/validations/tenant'
import { TENANT_CATEGORIES } from '@/lib/constants'
import type { Tenant } from '@/types/database'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface TenantFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenant: Tenant | null
}

export function TenantFormSheet({
  open,
  onOpenChange,
  tenant,
}: TenantFormSheetProps) {
  const isEdit = tenant !== null
  const [isPending, startTransition] = useTransition()

  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      username: '',
      password: '',
      store_name: '',
      operator: '',
      company_code: '',
      category: '',
      space_m2: '',
      rent_eur: '',
    },
  })

  // Pre-fill form when editing an existing tenant
  useEffect(() => {
    if (isEdit && tenant) {
      form.reset({
        username: '',
        password: '',
        store_name: tenant.store_name ?? '',
        operator: tenant.operator ?? '',
        company_code: tenant.company_code ?? '',
        category: tenant.category ?? '',
        space_m2: tenant.space_m2 != null ? String(tenant.space_m2) : '',
        rent_eur: tenant.rent_eur != null ? String(tenant.rent_eur) : '',
      })
    } else if (!isEdit) {
      form.reset({
        username: '',
        password: '',
        store_name: '',
        operator: '',
        company_code: '',
        category: '',
        space_m2: '',
        rent_eur: '',
      })
    }
  }, [tenant, isEdit, form])

  function onSubmit(values: TenantFormValues) {
    startTransition(async () => {
      const result = isEdit && tenant
        ? await updateTenant(tenant.id, values)
        : await createTenant(values)

      if ('error' in result) {
        form.setError('root', { message: result.error })
        return
      }

      form.reset()
      onOpenChange(false)
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isEdit ? 'Redaguoti nuomininką' : 'Naujas nuomininkas'}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? 'Keiskite nuomininko duomenis'
              : 'Užpildykite nuomininko duomenis'}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4 px-4 py-4"
          >
            {/* Root error (server error) */}
            {form.formState.errors.root && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {form.formState.errors.root.message}
              </div>
            )}

            {/* Username and password — only shown when creating */}
            {!isEdit && (
              <>
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vartotojo vardas</FormLabel>
                      <FormControl>
                        <Input placeholder="lindex" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slaptažodis</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="store_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parduotuvė</FormLabel>
                  <FormControl>
                    <Input placeholder="Lindex" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="operator"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Operatorius</FormLabel>
                  <FormControl>
                    <Input placeholder="Lindex UAB" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Įm. kodas</FormLabel>
                  <FormControl>
                    <Input placeholder="300636460" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategorija</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pasirinkite kategoriją" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TENANT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="space_m2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plotas (m²)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="639.69"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rent_eur"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nuomos kaina (EUR)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="10.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter className="px-0 pt-2">
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending
                  ? 'Saugoma...'
                  : isEdit
                  ? 'Išsaugoti'
                  : 'Sukurti'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
