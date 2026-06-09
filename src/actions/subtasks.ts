'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { ActionState } from '@/types'

async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return { supabase, user }
}

export async function createSubtask(
  taskId: string,
  title: string
): Promise<ActionState & { data?: { id: string } }> {
  const { supabase } = await getUser()

  const { data, error } = await supabase
    .from('subtasks')
    .insert({ task_id: taskId, title, position: 0 })
    .select('id')
    .single()

  if (error || !data) return { success: false, message: 'Failed to create subtask.' }
  return { success: true, message: 'Subtask created.', data }
}

export async function updateSubtask(
  subtaskId: string,
  fields: {
    title?: string
    difficulty?: number
    urgency?: number
    time_min?: number | null
    time_max?: number | null
    is_completed?: boolean
  }
): Promise<ActionState> {
  const { supabase } = await getUser()

  const { error } = await supabase
    .from('subtasks')
    .update(fields)
    .eq('id', subtaskId)

  if (error) return { success: false, message: 'Failed to update subtask.' }
  return { success: true, message: 'Subtask updated.' }
}

export async function deleteSubtask(subtaskId: string): Promise<ActionState> {
  const { supabase } = await getUser()

  const { error } = await supabase
    .from('subtasks')
    .delete()
    .eq('id', subtaskId)

  if (error) return { success: false, message: 'Failed to delete subtask.' }
  return { success: true, message: 'Subtask deleted.' }
}

export async function getSubtasks(taskId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('subtasks')
    .select('*')
    .eq('task_id', taskId)
    .order('position', { ascending: true })
  return data ?? []
}
