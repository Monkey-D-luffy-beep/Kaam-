'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z, flattenError } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { SignUpSchema, SignInSchema, ResetPasswordSchema } from '@/lib/validations/auth'
import type { ActionState } from '@/types'

export async function signUp(
  _prevState: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const parsed = SignUpSchema.safeParse({
    full_name: formData.get('full_name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return {
      success: false,
      message: 'Please fix the errors below.',
      errors: flattenError(parsed.error).fieldErrors as Record<string, string[]>,
    }
  }

  const { full_name, email, phone, password } = parsed.data
  const supabase = await createClient()

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name, phone },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
    },
  })

  // Store phone in profiles table immediately
  if (!error && authData.user) {
    await supabase
      .from('profiles')
      .upsert({ id: authData.user.id, email, full_name, phone }, { onConflict: 'id', ignoreDuplicates: false })
  }

  if (error) {
    return { success: false, message: error.message }
  }

  return {
    success: true,
    message: 'Check your email to confirm your account.',
  }
}

export async function signIn(
  _prevState: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const parsed = SignInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return {
      success: false,
      message: 'Please fix the errors below.',
      errors: flattenError(parsed.error).fieldErrors as Record<string, string[]>,
    }
  }

  const { email, password } = parsed.data
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { success: false, message: 'Invalid email or password.' }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function resetPassword(
  _prevState: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const parsed = ResetPasswordSchema.safeParse({
    email: formData.get('email'),
  })

  if (!parsed.success) {
    return {
      success: false,
      message: 'Please enter a valid email address.',
      errors: flattenError(parsed.error).fieldErrors as Record<string, string[]>,
    }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback?next=/reset-password/update`,
  })

  if (error) {
    return { success: false, message: error.message }
  }

  return {
    success: true,
    message: 'Password reset email sent. Check your inbox.',
  }
}
