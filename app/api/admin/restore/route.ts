// app/api/admin/restore/route.ts — Restore admin session after impersonation
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    const cookieStore = await cookies()
    const adminRefreshToken = cookieStore.get('admin_refresh_token')?.value

    cookieStore.delete('impersonating')
    cookieStore.delete('admin_refresh_token')

    if (!adminRefreshToken) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    const supabase = await createClient()
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: adminRefreshToken })

    if (error || !data.user) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Verify the restored session actually belongs to an admin
    if (data.user.app_metadata?.role !== 'admin') {
        await supabase.auth.signOut()
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.redirect(new URL('/admin', request.url))
}
