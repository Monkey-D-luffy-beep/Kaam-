'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { TaskStatus, TaskWithAssignee } from '@/types'
import { PRIORITY_CONFIG, BOARD_COLUMNS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Trash2, ArrowRight, Calendar } from 'lucide-react'
import { format, isPast, isToday } from 'date-fns'

const PRIORITY_DOT: Record<string, string> = {
  low:    'bg-slate-300',
  medium: 'bg-amber-400',
  high:   'bg-orange-500',
  urgent: 'bg-red-500',
}

interface BoardCardProps {
  task: TaskWithAssignee
  onClick: () => void
  onMove: (taskId: string, status: TaskStatus) => void
  onDelete: () => void
}

export function BoardCard({ task, onClick, onMove, onDelete }: BoardCardProps) {
  const dueDate = task.due_date ? new Date(task.due_date) : null
  const isOverdue = dueDate && isPast(dueDate) && !isToday(dueDate) && task.status !== 'done'
  const isDueToday = dueDate && isToday(dueDate) && task.status !== 'done'

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        'group relative cursor-grab active:cursor-grabbing select-none',
        'bg-white rounded-md px-3 py-2.5',
        'border border-[#E8E8E5] hover:border-[#D4D4D0]',
        'shadow-[0_1px_2px_rgba(0,0,0,0.05)]',
        'transition-colors',
        isDragging && 'opacity-40'
      )}
    >
      {/* Menu — only on hover */}
      <div className="absolute right-1.5 top-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                onClick={e => e.stopPropagation()}
                className="flex h-5 w-5 items-center justify-center rounded hover:bg-[#F0F0EE] text-[#999]"
              />
            }
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={e => e.stopPropagation()}>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <ArrowRight className="mr-2 h-3.5 w-3.5" />
                Move to
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {BOARD_COLUMNS.filter(c => c.id !== task.status).map(col => (
                  <DropdownMenuItem key={col.id} onSelect={() => onMove(task.id, col.id)}>
                    {col.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={onDelete}>
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Title */}
      <p className="text-[13.5px] leading-snug text-[#1A1A1A] pr-5">{task.title}</p>

      {/* Description — only if short enough */}
      {task.description && (
        <p className="mt-0.5 text-xs text-[#999] line-clamp-1">{task.description}</p>
      )}

      {/* Bottom row — minimal: priority dot + due date + assignee */}
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Priority dot */}
          <span
            className={cn('h-1.5 w-1.5 rounded-full shrink-0', PRIORITY_DOT[task.priority])}
            title={PRIORITY_CONFIG[task.priority]?.label}
          />
          {/* Due date */}
          {dueDate && (
            <span className={cn(
              'text-[11px]',
              isOverdue && 'text-red-500 font-medium',
              isDueToday && 'text-amber-500 font-medium',
              !isOverdue && !isDueToday && 'text-[#AAA]'
            )}>
              {isOverdue ? 'Overdue' : format(dueDate, 'MMM d')}
            </span>
          )}
        </div>

        {task.assignee && (
          <Avatar className="h-5 w-5 shrink-0">
            <AvatarImage src={(task.assignee as any).avatar_url ?? ''} />
            <AvatarFallback className="text-[9px] bg-[#E8E8E5] text-[#666]">
              {((task.assignee as any).full_name ?? 'U').slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  )
}
