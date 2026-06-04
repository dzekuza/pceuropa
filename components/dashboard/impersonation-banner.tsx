'use client'

import { LogOutIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ImpersonationBanner({ storeName }: { storeName: string }) {
    return (
        <div className="bg-amber-400 text-gray-950 px-4 py-2 flex items-center justify-between sticky top-0 z-50 shadow-md">
            <div className="flex items-center gap-2 text-sm font-semibold">
                <span className="animate-pulse inline-block w-2 h-2 bg-gray-950 rounded-full" />
                Peržiūrite: <span className="font-bold">{storeName}</span>
            </div>
            <Button
                variant="ghost"
                size="sm"
                className="h-11 gap-2 bg-black/10 hover:bg-black/20 text-gray-950 border-none font-bold"
                onClick={() => { window.location.href = '/api/admin/restore' }}
            >
                <LogOutIcon className="size-4" />
                Grįžti į Admin
            </Button>
        </div>
    )
}
