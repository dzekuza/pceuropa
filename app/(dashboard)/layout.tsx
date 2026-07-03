// app/(dashboard)/layout.tsx — Dashboard shell with role-aware sidebar
// Server Component — reads user role and passes appropriate nav items to AppSidebar
// Defense-in-depth: independently checks auth even though proxy.ts middleware also guards routes

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { Header } from '@/components/dashboard/header'
import { ImpersonationBanner } from '@/components/dashboard/impersonation-banner'
import { MobileBottomNav } from '@/components/dashboard/mobile-bottom-nav'
import { ChatWidget } from '@/components/dashboard/chat-widget'
import { ADMIN_NAV_ITEMS, SELLER_NAV_ITEMS } from '@/lib/strings'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'

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

  const cookieStore = await cookies()
  const impersonatingStore = cookieStore.get('impersonating')?.value ?? null

  return (
    <TooltipProvider>
    <SidebarProvider>
      <AppSidebar navItems={navItems} className="hidden md:flex" />
      <SidebarInset>
        {impersonatingStore && <ImpersonationBanner storeName={impersonatingStore} />}
        <Header userEmail={user.email} role={role} impersonating={!!impersonatingStore} />
        <div className="flex flex-1 flex-col gap-4 p-4 pb-20 md:pb-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
    <MobileBottomNav navItems={navItems} />
    <ChatWidget />
    </TooltipProvider>
  )
}
