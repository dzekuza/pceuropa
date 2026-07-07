import { Skeleton } from '@/components/ui/skeleton'

export default function OverviewLoading() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <Skeleton className="h-10 w-52" />
      <Skeleton className="h-[600px] rounded-xl" />
    </div>
  )
}
