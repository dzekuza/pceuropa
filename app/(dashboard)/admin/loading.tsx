import { Skeleton } from '@/components/ui/skeleton'

export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-80 rounded-xl lg:col-span-2" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  )
}
