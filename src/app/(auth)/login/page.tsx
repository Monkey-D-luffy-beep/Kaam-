import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = { title: 'Sign In' }

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to your Kaam account
        </p>
      </div>
      <Suspense>
        <LoginForm />
      </Suspense>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-medium text-foreground underline underline-offset-4 hover:text-primary">
          Sign up
        </Link>
      </p>
    </div>
  )
}
