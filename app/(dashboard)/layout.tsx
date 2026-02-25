// app/(dashboard)/layout.tsx — Dashboard shell with role-aware sidebar
// Server Component — reads user role and passes appropriate nav items to AppSidebar
// Defense-in-depth: independently checks auth even though proxy.ts middleware also guards routes

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { Header } from '@/components/dashboard/header'
import { ADMIN_NAV_ITEMS, SELLER_NAV_ITEMS } from '@/lib/strings'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  // Defense-in-depth: use getUser() (NOT getSession()) to validate JWT with Supabase Auth server
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const role = user.app_metadata?.role as 'admin' | 'seller'
  const navItems = role === 'admin' ? ADMIN_NAV_ITEMS : SELLER_NAV_ITEMS

  return (
    <SidebarProvider>
      <AppSidebar navItems={navItems} />
      <SidebarInset>
        <Header userEmail={user.email} />
        <main className="flex flex-1 flex-col gap-4 p-4">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
