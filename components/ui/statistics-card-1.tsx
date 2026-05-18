import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { TrendingUpIcon, TrendingDownIcon, LucideIcon } from 'lucide-react'

interface StatisticsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: {
    value: number
    label: string
    isUp?: boolean
  }
  className?: string
}

export function StatisticsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className
}: StatisticsCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold tracking-tight tabular-nums">{value}</h3>
              {trend && (
                <div className={cn(
                  "flex items-center text-xs font-medium px-1.5 py-0.5 rounded-md",
                  trend.isUp !== false ? "text-green-600 bg-green-50 dark:bg-green-950/30 dark:text-green-400" : "text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400"
                )}>
                  {trend.isUp !== false ? (
                    <TrendingUpIcon className="size-3 mr-1" />
                  ) : (
                    <TrendingDownIcon className="size-3 mr-1" />
                  )}
                  {trend.value}%
                </div>
              )}
            </div>
          </div>
          {Icon && (
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Icon className="size-5" />
            </div>
          )}
        </div>

        {description && (
          <p className="mt-4 text-xs text-muted-foreground">
            {description}
            {trend && <span className="ml-1 text-foreground font-medium">{trend.label}</span>}
          </p>
        )}
      </div>

      {/* Decorative background element */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
    </Card>
  )
}
