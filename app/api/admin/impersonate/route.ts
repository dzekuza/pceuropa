// app/api/admin/impersonate/route.ts — Admin portal: sign-in as a tenant
// Defense-in-depth: verifies admin role before generating any link
// The generated magic link signs the browser in as the tenant user
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')

    if (!tenantId) {
        return NextResponse.json({ error: 'Missing tenantId' }, { status: 400 })
    }

    // 1. Verify the caller is an admin (defense-in-depth)
    const supabase = await createClient()
    const {
        data: { user: callerUser },
    } = await supabase.auth.getUser()

    if (!callerUser || callerUser.app_metadata?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // 2. Fetch the tenant's user_id and email from the tenants table
    const adminClient = createAdminClient()

    const { data: tenant, error: tenantError } = await adminClient
        .from('tenants')
        .select('user_id')
        .eq('id', tenantId)
        .single()

    if (tenantError || !tenant?.user_id) {
        return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // 3. Get the auth user's email via admin API
    const { data: authUser, error: authUserError } =
        await adminClient.auth.admin.getUserById(tenant.user_id)

    if (authUserError || !authUser?.user?.email) {
        return NextResponse.json({ error: 'Auth user not found' }, { status: 404 })
    }

    const email = authUser.user.email

    // 4. Generate an OTP (one-time password) for the tenant user.
    // This allows us to sign in the server-side client as the tenant.
    const { data: linkData, error: linkError } =
        await adminClient.auth.admin.generateLink({
            type: 'magiclink',
            email,
        })

    if (linkError || !linkData?.properties?.email_otp) {
        console.error('[impersonate] generateLink error:', linkError)
        return NextResponse.json(
            { error: 'Failed to generate sign-in link' },
            { status: 500 }
        )
    }

    // 5. Use the generated OTP to sign in on the server.
    // This establishes the session and sets the cookies for the browser.
    const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: linkData.properties.email_otp,
        type: 'magiclink',
    })

    if (verifyError) {
        console.error('[impersonate] verifyOtp error:', verifyError)
        return NextResponse.json(
            { error: 'Failed to verify sign-in link' },
            { status: 500 }
        )
    }

    // 6. Redirect the admin's browser to the seller dashboard.
    // The session is now the tenant's because of verifyOtp above.
    const response = NextResponse.redirect(new URL('/seller/revenue', request.url))

    // Set a cookie to indicate we are in impersonation mode
    response.cookies.set('impersonating', 'true', {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60, // 1 hour
    })

    return response
}
