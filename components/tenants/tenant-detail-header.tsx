// components/tenants/tenant-detail-header.tsx — Tenant info header card
// Server Component — renders key tenant properties in a horizontal grid
import Link from 'next/link'
import { ArrowLeftIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { Tenant } from '@/types/database'

interface TenantDetailHeaderProps {
  tenant: Tenant
}

export function TenantDetailHeader({ tenant }: TenantDetailHeaderProps) {
  const fields = [
    { label: 'Parduotuvė', value: tenant.store_name },
    { label: 'Operatorius', value: tenant.operator ?? '—' },
    { label: 'Kategorija', value: tenant.category ?? '—' },
    {
      label: 'Plotas',
      value: tenant.space_m2 != null ? `${tenant.space_m2} m²` : '—',
    },
    {
      label: 'Nuomos kaina',
      value: tenant.rent_eur != null ? `${tenant.rent_eur.toFixed(2)} €/mėn.` : '—',
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/admin/tenants"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Nuomininkai
      </Link>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {fields.map(({ label, value }) => (
              <div key={label} className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {label}
                </span>
                <span className="text-sm font-semibold">{value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
