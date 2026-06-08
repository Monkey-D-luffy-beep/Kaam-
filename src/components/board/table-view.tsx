'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { format } from 'date-fns'
import { Plus } from 'lucide-react'
import type { Project, TaskWithAssignee, Profile, MemberRole } from '@/types'
import type { TaskStatus } from '@/types'
import { PRIORITY_CONFIG } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { createTask, deleteTask } from '@/actions/tasks'
import { useRealtimeTasks } from '@/hooks/use-realtime-tasks'
import { TaskDetailSheet } from '@/components/board/task-detail-sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'

interface TableMember {
  user_id: string
  role: MemberRole
  profile: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
}

interface TableViewProps {
  project: Project
  tasks: TaskWithAssignee[]
  members: TableMember[]
  currentUserId: string
}

const STATUS_STYLES: Record<TaskStatus, { label: string; className: string }> = {
  todo:        { label: 'To Do',       className: 'bg-slate-100 text-slate-600 border-slate-200' },
  in_progress: { label: 'In Progress', className: 'bg-blue-50 text-blue-600 border-blue-200' },
  done:        { label: 'Done',        className: 'bg-green-50 text-green-600 border-green-200' },
}

const PRIORITY_STYLES: Record<string, string> = {
  low:    'bg-slate-100 text-slate-500 border-slate-200',
  medium: 'bg-amber-50 text-amber-600 border-amber-200',
  high:   'bg-orange-50 text-orange-600 border-orange-200',
  urgent: 'bg-red-50 text-red-600 border-red-200',
}

const EFFORT_STYLES: Record<string, { label: string; className: string }> = {
  quick:  { label: '⚡ Quick',  className: 'bg-green-50 text-green-600 border-green-200' },
  medium: { label: '🕐 Medium', className: 'bg-amber-50 text-amber-600 border-amber-200' },
  large:  { label: '🔥 Large',  className: 'bg-red-50 text-red-600 border-red-200' },
}

function InlineRowCreate({
  projectId,
  onCreated,
  onCancel,
}: {
  projectId: string
  onCreated: (task: Partial<TaskWithAssignee> & { id: string; title: string; status: TaskStatus }) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState('')
  const [, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  function submit() {
    const trimmed = title.trim()
    if (!trimmed) return
    onCreated({ id: `temp-${Date.now()}`, title: trimmed, status: 'todo' })
    setTitle('')
    const fd = new FormData()
    fd.set('title', trimmed)
    fd.set('project_id', projectId)
    fd.set('status', 'todo')
    startTransition(async () => {
      const result = await createTask(undefined, fd)
      if (!result.success) toast.error(result.message ?? 'Failed to create task')
    })
  }

  return (
    <tr className="border-b bg-[#4F46E5]/5">
      <td className="w-8 px-3 py-2"><Plus className="h-3.5 w-3.5 text-[#4F46E5]" /></td>
      <td className="px-3 py-2" colSpan={6}>
        <input
          ref={inputRef}
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') { e.preventDefault(); submit() }
            if (e.key === 'Escape') onCancel()
          }}
          onBlur={() => { if (!title.trim()) onCancel() }}
          placeholder="Task name… (↵ to add, Esc to cancel)"
          className="w-full text-sm outline-none bg-transparent placeholder:text-muted-foreground"
        />
      </td>
    </tr>
  )
}

