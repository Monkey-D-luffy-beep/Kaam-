import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  const storedState = request.cookies.get('oauth_state')?.value
  const nonce = request.cookies.get('oauth_nonce')?.value

  // CSRF check
  if (!code || !state || state !== storedState || !nonce) {
    return NextResponse.redirect(new URL('/login?error=oauth_retry', request.url))
  }

  // Exchange auth code → tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
      grant_type: 'authorization_code',
    }),
  })

  const tokens = await tokenRes.json()

  if (!tokens.id_token) {
    return NextResponse.redirect(new URL('/login?error=oauth_retry', request.url))
  }

  // Build the redirect response first so Supabase can set session cookies on it
  const response = NextResponse.redirect(new URL('/dashboard', request.url))
  response.cookies.delete('oauth_state')
  response.cookies.delete('oauth_nonce')

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: tokens.id_token,
    nonce,
  })

  if (error) {
    return NextResponse.redirect(new URL('/login?error=oauth_retry', request.url))
  }

  return response
}
