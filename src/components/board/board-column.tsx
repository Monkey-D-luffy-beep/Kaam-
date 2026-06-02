'use client'

import type { TaskStatus, TaskWithAssignee } from '@/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Plus } from 'lucide-react'
import { BoardCard } from '@/components/board/board-card'

interface BoardColumnProps {
  column: { id: TaskStatus; label: string }
  tasks: TaskWithAssignee[]
  onTaskClick: (task: TaskWithAssignee) => void
  onMove: (taskId: string, status: TaskStatus) => void
  onDelete: (taskId: string) => void
  onAddTask: () => void
}

const COLUMN_STYLES: Record<TaskStatus, string> = {
  todo: 'border-t-slate-400',
  in_progress: 'border-t-blue-500',
  done: 'border-t-green-500',
}

export function BoardColumn({
  column,
  tasks,
  onTaskClick,
  onMove,
  onDelete,
  onAddTask,
}: BoardColumnProps) {
  return (
    <div
      className={cn(
        'flex w-72 shrink-0 flex-col rounded-xl border bg-muted/40 border-t-2',
        COLUMN_STYLES[column.id]
      )}
    >
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{column.label}</span>
          <Badge variant="secondary" className="h-5 min-w-5 justify-center text-xs px-1.5">
            {tasks.length}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onAddTask}
          title={`Add task to ${column.label}`}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
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
          {tasks.length === 0 && (
            <button
              onClick={onAddTask}
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
