'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Building2, BarChart2, HelpCircle, Newspaper, TrendingUp, Plug } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NavItem } from '@/lib/strings'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  Building2,
  BarChart2,
  HelpCircle,
  Newspaper,
  TrendingUp,
  Plug,
}

export function MobileBottomNav({ navItems }: { navItems: readonly NavItem[] }) {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t border-border md:hidden">
      <div className="flex items-center justify-around h-16 safe-b">
        {navItems.map((item) => {
          const Icon = ICON_MAP[item.icon]
          const isActive =
            pathname === item.href ||
            (item.href !== '/admin' && item.href !== '/seller' && pathname.startsWith(item.href + '/'))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 h-full text-[10px] font-medium transition-colors min-w-0',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {Icon && <Icon className="size-5 shrink-0" />}
              <span className="truncate max-w-full px-1">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
