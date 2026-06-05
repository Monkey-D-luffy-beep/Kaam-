'use client'

import { useActionState } from 'react'
import { signUp } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { GoogleAuthButton } from './google-auth-button'

export function SignUpForm() {
  const [state, action, pending] = useActionState(signUp, undefined)
  const errors = state && !state.success ? state.errors : undefined

  if (state?.success) {
    return (
      <Alert>
        <AlertDescription className="text-center">{state.message}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <GoogleAuthButton mode="sign-up" />
      <div className="relative my-1">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-[#E5E5E5]" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-[#AAA] uppercase tracking-widest">or</span>
        </div>
      </div>
    <form action={action} className="space-y-4">
      {state && !state.success && (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="full_name">Full name</Label>
        <Input id="full_name" name="full_name" type="text" placeholder="Alex Johnson" autoComplete="name" required />
        {errors?.full_name && <p className="text-xs text-destructive">{errors.full_name[0]}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Work email</Label>
        <Input id="email" name="email" type="email" placeholder="you@company.com" autoComplete="email" required />
        {errors?.email && <p className="text-xs text-destructive">{errors.email[0]}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone">
          Phone number
          <span className="ml-1.5 text-xs text-muted-foreground font-normal">— we may reach out to help you get started</span>
        </Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="+91 98765 43210"
          autoComplete="tel"
          required
        />
        {errors?.phone && <p className="text-xs text-destructive">{errors.phone[0]}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" placeholder="Min. 8 characters" autoComplete="new-password" required />
        {errors?.password && <p className="text-xs text-destructive">{errors.password[0]}</p>}
      </div>

      <Button type="submit" className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white font-medium" disabled={pending}>
        {pending ? 'Creating account…' : 'Create account'}
      </Button>
    </form>
    </div>
  )
}
