'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function RecoveryHandler() {
  const router = useRouter()

  useEffect(() => {
    const hash   = window.location.hash
    const search = window.location.search
    const params = new URLSearchParams(search)

    // Valid recovery link in hash → update-password page
    if (hash.includes('type=recovery') && hash.includes('access_token=')) {
      router.push('/update-password' + hash)
      return
    }

    // Expired recovery link → reset-password with message
    if (hash.includes('error=access_denied') || hash.includes('otp_expired')) {
      router.push('/reset-password?expired=1')
      return
    }

    // OAuth state error (bad_oauth_state) → back to login with friendly message
    if (params.get('error_code') === 'bad_oauth_state') {
      router.push('/login?error=oauth_retry')
      return
    }
  }, [router])

  return null
}
