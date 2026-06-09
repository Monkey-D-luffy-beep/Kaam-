'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { format } from 'date-fns'
import { Plus } from 'lucide-react'
import type { Project, TaskWithAssignee, Profile, MemberRole } from '@/types'
import type { TaskStatus } from '@/types'
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

const STATUS_CONFIG: Record<TaskStatus, { label: string; dot: string; text: string }> = {
  todo:        { label: 'To Do',       dot: 'bg-slate-400',  text: 'text-slate-500' },
  in_progress: { label: 'In Progress', dot: 'bg-blue-400',   text: 'text-blue-500'  },
  done:        { label: 'Done',        dot: 'bg-green-400',  text: 'text-green-500' },
}

const PRIORITY_DOT: Record<string, string> = {
  low: 'bg-slate-300', medium: 'bg-amber-400', high: 'bg-orange-500', urgent: 'bg-red-500',
}

const EFFORT_LABEL: Record<string, string> = {
  quick: '⚡ Quick', medium: '🕐 Medium', large: '🔥 Large',
}

function InlineRowCreate({
  projectId, onCreated, onCancel,
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
    <tr className="border-b border-[#E8E8E5]">
      <td className="w-8 pl-4 pr-2 py-2">
        <Plus className="h-3.5 w-3.5 text-[#4F46E5]" />
      </td>
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
          placeholder="New task… (↵ to add)"
          className="w-full text-sm outline-none bg-transparent placeholder:text-[#CCC] text-[#1A1A1A]"
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

  return (
    <div className="flex flex-col h-full bg-white overflow-auto">
      <div className="min-w-[680px] max-w-5xl mx-auto w-full px-8 pt-6">

        {/* Header */}
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[#E8E8E5]">
              <th className="w-8 pl-4 pr-2 py-2" />
              <th className="px-3 py-2 text-left text-[11px] font-medium text-[#999] tracking-wide uppercase">Task</th>
              <th className="w-32 px-3 py-2 text-left text-[11px] font-medium text-[#999] tracking-wide uppercase">Status</th>
              <th className="w-24 px-3 py-2 text-left text-[11px] font-medium text-[#999] tracking-wide uppercase">Priority</th>
              <th className="w-24 px-3 py-2 text-left text-[11px] font-medium text-[#999] tracking-wide uppercase">Effort</th>
              <th className="w-28 px-3 py-2 text-left text-[11px] font-medium text-[#999] tracking-wide uppercase">Due</th>
              <th className="w-10 px-3 py-2" />
            </tr>
          </thead>

          <tbody>
            {tasks.map(task => {
              const status = STATUS_CONFIG[task.status]
              const dueDate = task.due_date ? new Date(task.due_date) : null
              const isTemp = task.id.startsWith('temp-')

              return (
                <tr
                  key={task.id}
                  onClick={() => !isTemp && setSelectedTask(task)}
                  className={cn(
                    'border-b border-[#E8E8E5] group',
                    isTemp ? 'opacity-40' : 'cursor-pointer hover:bg-[#F7F6F5]',
                  )}
                >
                  {/* indicator */}
                  <td className="w-8 pl-4 pr-2 py-2.5">
                    <span className={cn('block h-1.5 w-1.5 rounded-full', PRIORITY_DOT[task.priority ?? 'medium'])} />
                  </td>

                  {/* Task name */}
                  <td className="px-3 py-2.5">
                    <span className="text-[13.5px] text-[#1A1A1A] font-medium">{task.title}</span>
                    {task.description && (
                      <span className="ml-2 text-xs text-[#BBB] line-clamp-1 hidden sm:inline">{task.description}</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', status.dot)} />
                      <span className={cn('text-[12px]', status.text)}>{status.label}</span>
                    </div>
                  </td>

                  {/* Priority */}
                  <td className="px-3 py-2.5">
                    <span className="text-[12px] text-[#999] capitalize">{task.priority}</span>
                  </td>

                  {/* Effort */}
                  <td className="px-3 py-2.5">
                    <span className="text-[12px] text-[#999]">{EFFORT_LABEL[task.effort ?? 'medium']}</span>
                  </td>

                  {/* Due date */}
                  <td className="px-3 py-2.5">
                    <span className="text-[12px] text-[#BBB]">
                      {dueDate ? format(dueDate, 'MMM d') : '—'}
                    </span>
                  </td>

                  {/* Assignee */}
                  <td className="px-3 py-2.5">
                    {task.assignee && (
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={(task.assignee as any).avatar_url ?? ''} />
                        <AvatarFallback className="text-[9px] bg-[#E8E8E5] text-[#666]">
                          {((task.assignee as any).full_name ?? 'U').slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </td>
                </tr>
              )
            })}

            {showCreate && (
              <InlineRowCreate
                projectId={project.id}
                onCreated={t => { handleTaskCreated(t) }}
                onCancel={() => setShowCreate(false)}
              />
            )}
          </tbody>
        </table>

        {/* Add task */}
        {!showCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 mt-1 px-4 py-2 text-[12px] text-[#BBB] hover:text-[#37352F] hover:bg-[#F7F6F5] rounded transition-colors w-full"
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
