'use client'
// components/dashboard/app-sidebar.tsx
// Role-aware sidebar navigation component based on shadcn sidebar-08 block
// Receives navItems from the server-side layout (role detection happens server-side)

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSidebar } from '@/components/ui/sidebar'
import {
  Home,
  Building2,
  BarChart2,
  HelpCircle,
  Newspaper,
  Settings,
  TrendingUp,
  FileText,
  Plug,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,

  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

import type { NavItem } from '@/lib/strings'

// Icon map — resolves string icon names from lib/strings.ts to Lucide components
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  Building2,
  BarChart2,
  HelpCircle,
  Newspaper,
  Settings,
  TrendingUp,
  FileText,
  Plug,
}

interface AppSidebarProps {
  navItems: readonly NavItem[]
}

export function AppSidebar({ navItems, ...props }: AppSidebarProps & React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/" className="py-1">
                {/* invert in light mode → black logo; dark:invert-0 keeps white in dark mode */}
                <img
                  src="/nav-logo.svg"
                  alt="PC Europa"
                  className="h-7 w-auto invert dark:invert-0"
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => {
            const Icon = ICON_MAP[item.icon]
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href + '/'))
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.label}
                  onClick={() => isMobile && setOpenMobile(false)}
                >
                  <Link href={item.href}>
                    {Icon && <Icon className="size-4" />}
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

    </Sidebar>
  )
}
