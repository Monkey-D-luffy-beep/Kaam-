'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { flattenError } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { CreateTaskSchema, UpdateTaskSchema, MoveTaskSchema, AddCommentSchema, ApprovalSchema } from '@/lib/validations/task'
import { ROLE_CONFIG } from '@/lib/constants'
import type { ActionState, TaskStatus, MemberRole } from '@/types'

async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return { supabase, user }
}

async function logActivity(
  supabase: Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>>,
  payload: {
    organizationId: string
    projectId?: string
    taskId?: string
    userId: string
    action: string
    metadata?: Record<string, unknown>
  }
) {
  await supabase.from('activity_logs').insert({
    organization_id: payload.organizationId,
    project_id: payload.projectId,
    task_id: payload.taskId,
    user_id: payload.userId,
    action: payload.action,
    metadata: payload.metadata ?? {},
  })
}

export async function createTask(
  _prevState: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const { supabase, user } = await getAuthUser()

  const parsed = CreateTaskSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    status: formData.get('status') || 'todo',
    priority: formData.get('priority') || 'medium',
    effort: formData.get('effort') || 'medium',
    assignee_id: formData.get('assignee_id') || null,
    due_date: formData.get('due_date') || null,
    project_id: formData.get('project_id'),
  })

  if (!parsed.success) {
    return {
      success: false,
      message: 'Please fix the errors below.',
      errors: flattenError(parsed.error).fieldErrors as Record<string, string[]>,
    }
  }

  const { data: maxPos } = await supabase
    .from('tasks')
    .select('position')
    .eq('project_id', parsed.data.project_id)
    .eq('status', parsed.data.status)
    .order('position', { ascending: false })
    .limit(1)
    .single()

  const position = (maxPos?.position ?? -1) + 1

  const { data: task, error } = await supabase
    .from('tasks')
    .insert({ ...parsed.data, created_by: user.id, position })
    .select('id')
    .single()

  if (error || !task) {
    return { success: false, message: 'Failed to create task.' }
  }

  const { data: project } = await supabase
    .from('projects')
    .select('organization_id')
    .eq('id', parsed.data.project_id)
    .single()

  if (project) {
    await logActivity(supabase, {
      organizationId: project.organization_id,
      projectId: parsed.data.project_id,
      taskId: task.id,
      userId: user.id,
      action: 'task_created',
      metadata: { title: parsed.data.title },
    })
  }

  revalidatePath(`/projects/${parsed.data.project_id}/board`)
  revalidatePath(`/projects/${parsed.data.project_id}/timeline`)
  revalidatePath(`/projects/${parsed.data.project_id}/workload`)
  return { success: true, message: 'Task created.', data: task }
}

export async function updateTask(
  taskId: string,
  projectId: string,
  _prevState: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const { supabase } = await getAuthUser()

  const parsed = UpdateTaskSchema.safeParse({
    title: formData.get('title') || undefined,
    description: formData.get('description') || undefined,
    status: formData.get('status') || undefined,
    priority: formData.get('priority') || undefined,
    effort: formData.get('effort') || undefined,
    assignee_id: formData.get('assignee_id') === '' ? null : formData.get('assignee_id') || undefined,
    due_date: formData.get('due_date') === '' ? null : formData.get('due_date') || undefined,
  })

  if (!parsed.success) {
    return {
      success: false,
      message: 'Please fix the errors below.',
      errors: flattenError(parsed.error).fieldErrors as Record<string, string[]>,
    }
  }

  const { error } = await supabase
    .from('tasks')
    .update(parsed.data)
    .eq('id', taskId)

  if (error) {
    return { success: false, message: 'Failed to update task.' }
  }

  revalidatePath(`/projects/${projectId}/board`)
  revalidatePath(`/projects/${projectId}/timeline`)
  revalidatePath(`/projects/${projectId}/workload`)
  return { success: true, message: 'Task updated.' }
}

export async function moveTask(
  taskId: string,
  projectId: string,
  newStatus: TaskStatus,
  position: number
): Promise<ActionState> {
  const { supabase, user } = await getAuthUser()

  const { data: task } = await supabase
    .from('tasks')
    .select('status')
    .eq('id', taskId)
    .single()

  const { error } = await supabase
    .from('tasks')
    .update({ status: newStatus, position })
    .eq('id', taskId)

  if (error) {
    return { success: false, message: 'Failed to move task.' }
  }

  if (task?.status !== newStatus && newStatus === 'done') {
    const { data: project } = await supabase
      .from('projects')
      .select('organization_id')
      .eq('id', projectId)
      .single()

    if (project) {
      await logActivity(supabase, {
        organizationId: project.organization_id,
        projectId,
        taskId,
        userId: user.id,
        action: 'task_completed',
      })
    }
  }

  revalidatePath(`/projects/${projectId}/board`)
  revalidatePath(`/projects/${projectId}/workload`)
  return { success: true, message: 'Task moved.' }
}

