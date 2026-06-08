'use client'

import { useState, useTransition } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import type { Project, TaskWithAssignee, Profile, MemberRole } from '@/types'
import { BOARD_COLUMNS } from '@/lib/constants'
import { moveTask, deleteTask } from '@/actions/tasks'
import { useRealtimeTasks } from '@/hooks/use-realtime-tasks'
import { TaskDetailSheet } from '@/components/board/task-detail-sheet'
import { BoardColumn } from '@/components/board/board-column'
import { BoardCard } from '@/components/board/board-card'
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
  const [activeTask, setActiveTask] = useState<TaskWithAssignee | null>(null)
  const [, startTransition] = useTransition()

  useRealtimeTasks(project.id, (updated) => {
    // Merge: replace real tasks, keep temp optimistic ones until realtime replaces them
    setTasks(prev => {
      const temps = prev.filter(t => t.id.startsWith('temp-'))
      const merged = [...updated]
      temps.forEach(t => { if (!merged.find(u => u.title === t.title && u.status === t.status)) merged.push(t) })
      return merged
    })
  }, tasks)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  function getColumnTasks(status: TaskStatus) {
    return tasks.filter(t => t.status === status).sort((a, b) => a.position - b.position)
  }

  function handleDragStart({ active }: DragStartEvent) {
    const task = tasks.find(t => t.id === active.id)
    if (task) setActiveTask(task)
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return
    const overId = over.id as string
    // over.id is either a column id or a task id
    const overColumn = BOARD_COLUMNS.find(c => c.id === overId)
    const overTask = tasks.find(t => t.id === overId)
    const newStatus = (overColumn?.id ?? overTask?.status) as TaskStatus | undefined
    if (!newStatus) return
    const task = tasks.find(t => t.id === active.id)
    if (!task || task.status === newStatus) return
    setTasks(prev => prev.map(t => t.id === active.id ? { ...t, status: newStatus } : t))
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveTask(null)
    if (!over) return
    const overId = over.id as string
    const overColumn = BOARD_COLUMNS.find(c => c.id === overId)
    const overTask = tasks.find(t => t.id === overId)
    const newStatus = (overColumn?.id ?? overTask?.status) as TaskStatus | undefined
    if (!newStatus) return

    const task = tasks.find(t => t.id === active.id)
    if (!task) return

    const newPosition = getColumnTasks(newStatus).length
    startTransition(async () => {
      const result = await moveTask(active.id as string, project.id, newStatus, newPosition)
      if (!result.success) {
        setTasks(initialTasks)
        toast.error(result.message)
      }
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

  function handleTaskCreated(task: Partial<TaskWithAssignee> & { id: string; title: string; status: TaskStatus }) {
    setTasks(prev => [...prev, { ...task, position: prev.filter(t => t.status === task.status).length } as TaskWithAssignee])
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full gap-4 overflow-x-auto p-4 sm:p-6">
        {BOARD_COLUMNS.map(col => (
          <BoardColumn
            key={col.id}
            column={col}
            tasks={getColumnTasks(col.id)}
            projectId={project.id}
            onTaskClick={setSelectedTask}
            onMove={(taskId, status) => {
              setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t))
              const newPosition = getColumnTasks(status).length
              startTransition(async () => {
                const result = await moveTask(taskId, project.id, status, newPosition)
                if (!result.success) { setTasks(initialTasks); toast.error(result.message) }
              })
            }}
            onDelete={handleDelete}
            onTaskCreated={handleTaskCreated}
          />
        ))}
      </div>

      {/* Ghost card shown while dragging */}
      <DragOverlay>
        {activeTask ? (
          <div className="rotate-2 opacity-90">
            <BoardCard
              task={activeTask}
              onClick={() => {}}
              onMove={() => {}}
              onDelete={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>

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
    </DndContext>
  )
}