export function TableView({ project, tasks: initialTasks, members, currentUserId }: TableViewProps) {
  const [tasks, setTasks] = useState(initialTasks)
  const [selectedTask, setSelectedTask] = useState<TaskWithAssignee | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [, startTransition] = useTransition()

  useRealtimeTasks(project.id, (updated) => {
    setTasks(prev => {
      const temps = prev.filter(t => t.id.startsWith('temp-'))
      const merged = [...updated]
      temps.forEach(t => { if (!merged.find(u => u.title === t.title && u.status === t.status)) merged.push(t) })
      return merged
    })
  }, tasks)

  function handleTaskCreated(task: Partial<TaskWithAssignee> & { id: string; title: string; status: TaskStatus }) {
    setTasks(prev => [...prev, { ...task, position: prev.length } as TaskWithAssignee])
  }

  async function handleDelete(taskId: string) {
    setTasks(prev => prev.filter(t => t.id !== taskId))
    startTransition(async () => {
      const result = await deleteTask(taskId, project.id)
      if (!result.success) { setTasks(initialTasks); toast.error(result.message) }
    })
  }

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="min-w-[700px]">
        <table className="w-full border-collapse text-sm">
          {/* Header */}
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="w-8 px-3 py-2.5" />
              <th className="px-3 py-2.5 text-left font-medium text-muted-foreground text-xs tracking-wide">
                Task name
              </th>
              <th className="w-32 px-3 py-2.5 text-left font-medium text-muted-foreground text-xs tracking-wide">
                Status
              </th>
              <th className="w-28 px-3 py-2.5 text-left font-medium text-muted-foreground text-xs tracking-wide">
                Priority
              </th>
              <th className="w-28 px-3 py-2.5 text-left font-medium text-muted-foreground text-xs tracking-wide">
                Effort
              </th>
              <th className="w-28 px-3 py-2.5 text-left font-medium text-muted-foreground text-xs tracking-wide">
                Due date
              </th>
              <th className="w-10 px-3 py-2.5" />
            </tr>
          </thead>

          <tbody>
            {tasks.map((task) => {
              const status = STATUS_STYLES[task.status]
              const priority = PRIORITY_CONFIG[task.priority]
              const effort = EFFORT_STYLES[task.effort ?? 'medium']
              const dueDate = task.due_date ? new Date(task.due_date) : null
              const isTemp = task.id.startsWith('temp-')

              return (
                <tr
                  key={task.id}
                  onClick={() => !isTemp && setSelectedTask(task)}
                  className={cn(
                    'border-b transition-colors group',
                    isTemp ? 'opacity-50' : 'cursor-pointer hover:bg-muted/40'
                  )}
                >
                  {/* Row indicator */}
                  <td className="w-8 px-3 py-2.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/20 group-hover:bg-[#4F46E5]/40 transition-colors" />
                  </td>

                  {/* Task name */}
                  <td className="px-3 py-2.5">
                    <span className="font-medium text-[#111]">{task.title}</span>
                    {task.description && (
                      <span className="ml-2 text-xs text-muted-foreground line-clamp-1 hidden sm:inline">
                        {task.description}
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-3 py-2.5">
                    <span className={cn('inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium', status.className)}>
                      {status.label}
                    </span>
                  </td>

                  {/* Priority */}
                  <td className="px-3 py-2.5">
                    <span className={cn('inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium capitalize', PRIORITY_STYLES[task.priority])}>
                      {task.priority}
                    </span>
                  </td>

                  {/* Effort */}
                  <td className="px-3 py-2.5">
                    {task.effort && (
                      <span className={cn('inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium', effort.className)}>
                        {effort.label}
                      </span>
                    )}
                  </td>

                  {/* Due date */}
                  <td className="px-3 py-2.5 text-xs text-muted-foreground">
                    {dueDate ? format(dueDate, 'MMM d, yyyy') : '—'}
                  </td>

                  {/* Assignee */}
                  <td className="px-3 py-2.5">
                    {task.assignee && (
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={(task.assignee as any).avatar_url ?? ''} />
                        <AvatarFallback className="text-[9px]">
                          {((task.assignee as any).full_name ?? 'U').slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </td>
                </tr>
              )
            })}

            {/* Inline create row */}
            {showCreate && (
              <InlineRowCreate
                projectId={project.id}
                onCreated={(t) => { handleTaskCreated(t) }}
                onCancel={() => setShowCreate(false)}
              />
            )}
          </tbody>
        </table>

        {/* Add task footer */}
        {!showCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex w-full items-center gap-2 px-6 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors border-b"
          >
            <Plus className="h-3.5 w-3.5" />
            New task
          </button>
        )}
      </div>

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
