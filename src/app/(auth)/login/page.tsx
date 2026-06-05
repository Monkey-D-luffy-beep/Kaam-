import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = { title: 'Sign In' }

export default function LoginPage() {
  return (
    <>
      <div className="mb-7">
        <h1 className="text-[22px] font-semibold tracking-tight text-[#111]">Welcome back</h1>
        <p className="mt-1 text-sm text-[#888]">
          Sign in to your Kaam account
        </p>
      </div>
      <Suspense>
        <LoginForm />
      </Suspense>
      <p className="mt-5 text-center text-sm text-[#888]">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-medium text-[#111] underline underline-offset-4 hover:text-[#4F46E5] transition-colors">
          Sign up
        </Link>
      </p>
    </>
  )
}
