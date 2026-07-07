import { Skeleton } from '@/components/ui/skeleton'

export default function TenantsLoading() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <Skeleton className="h-[500px] rounded-xl" />
    </div>
  )
}
