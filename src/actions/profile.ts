'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z, flattenError } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { ActionState } from '@/types'

const UpdateProfileSchema = z.object({
  full_name: z.string().min(2, { error: 'Name must be at least 2 characters.' }).max(100).trim(),
})

async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return { supabase, user }
}

export async function updateProfile(
  _prevState: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const { supabase, user } = await getAuthUser()

  const parsed = UpdateProfileSchema.safeParse({
    full_name: formData.get('full_name'),
  })

  if (!parsed.success) {
    return {
      success: false,
      message: 'Please fix the errors below.',
      errors: flattenError(parsed.error).fieldErrors as Record<string, string[]>,
    }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: parsed.data.full_name })
    .eq('id', user.id)

  if (error) {
    return { success: false, message: 'Failed to update profile.' }
  }

  revalidatePath('/profile')
  revalidatePath('/', 'layout')
  return { success: true, message: 'Profile updated.' }
}

export async function uploadAvatar(formData: FormData): Promise<ActionState> {
  const { supabase, user } = await getAuthUser()

  const file = formData.get('avatar') as File
  if (!file || file.size === 0) {
    return { success: false, message: 'No file selected.' }
  }

  if (file.size > 2 * 1024 * 1024) {
    return { success: false, message: 'Image must be under 2MB.' }
  }

  const ext = file.name.split('.').pop()
  const path = `avatars/${user.id}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true })

  if (uploadError) {
    return { success: false, message: 'Failed to upload avatar.' }
  }

  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)

  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', user.id)

  if (error) {
    return { success: false, message: 'Failed to update avatar.' }
  }

  revalidatePath('/profile')
  revalidatePath('/', 'layout')
  return { success: true, message: 'Avatar updated.' }
}
