'use client'

import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

async function fetchTasks(projectId: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*, assignee:profiles!assignee_id(id, full_name, avatar_url)')
    .eq('project_id', projectId)
    .order('position', { ascending: true })

  if (error) throw error
  return data
}

export function useTasks(projectId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    projectId ? `tasks:${projectId}` : null,
    () => fetchTasks(projectId),
    {
      revalidateOnFocus: false,
      dedupingInterval: 10_000,
    }
  )

  return {
    tasks: data ?? [],
    isLoading,
    error,
    mutate,
  }
}
