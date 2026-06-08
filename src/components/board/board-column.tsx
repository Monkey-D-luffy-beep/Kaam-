'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import type { TaskStatus, TaskWithAssignee } from '@/types'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
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
}

const COLUMN_STYLES: Record<TaskStatus, string> = {
  todo: 'border-t-slate-400',
  in_progress: 'border-t-blue-500',
  done: 'border-t-green-500',
}

function InlineTaskCreate({
  projectId,
  status,
  onDone,
}: {
  projectId: string
  status: TaskStatus
  onDone: () => void
}) {
  const [title, setTitle] = useState('')
  const [, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  function submit() {
    const trimmed = title.trim()
    if (!trimmed) return
    const fd = new FormData()
    fd.set('title', trimmed)
    fd.set('project_id', projectId)
    fd.set('status', status)
    setTitle('')
    startTransition(async () => {
      const result = await createTask(undefined, fd)
      if (!result.success) toast.error(result.message)
    })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') { onDone(); return }
    if (e.key === 'Enter') { e.preventDefault(); submit() }
  }

  return (
    <div className="rounded-lg border bg-card p-2.5 shadow-sm ring-1 ring-[#4F46E5]/25">
      <input
        ref={inputRef}
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (!title.trim()) onDone() }}
        placeholder="Task name…"
        className="w-full text-sm outline-none bg-transparent placeholder:text-muted-foreground"
      />
      <p className="mt-1.5 text-[10px] text-muted-foreground select-none">
        ↵ to add · Esc to cancel
      </p>
    </div>
  )
}

export function BoardColumn({
  column,
  tasks,
  projectId,
  onTaskClick,
  onMove,
  onDelete,
}: BoardColumnProps) {
  const [showCreate, setShowCreate] = useState(false)

  return (
    <div
      className={cn(
        'flex w-72 shrink-0 flex-col rounded-xl border bg-muted/40 border-t-2',
        COLUMN_STYLES[column.id]
      )}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{column.label}</span>
          <Badge variant="secondary" className="h-5 min-w-5 justify-center text-xs px-1.5">
            {tasks.length}
          </Badge>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex h-6 w-6 items-center justify-center rounded hover:bg-accent transition-colors"
          title={`Add task to ${column.label}`}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-2 p-2">
          {tasks.map((task) => (
            <BoardCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
              onMove={onMove}
              onDelete={() => onDelete(task.id)}
            />
          ))}

          {/* Inline create input */}
          {showCreate && (
            <InlineTaskCreate
              projectId={projectId}
              status={column.id}
              onDone={() => setShowCreate(false)}
            />
          )}

          {/* Empty state — click to start creating */}
          {tasks.length === 0 && !showCreate && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed p-3 text-xs text-muted-foreground hover:border-muted-foreground hover:text-foreground transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add task
            </button>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
