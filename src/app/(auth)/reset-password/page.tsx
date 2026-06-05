import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export const metadata: Metadata = { title: 'Reset Password' }

export default function ResetPasswordPage() {
  return (
    <>
      <div className="mb-7">
        <h1 className="text-[22px] font-semibold tracking-tight text-[#111]">Reset your password</h1>
        <p className="mt-1 text-sm text-[#888]">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
      <p className="mt-5 text-center text-sm text-[#888]">
        Remembered it?{' '}
        <Link href="/login" className="font-medium text-[#111] underline underline-offset-4 hover:text-[#4F46E5] transition-colors">
          Sign in
        </Link>
      </p>
    </>
  )
}
