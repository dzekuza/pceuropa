'use client'
// components/dashboard/header.tsx
// Dashboard header with breadcrumb navigation and user dropdown with logout

import { LogOut, ChevronsUpDown } from 'lucide-react'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'
import { logout } from '@/actions/auth'
import { AUTH_STRINGS } from '@/lib/strings'

interface HeaderProps {
  userEmail?: string
  pageTitle?: string
  role?: 'admin' | 'seller'
}

export function Header({ userEmail, pageTitle = 'Pagrindinis', role }: HeaderProps) {
  const initials = userEmail
    ? userEmail.charAt(0).toUpperCase()
    : 'U'

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <div className="flex flex-1 items-center gap-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <ModeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 h-8 px-2">
            <Avatar className="h-7 w-7 rounded-lg">
              <AvatarFallback className="rounded-lg text-xs">{initials}</AvatarFallback>
            </Avatar>
            {userEmail && (
              <span className="hidden md:inline-block text-sm truncate max-w-32">
                {userEmail}
              </span>
            )}
            <ChevronsUpDown className="size-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-44">
          {userEmail && (
            <>
              <DropdownMenuLabel className="font-normal">
                <span className="block text-xs text-muted-foreground truncate">{userEmail}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
            </>
          )}
          {role === 'seller' && (
            <>
              <DropdownMenuItem asChild className="text-warning focus:text-warning focus:bg-warning/10">
                <form action={logout}>
                  <button type="submit" className="flex w-full items-center gap-2">
                    <LogOut className="size-4" />
                    Grįžti į Admin
                  </button>
                </form>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem asChild>
            <form action={logout}>
              <button type="submit" className="flex w-full items-center gap-2">
                <LogOut className="size-4" />
                {AUTH_STRINGS.logoutLabel}
              </button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
