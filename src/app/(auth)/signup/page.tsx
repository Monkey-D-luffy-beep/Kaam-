import type { Metadata } from 'next'
import Link from 'next/link'
import { SignUpForm } from '@/components/auth/signup-form'

export const metadata: Metadata = { title: 'Create Account' }

export default function SignUpPage() {
  return (
    <>
      <div className="mb-7">
        <h1 className="text-[22px] font-semibold tracking-tight text-[#111]">Create your account</h1>
        <p className="mt-1 text-sm text-[#888]">
          Start managing your work in 60 seconds
        </p>
      </div>
      <SignUpForm />
      <p className="mt-5 text-center text-sm text-[#888]">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-[#111] underline underline-offset-4 hover:text-[#4F46E5] transition-colors">
          Sign in
        </Link>
      </p>
    </>
  )
}
