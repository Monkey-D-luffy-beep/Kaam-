'use client'

import { useMemo, useState } from 'react'
import {
  format, startOfWeek, endOfWeek, addWeeks, isPast, isToday,
  isSameWeek, parseISO, isBefore, startOfDay,
} from 'date-fns'
import type { TaskWithAssignee, Profile, MemberRole } from '@/types'
import { PRIORITY_CONFIG, STATUS_CONFIG, EFFORT_CONFIG } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EffortBadge, ApprovalBadge } from '@/components/shared/effort-badge'
import { Calendar, AlertTriangle, User } from 'lucide-react'

interface TimelineMember {
  user_id: string
  role: MemberRole
  profile: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
}

interface TimelineViewProps {
  tasks: TaskWithAssignee[]
  members: TimelineMember[]
  projectId: string
}

export function TimelineView({ tasks, members }: TimelineViewProps) {
  const [filterAssignee, setFilterAssignee] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const today = startOfDay(new Date())

  const filtered = useMemo(() => {
    return tasks.filter(t => {
      if (filterAssignee !== 'all' && t.assignee_id !== filterAssignee) return false
      if (filterStatus === 'active' && t.status === 'done') return false
      if (filterStatus !== 'all' && filterStatus !== 'active' && t.status !== filterStatus) return false
      return true
    })
  }, [tasks, filterAssignee, filterStatus])

  // Separate tasks with and without due dates
  const withDates = filtered.filter(t => t.due_date)
  const noDates = filtered.filter(t => !t.due_date)

  // Group by week
  const overdue = withDates.filter(t => isPast(parseISO(t.due_date!)) && !isToday(parseISO(t.due_date!)) && t.status !== 'done')
  const upcoming = withDates.filter(t => !isPast(parseISO(t.due_date!)) || isToday(parseISO(t.due_date!)) || t.status === 'done')

  // Group upcoming by week
  const weekGroups: { label: string; tasks: TaskWithAssignee[] }[] = []
  const seen = new Set<string>()

  upcoming.forEach(task => {
    const date = parseISO(task.due_date!)
    const weekStart = startOfWeek(date, { weekStartsOn: 1 })
    const key = weekStart.toISOString()
    if (!seen.has(key)) {
      seen.add(key)
      const end = endOfWeek(date, { weekStartsOn: 1 })
      const isCurrent = isSameWeek(today, date, { weekStartsOn: 1 })
      weekGroups.push({
        label: isCurrent ? 'This Week' : `${format(weekStart, 'MMM d')} – ${format(end, 'MMM d')}`,
        tasks: upcoming.filter(t => isSameWeek(parseISO(t.due_date!), date, { weekStartsOn: 1 })),
      })
    }
  })

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Select value={filterAssignee} onValueChange={v => v && setFilterAssignee(v)}>
          <SelectTrigger className="w-40 h-8 text-xs">
            <SelectValue placeholder="All members" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All members</SelectItem>
            {members.map(m => (
              <SelectItem key={m.user_id} value={m.user_id}>
                {m.profile.full_name ?? m.user_id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={v => v && setFilterStatus(v)}>
          <SelectTrigger className="w-36 h-8 text-xs">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active only</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground ml-auto">
          {filtered.length} task{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Overdue */}
      {overdue.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
            <h3 className="text-xs font-semibold text-red-600 uppercase tracking-wider">
              Overdue ({overdue.length})
            </h3>
          </div>
          <div className="space-y-1.5">
            {overdue.map(task => <TimelineTaskRow key={task.id} task={task} />)}
          </div>
        </div>
      )}

      {/* Grouped by week */}
      {weekGroups.map(group => (
        <div key={group.label}>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {group.label} ({group.tasks.length})
            </h3>
          </div>
          <div className="space-y-1.5">
            {group.tasks.map(task => <TimelineTaskRow key={task.id} task={task} />)}
          </div>
        </div>
      ))}

      {/* No due date */}
      {noDates.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              No deadline ({noDates.length})
            </h3>
          </div>
          <div className="space-y-1.5">
            {noDates.map(task => <TimelineTaskRow key={task.id} task={task} />)}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-sm text-muted-foreground">No tasks match the selected filters.</p>
        </div>
      )}
    </div>
  )
}

function TimelineTaskRow({ task }: { task: TaskWithAssignee }) {
  const priority = PRIORITY_CONFIG[task.priority]
  const status = STATUS_CONFIG[task.status]
  const dueDate = task.due_date ? parseISO(task.due_date) : null
  const isOverdue = dueDate && isPast(dueDate) && !isToday(dueDate) && task.status !== 'done'

  return (
    <div className={cn(
      'flex items-center gap-3 rounded-lg border bg-card p-3 text-sm',
      task.status === 'done' && 'opacity-60',
      isOverdue && 'border-red-200 bg-red-50/30'
    )}>
      {/* Status dot */}
      <div className={cn(
        'h-2 w-2 shrink-0 rounded-full',
        task.status === 'todo' && 'bg-slate-400',
        task.status === 'in_progress' && 'bg-blue-500',
        task.status === 'done' && 'bg-green-500',
      )} />

      {/* Title + badges */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className={cn('font-medium truncate', task.status === 'done' && 'line-through text-muted-foreground')}>
            {task.title}
          </p>
          {task.effort !== 'medium' && <EffortBadge effort={task.effort} size="xs" />}
          <ApprovalBadge status={task.approval_status} size="xs" />
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 shrink-0">
        <span className={cn('text-xs font-medium hidden sm:block', priority.color)}>
          {priority.label}
        </span>

        {dueDate && (
          <span className={cn(
            'text-xs tabular-nums',
            isOverdue ? 'text-red-600 font-semibold' : isToday(dueDate) ? 'text-amber-600 font-medium' : 'text-muted-foreground'
          )}>
            {isToday(dueDate) ? 'Today' : format(dueDate, 'MMM d')}
          </span>
        )}

        {task.assignee ? (
          <Avatar className="h-6 w-6">
            <AvatarImage src={(task.assignee as any).avatar_url ?? ''} />
            <AvatarFallback className="text-[10px]">
              {((task.assignee as any).full_name ?? 'U').slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="h-6 w-6 rounded-full border border-dashed border-muted-foreground/30 flex items-center justify-center">
            <User className="h-3 w-3 text-muted-foreground/50" />
          </div>
        )}
      </div>
    </div>
  )
}
