'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { TaskWithAssignee } from '@/types'

export function useRealtimeTasks(
  projectId: string,
  onUpdate: (tasks: TaskWithAssignee[]) => void,
  currentTasks: TaskWithAssignee[]
) {
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`tasks:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `project_id=eq.${projectId}`,
        },
        async () => {
          // Re-fetch tasks when any change is detected
          const { data } = await supabase
            .from('tasks')
            .select('*, assignee:profiles!assignee_id(id, full_name, avatar_url)')
            .eq('project_id', projectId)
            .order('position', { ascending: true })

          if (data) onUpdate(data as TaskWithAssignee[])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId])
}
