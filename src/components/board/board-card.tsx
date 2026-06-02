'use client'

import type { TaskStatus, TaskWithAssignee } from '@/types'
import { PRIORITY_CONFIG, BOARD_COLUMNS, APPROVAL_CONFIG } from '@/lib/constants'
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
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Trash2, ArrowRight, Calendar } from 'lucide-react'
import { format, isPast, isToday } from 'date-fns'
import { EffortBadge, ApprovalBadge } from '@/components/shared/effort-badge'

interface BoardCardProps {
  task: TaskWithAssignee
  onClick: () => void
  onMove: (taskId: string, status: TaskStatus) => void
  onDelete: () => void
}

export function BoardCard({ task, onClick, onMove, onDelete }: BoardCardProps) {
  const priority = PRIORITY_CONFIG[task.priority]
  const dueDate = task.due_date ? new Date(task.due_date) : null
  const isOverdue = dueDate && isPast(dueDate) && !isToday(dueDate) && task.status !== 'done'
  const isDueToday = dueDate && isToday(dueDate) && task.status !== 'done'
  const hasPendingApproval = task.approval_status === 'pending_approval'

  return (
    <div
      className={cn(
        'group relative cursor-pointer rounded-lg border bg-card p-3 shadow-sm hover:shadow transition-shadow',
        hasPendingApproval && 'border-amber-300 bg-amber-50/30'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug flex-1">{task.title}</p>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              />
            }
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <ArrowRight className="mr-2 h-3.5 w-3.5" />
                Move to
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {BOARD_COLUMNS.filter((c) => c.id !== task.status).map((col) => (
                  <DropdownMenuItem key={col.id} onSelect={() => onMove(task.id, col.id)}>
                    {col.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={onDelete}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {task.description && (
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{task.description}</p>
      )}

      {/* Badges row */}
      <div className="mt-2 flex flex-wrap gap-1">
        {task.effort !== 'medium' && <EffortBadge effort={task.effort} size="xs" />}
        <ApprovalBadge status={task.approval_status} size="xs" />
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className={cn('text-xs font-medium', priority.color)}>
            {priority.label}
          </span>
          {dueDate && (
            <div
              className={cn(
                'flex items-center gap-0.5 text-xs',
                isOverdue && 'text-red-600 font-semibold',
                isDueToday && 'text-amber-600 font-medium',
                !isOverdue && !isDueToday && 'text-muted-foreground'
              )}
            >
              <Calendar className="h-3 w-3" />
              {isOverdue ? 'Overdue · ' : isDueToday ? 'Today · ' : ''}
              {format(dueDate, 'MMM d')}
            </div>
          )}
        </div>

        {task.assignee && (
          <Avatar className="h-5 w-5 shrink-0">
            <AvatarImage src={(task.assignee as any).avatar_url ?? ''} />
            <AvatarFallback className="text-[10px]">
              {((task.assignee as any).full_name ?? 'U').slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  )
}
