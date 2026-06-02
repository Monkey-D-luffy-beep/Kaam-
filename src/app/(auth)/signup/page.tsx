import type { Metadata } from 'next'
import Link from 'next/link'
import { SignUpForm } from '@/components/auth/signup-form'

export const metadata: Metadata = { title: 'Create Account' }

export default function SignUpPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Start managing your work in 60 seconds
        </p>
      </div>
      <SignUpForm />
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-foreground underline underline-offset-4 hover:text-primary">
          Sign in
        </Link>
      </p>
    </div>
  )
}
