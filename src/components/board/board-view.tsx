'use client'

import { useState, useTransition } from 'react'
import type { Project, TaskWithAssignee, Profile, MemberRole } from '@/types'
import { BOARD_COLUMNS } from '@/lib/constants'
import { moveTask, deleteTask } from '@/actions/tasks'
import { useRealtimeTasks } from '@/hooks/use-realtime-tasks'
import { TaskDetailSheet } from '@/components/board/task-detail-sheet'
import { BoardColumn } from '@/components/board/board-column'
import { toast } from 'sonner'
import type { TaskStatus } from '@/types'

interface BoardMember {
  user_id: string
  role: MemberRole
  profile: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
}

interface BoardViewProps {
  project: Project
  tasks: TaskWithAssignee[]
  members: BoardMember[]
  currentUserId: string
}

export function BoardView({ project, tasks: initialTasks, members, currentUserId }: BoardViewProps) {
  const [tasks, setTasks] = useState(initialTasks)
  const [selectedTask, setSelectedTask] = useState<TaskWithAssignee | null>(null)
  const [, startTransition] = useTransition()

  useRealtimeTasks(project.id, setTasks, tasks)

  function getColumnTasks(status: TaskStatus) {
    return tasks.filter(t => t.status === status)
  }

  async function handleMove(taskId: string, newStatus: TaskStatus) {
    const task = tasks.find(t => t.id === taskId)
    if (!task || task.status === newStatus) return

    const newPosition = getColumnTasks(newStatus).length
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus, position: newPosition } : t))

    startTransition(async () => {
      const result = await moveTask(taskId, project.id, newStatus, newPosition)
      if (!result.success) { setTasks(initialTasks); toast.error(result.message) }
    })
  }

  async function handleDelete(taskId: string) {
    setTasks(prev => prev.filter(t => t.id !== taskId))
    startTransition(async () => {
      const result = await deleteTask(taskId, project.id)
      if (!result.success) { setTasks(initialTasks); toast.error(result.message) }
      else toast.success(result.message)
    })
  }

  return (
    <div className="flex h-full gap-4 overflow-x-auto p-4 sm:p-6">
      {BOARD_COLUMNS.map(col => (
        <BoardColumn
          key={col.id}
          column={col}
          tasks={getColumnTasks(col.id)}
          projectId={project.id}
          onTaskClick={setSelectedTask}
          onMove={handleMove}
          onDelete={handleDelete}
        />
      ))}

      {selectedTask && (
        <TaskDetailSheet
          task={selectedTask}
          projectId={project.id}
          members={members}
          currentUserId={currentUserId}
          open={true}
          onOpenChange={open => !open && setSelectedTask(null)}
        />
      )}
    </div>
  )
}
