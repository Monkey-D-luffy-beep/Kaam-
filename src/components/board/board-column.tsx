'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { TaskStatus, TaskWithAssignee } from '@/types'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus } from 'lucide-react'
import { BoardCard } from '@/components/board/board-card'
import { createTask } from '@/actions/tasks'
import { toast } from 'sonner'

interface BoardColumnProps {
  column: { id: TaskStatus; label: string }
  tasks: TaskWithAssignee[]
  projectId: string
  onTaskClick: (task: TaskWithAssignee) => void
  onMove: (taskId: string, status: TaskStatus) => void
  onDelete: (taskId: string) => void
  onTaskCreated: (task: Partial<TaskWithAssignee> & { id: string; title: string; status: TaskStatus }) => void
}

const STATUS_DOT: Record<TaskStatus, string> = {
  todo:        'bg-slate-400',
  in_progress: 'bg-blue-400',
  done:        'bg-green-400',
}

function InlineTaskCreate({
  projectId, status, onDone, onCreated,
}: {
  projectId: string
  status: TaskStatus
  onDone: () => void
  onCreated: (task: Partial<TaskWithAssignee> & { id: string; title: string; status: TaskStatus }) => void
}) {
  const [title, setTitle] = useState('')
  const [, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  function submit() {
    const trimmed = title.trim()
    if (!trimmed) return
    onCreated({ id: `temp-${Date.now()}`, title: trimmed, status })
    setTitle('')
    const fd = new FormData()
    fd.set('title', trimmed)
    fd.set('project_id', projectId)
    fd.set('status', status)
    startTransition(async () => {
      const result = await createTask(undefined, fd)
      if (!result.success) toast.error(result.message ?? 'Failed to create task')
    })
  }

  return (
    <div className="bg-white rounded-md border border-[#4F46E5]/30 px-3 py-2 shadow-[0_0_0_2px_rgba(79,70,229,0.08)]">
      <input
        ref={inputRef}
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Escape') { onDone(); return }
          if (e.key === 'Enter') { e.preventDefault(); submit() }
        }}
        onBlur={() => { if (!title.trim()) onDone() }}
        placeholder="Task name…"
        className="w-full text-[13.5px] outline-none bg-transparent placeholder:text-[#BBB] text-[#1A1A1A]"
      />
      <p className="mt-1 text-[10px] text-[#CCC] select-none">↵ add · Esc cancel</p>
    </div>
  )
}

export function BoardColumn({
  column, tasks, projectId, onTaskClick, onMove, onDelete, onTaskCreated,
}: BoardColumnProps) {
  const [showCreate, setShowCreate] = useState(false)
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  return (
    <div className={cn(
      'flex w-[272px] shrink-0 flex-col rounded-xl transition-colors',
      'bg-[#F7F6F5]',
      isOver && 'bg-[#EEEDF0]'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <span className={cn('h-2 w-2 rounded-full', STATUS_DOT[column.id])} />
          <span className="text-[13px] font-semibold text-[#37352F]">{column.label}</span>
          <span className="text-[12px] text-[#999] font-normal">{tasks.length}</span>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-[#ECEAE8] text-[#999] hover:text-[#37352F] transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <ScrollArea className="flex-1">
        <div ref={setNodeRef} className="flex flex-col gap-1.5 px-2 pb-2 min-h-[60px]">
          <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            {tasks.map(task => (
              <BoardCard
                key={task.id}
                task={task}
                onClick={() => onTaskClick(task)}
                onMove={onMove}
                onDelete={() => onDelete(task.id)}
              />
            ))}
          </SortableContext>

          {showCreate && (
            <InlineTaskCreate
              projectId={projectId}
              status={column.id}
              onDone={() => setShowCreate(false)}
              onCreated={t => { onTaskCreated(t) }}
            />
          )}

          {/* Add task button — always visible at bottom */}
          {!showCreate && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-1.5 py-1 rounded text-[12px] text-[#AAA] hover:text-[#37352F] hover:bg-[#ECEAE8] transition-colors w-full"
            >
              <Plus className="h-3 w-3" />
              Add task
            </button>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
