import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function GET() {
  const state = crypto.randomBytes(16).toString('hex')
  const nonce = crypto.randomBytes(16).toString('hex')
  // Google receives the SHA-256 hash of the nonce; we verify with the raw nonce later
  const hashedNonce = crypto.createHash('sha256').update(nonce).digest('hex')

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    nonce: hashedNonce,
    access_type: 'offline',
    prompt: 'select_account',
  })

  const response = NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  )

  const cookieOpts = { httpOnly: true, secure: true, sameSite: 'lax' as const, maxAge: 300, path: '/' }
  response.cookies.set('oauth_state', state, cookieOpts)
  response.cookies.set('oauth_nonce', nonce, cookieOpts)

  return response
}
