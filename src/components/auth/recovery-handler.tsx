'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function RecoveryHandler() {
  const router = useRouter()

  useEffect(() => {
    const hash = window.location.hash
    if (hash.includes('type=recovery') && hash.includes('access_token=')) {
      router.push('/update-password' + hash)
    }
  }, [router])

  return null
}
