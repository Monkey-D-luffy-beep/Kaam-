import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export const metadata: Metadata = { title: 'Reset Password' }

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Reset your password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Remembered it?{' '}
        <Link href="/login" className="font-medium text-foreground underline underline-offset-4 hover:text-primary">
          Sign in
        </Link>
      </p>
    </div>
  )
}
