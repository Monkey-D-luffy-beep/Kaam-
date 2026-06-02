'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { flattenError } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { InviteMemberSchema, RemoveMemberSchema } from '@/lib/validations/team'
import type { ActionState } from '@/types'

async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return { supabase, user }
}

export async function inviteMember(
  _prevState: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const { supabase, user } = await getAuthUser()

  const parsed = InviteMemberSchema.safeParse({
    email: formData.get('email'),
    project_id: formData.get('project_id'),
    role: formData.get('role') || 'member',
  })

  if (!parsed.success) {
    return {
      success: false,
      message: 'Please fix the errors below.',
      errors: flattenError(parsed.error).fieldErrors as Record<string, string[]>,
    }
  }

  const { email, project_id, role } = parsed.data

  // Get organization for this project
  const { data: project } = await supabase
    .from('projects')
    .select('organization_id, name')
    .eq('id', project_id)
    .single()

  if (!project) {
    return { success: false, message: 'Project not found.' }
  }

  // Check if already a member
  const { data: existingMember } = await supabase
    .from('project_members')
    .select('id')
    .eq('project_id', project_id)
    .eq('user_id', (
      await supabase.from('profiles').select('id').eq('email', email).single()
    ).data?.id ?? '')
    .single()

  if (existingMember) {
    return { success: false, message: 'This person is already a member.' }
  }

  // Check for existing pending invite
  const { data: existingInvite } = await supabase
    .from('invitations')
    .select('id')
    .eq('email', email)
    .eq('project_id', project_id)
    .eq('status', 'pending')
    .single()

  if (existingInvite) {
    return { success: false, message: 'An invitation is already pending for this email.' }
  }

  const { error } = await supabase.from('invitations').insert({
    organization_id: project.organization_id,
    project_id,
    email,
    role,
    invited_by: user.id,
  })

  if (error) {
    return { success: false, message: 'Failed to send invitation.' }
  }

  revalidatePath(`/projects/${project_id}/settings`)
  return { success: true, message: `Invitation sent to ${email}.` }
}

export async function removeMember(projectId: string, userId: string): Promise<ActionState> {
  const { supabase } = await getAuthUser()

  const { error } = await supabase
    .from('project_members')
    .delete()
    .eq('project_id', projectId)
    .eq('user_id', userId)

  if (error) {
    return { success: false, message: 'Failed to remove member.' }
  }

  revalidatePath(`/projects/${projectId}/settings`)
  return { success: true, message: 'Member removed.' }
}
