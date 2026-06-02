'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { flattenError } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { CreateProjectSchema, UpdateProjectSchema } from '@/lib/validations/project'
import type { ActionState } from '@/types'

async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return { supabase, user }
}

export async function createProject(
  _prevState: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const { supabase, user } = await getAuthUser()

  const parsed = CreateProjectSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') || undefined,
    color: formData.get('color'),
  })

  if (!parsed.success) {
    return {
      success: false,
      message: 'Please fix the errors below.',
      errors: flattenError(parsed.error).fieldErrors as Record<string, string[]>,
    }
  }

  // Ensure profile exists (guard against trigger not firing on first signup)
  await supabase.from('profiles').upsert(
    {
      id: user.id,
      email: user.email ?? '',
      full_name: (user.user_metadata?.full_name as string) ?? null,
      avatar_url: (user.user_metadata?.avatar_url as string) ?? null,
    },
    { onConflict: 'id', ignoreDuplicates: true }
  )

  // Get or create the user's personal organization
  let { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!org) {
    const workspaceName =
      (user.user_metadata?.full_name as string | undefined) ??
      user.email?.split('@')[0] ??
      'My Workspace'
    const slug =
      workspaceName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now()

    const orgId = crypto.randomUUID()
    const { error: orgError } = await supabase
      .from('organizations')
      .insert({ id: orgId, name: workspaceName, slug, owner_id: user.id })

    if (orgError) {
      return { success: false, message: `Failed to create workspace. (${orgError.message})` }
    }
    org = { id: orgId }
  }

  // Generate ID client-side so we never need .select() after insert.
  // INSERT + .select() fails because the SELECT policy requires being in
  // project_members, but we haven't added ourselves yet.
  const projectId = crypto.randomUUID()

  const { error } = await supabase
    .from('projects')
    .insert({
      id: projectId,
      ...parsed.data,
      organization_id: org.id,
      created_by: user.id,
    })

  if (error) {
    return { success: false, message: `Failed to create project. (${error.message})` }
  }

  // Add creator as owner immediately after so SELECT policy unlocks
  const { error: memberError } = await supabase.from('project_members').insert({
    project_id: projectId,
    user_id: user.id,
    role: 'owner',
  })

  if (memberError) {
    return { success: false, message: `Failed to add you to project. (${memberError.message})` }
  }

  const project = { id: projectId }

  revalidatePath('/projects')
  return { success: true, message: 'Project created.', data: project }
}

export async function updateProject(
  projectId: string,
  _prevState: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const { supabase } = await getAuthUser()

  const parsed = UpdateProjectSchema.safeParse({
    name: formData.get('name') || undefined,
    description: formData.get('description') || undefined,
    color: formData.get('color') || undefined,
  })

  if (!parsed.success) {
    return {
      success: false,
      message: 'Please fix the errors below.',
      errors: flattenError(parsed.error).fieldErrors as Record<string, string[]>,
    }
  }

  const { error } = await supabase
    .from('projects')
    .update(parsed.data)
    .eq('id', projectId)

  if (error) {
    return { success: false, message: 'Failed to update project.' }
  }

  revalidatePath('/projects')
  revalidatePath(`/projects/${projectId}`)
  return { success: true, message: 'Project updated.' }
}

export async function archiveProject(projectId: string): Promise<ActionState> {
  const { supabase } = await getAuthUser()

  const { error } = await supabase
    .from('projects')
    .update({ status: 'archived' })
    .eq('id', projectId)

  if (error) {
    return { success: false, message: 'Failed to archive project.' }
  }

  revalidatePath('/projects')
  return { success: true, message: 'Project archived.' }
}

export async function unarchiveProject(projectId: string): Promise<ActionState> {
  const { supabase } = await getAuthUser()

  const { error } = await supabase
    .from('projects')
    .update({ status: 'active' })
    .eq('id', projectId)

  if (error) {
    return { success: false, message: 'Failed to restore project.' }
  }

  revalidatePath('/projects')
  return { success: true, message: 'Project restored.' }
}