export async function deleteTask(taskId: string, projectId: string): Promise<ActionState> {
  const { supabase } = await getAuthUser()

  const { error } = await supabase.from('tasks').delete().eq('id', taskId)

  if (error) {
    return { success: false, message: 'Failed to delete task.' }
  }

  revalidatePath(`/projects/${projectId}/board`)
  revalidatePath(`/projects/${projectId}/timeline`)
  revalidatePath(`/projects/${projectId}/workload`)
  return { success: true, message: 'Task deleted.' }
}

export async function handleApproval(
  taskId: string,
  projectId: string,
  action: 'request' | 'approve' | 'reject',
  note?: string
): Promise<ActionState> {
  const { supabase, user } = await getAuthUser()

  // Check role for approve/reject
  if (action === 'approve' || action === 'reject') {
    const { data: member } = await supabase
      .from('project_members')
      .select('role')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .single()

    const role = (member?.role ?? 'member') as MemberRole
    if (!ROLE_CONFIG[role]?.canApprove) {
      return { success: false, message: 'You do not have permission to approve tasks.' }
    }
  }

  const updateData: Record<string, unknown> = {}

  if (action === 'request') {
    updateData.approval_status = 'pending_approval'
    updateData.approved_by = null
    updateData.approval_note = null
  } else if (action === 'approve') {
    updateData.approval_status = 'approved'
    updateData.approved_by = user.id
    updateData.approval_note = note ?? null
  } else {
    updateData.approval_status = 'rejected'
    updateData.approved_by = user.id
    updateData.approval_note = note ?? null
  }

  const { error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', taskId)

  if (error) {
    return { success: false, message: 'Failed to update approval status.' }
  }

  const { data: project } = await supabase
    .from('projects')
    .select('organization_id')
    .eq('id', projectId)
    .single()

  if (project) {
    await logActivity(supabase, {
      organizationId: project.organization_id,
      projectId,
      taskId,
      userId: user.id,
      action: `task_${action === 'request' ? 'approval_requested' : action === 'approve' ? 'approved' : 'rejected'}`,
      metadata: { note },
    })
  }

  revalidatePath(`/projects/${projectId}/board`)
  revalidatePath('/dashboard')
  return {
    success: true,
    message: action === 'request' ? 'Review requested.' : action === 'approve' ? 'Task approved.' : 'Task rejected.',
  }
}

export async function updateMemberRole(
  projectId: string,
  userId: string,
  role: MemberRole
): Promise<ActionState> {
  const { supabase, user } = await getAuthUser()

  const { data: currentMember } = await supabase
    .from('project_members')
    .select('role')
    .eq('project_id', projectId)
    .eq('user_id', user.id)
    .single()

  const currentRole = (currentMember?.role ?? 'member') as MemberRole
  if (currentRole !== 'owner' && currentRole !== 'admin') {
    return { success: false, message: 'Only owners and admins can change roles.' }
  }

  const { error } = await supabase
    .from('project_members')
    .update({ role })
    .eq('project_id', projectId)
    .eq('user_id', userId)

  if (error) {
    return { success: false, message: 'Failed to update role.' }
  }

  revalidatePath(`/projects/${projectId}/settings`)
  revalidatePath(`/projects/${projectId}/workload`)
  return { success: true, message: 'Role updated.' }
}

export async function addComment(
  _prevState: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const { supabase, user } = await getAuthUser()

  const parsed = AddCommentSchema.safeParse({
    task_id: formData.get('task_id'),
    content: formData.get('content'),
  })

  if (!parsed.success) {
    return {
      success: false,
      message: 'Please fix the errors below.',
      errors: flattenError(parsed.error).fieldErrors as Record<string, string[]>,
    }
  }

  const { error } = await supabase.from('task_comments').insert({
    task_id: parsed.data.task_id,
    user_id: user.id,
    content: parsed.data.content,
  })

  if (error) {
    return { success: false, message: 'Failed to add comment.' }
  }

  return { success: true, message: 'Comment added.' }
}
