'use client'
// components/dashboard/app-sidebar.tsx
// Role-aware sidebar navigation component based on shadcn sidebar-08 block
// Receives navItems from the server-side layout (role detection happens server-side)

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Building2,
  BarChart2,
  HelpCircle,
  Settings,
  TrendingUp,
  FileText,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { ModeToggle } from '@/components/mode-toggle'
import type { NavItem } from '@/lib/strings'

// Icon map — resolves string icon names from lib/strings.ts to Lucide components
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2,
  BarChart2,
  HelpCircle,
  Settings,
  TrendingUp,
  FileText,
}

interface AppSidebarProps {
  navItems: readonly NavItem[]
}

export function AppSidebar({ navItems, ...props }: AppSidebarProps & React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg font-bold text-xs">
                  PCE
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">PC EUROPA</span>
                  <span className="truncate text-xs text-sidebar-foreground/60">Valdymo sistema</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => {
            const Icon = ICON_MAP[item.icon]
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.label}
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

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem className="flex justify-center p-2 pt-0">
            <ModeToggle />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
