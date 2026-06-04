// app/api/admin/impersonate/route.ts — Admin portal: sign-in as a tenant
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Derive a stable seller username from the store name.
// e.g. "Archie's burger" → "archiesburger", "ALI ŠOKOLADINĖ" → "alisokoline"
function toSellerSlug(storeName: string): string {
  return storeName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .replace(/[^a-z0-9]/g, '')       // keep only alphanumeric
}

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  // Verify caller is an admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const tenantId = request.nextUrl.searchParams.get('tenantId')
  if (!tenantId) {
    return NextResponse.json({ error: 'Missing tenantId' }, { status: 400 })
  }

  const adminClient = createAdminClient()

  // Look up the tenant
  const { data: tenant, error: tenantError } = await adminClient
    .from('tenants')
    .select('user_id, store_name')
    .eq('id', tenantId)
    .single()

  if (tenantError || !tenant) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
  }

  let tenantUserId = tenant.user_id

  // Provision an auth user on first access if none exists yet
  if (!tenantUserId) {
    const slug = toSellerSlug(tenant.store_name)
    const email = `${slug}@pceuropa.lt`

    const { data: created, error: createError } =
      await adminClient.auth.admin.createUser({
        email,
        password: crypto.randomUUID(), // random — login is always via admin impersonation
        email_confirm: true,
        app_metadata: { role: 'seller' },
      })

    if (createError || !created.user) {
      return NextResponse.json(
        { error: `Failed to provision tenant user: ${createError?.message}` },
        { status: 500 }
      )
    }

    tenantUserId = created.user.id

    // Link the new auth user back to the tenant row
    await adminClient
      .from('tenants')
      .update({ user_id: tenantUserId })
      .eq('id', tenantId)
  }

  // Get the tenant user's email for magic link generation
  const { data: { user: tenantUser }, error: userError } =
    await adminClient.auth.admin.getUserById(tenantUserId)

  if (userError || !tenantUser?.email) {
    return NextResponse.json({ error: 'Tenant user not found' }, { status: 404 })
  }

  // Save admin refresh token before the session is overwritten
  const { data: { session: adminSession } } = await supabase.auth.getSession()
  if (adminSession?.refresh_token) {
    cookieStore.set('admin_refresh_token', adminSession.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
      path: '/',
    })
  }

  // Generate a one-time magic link token for the tenant user
  const { data: linkData, error: linkError } =
    await adminClient.auth.admin.generateLink({
      type: 'magiclink',
      email: tenantUser.email,
    })

  if (linkError || !linkData?.properties?.hashed_token) {
    return NextResponse.json(
      { error: 'Failed to generate impersonation token' },
      { status: 500 }
    )
  }

  // Exchange the token — overwrites the current session with the tenant's session
  const { error: otpError } = await supabase.auth.verifyOtp({
    token_hash: linkData.properties.hashed_token,
    type: 'email',
  })

  if (otpError) {
    return NextResponse.json(
      { error: 'Failed to start impersonation session' },
      { status: 500 }
    )
  }

  // Mark impersonation active for the "return to admin" banner in the seller dashboard
  cookieStore.set('impersonating', tenant.store_name, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60,
    path: '/',
  })

  return NextResponse.redirect(new URL('/seller/revenue', request.url))
}
