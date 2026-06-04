'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function RecoveryHandler() {
  const router = useRouter()

  useEffect(() => {
    const hash = window.location.hash

    // Valid recovery link → go to update-password
    if (hash.includes('type=recovery') && hash.includes('access_token=')) {
      router.push('/update-password' + hash)
      return
    }

    // Expired / invalid link → redirect to reset-password with message
    if (hash.includes('error=access_denied') || hash.includes('otp_expired')) {
      router.push('/reset-password?expired=1')
    }
  }, [router])

  return null
}
