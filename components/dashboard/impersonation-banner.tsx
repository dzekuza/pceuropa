'use client'

import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { logout } from '@/actions/auth'

export function ImpersonationBanner() {
    return (
        <div className="bg-warning text-warning-foreground px-4 py-2 flex items-center justify-between sticky top-0 z-50 shadow-md">
            <div className="flex items-center gap-2 text-sm font-semibold">
                <div className="bg-white/10 p-1 rounded-md flex items-center gap-2">
                    <span className="animate-pulse inline-block w-2 h-2 bg-current rounded-full" />
                    Esate prisijungę kaip nuomininkas (Impersonacija)
                </div>
            </div>
            <form action={logout}>
                <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-2 bg-warning-foreground/10 hover:bg-warning-foreground/20 text-warning-foreground border-none font-bold"
                >
                    <LogOut className="size-4" />
                    Grįžti į Admin
                </Button>
            </form>
        </div>
    )
}
