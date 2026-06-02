'use client'

import { useState } from 'react'
import { format, isPast, isToday, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { EffortBadge, ApprovalBadge } from '@/components/shared/effort-badge'
import { PRIORITY_CONFIG } from '@/lib/constants'
import { Search, AlertTriangle, ChevronDown, ChevronRight, Users } from 'lucide-react'

interface PersonTask {
  id: string
  title: string
  status: string
  priority: string
  effort: string
  due_date: string | null
  approval_status: string
  project_id: string
  projectName: string
  projectColor: string
}

interface Person {
  userId: string
  profile: { id: string; full_name: string | null; avatar_url: string | null; email: string }
  projectRoles: { projectId: string; projectName: string; projectColor: string; role: string }[]
  tasks: PersonTask[]
}

interface PeopleViewProps {
  people: Person[]
  currentUserId: string
}

export function PeopleView({ people }: PeopleViewProps) {
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const filtered = people.filter(p => {
    const name = (p.profile.full_name ?? p.profile.email ?? '').toLowerCase()
    return name.includes(search.toLowerCase())
  })

  function toggle(userId: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(userId)) next.delete(userId)
      else next.add(userId)
      return next
    })
  }

  if (people.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border bg-muted">
          <Users className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">No teammates yet</p>
        <p className="text-xs text-muted-foreground">Invite people to your projects to see them here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Search by name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 h-8 text-sm"
        />
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground py-6 text-center">No teammates match your search.</p>
      )}

      {filtered.map(person => {
        const isExpanded = expanded.has(person.userId)
        const displayName = person.profile.full_name ?? person.profile.email ?? 'Unknown'
        const activeTasks = person.tasks.filter(t => t.status !== 'done')
        const overdueTasks = activeTasks.filter(t => t.due_date && isPast(parseISO(t.due_date)) && !isToday(parseISO(t.due_date)))
        const pendingApprovals = activeTasks.filter(t => t.approval_status === 'pending_approval')

        return (
          <div key={person.userId} className="rounded-xl border bg-card overflow-hidden">
            {/* Person header */}
            <button
              onClick={() => toggle(person.userId)}
              className="flex w-full items-center gap-3 p-4 hover:bg-muted/30 transition-colors text-left"
            >
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback className="text-xs">{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                <AvatarImage src={person.profile.avatar_url ?? ''} />
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold">{displayName}</span>
                  {overdueTasks.length > 0 && (
                    <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
                      <AlertTriangle className="h-3 w-3" />{overdueTasks.length} overdue
                    </span>
                  )}
                  {pendingApprovals.length > 0 && (
                    <span className="text-xs text-amber-700 font-medium">
                      ⏳ {pendingApprovals.length} pending review
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">
                    {activeTasks.length} active task{activeTasks.length !== 1 ? 's' : ''}
                  </span>
                  <span className="text-muted-foreground">·</span>
                  {person.projectRoles.map(pr => (
                    <span key={pr.projectId} className="flex items-center gap-1 text-xs">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: pr.projectColor }} />
                      <span className="text-muted-foreground">{pr.projectName}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="shrink-0">
                {isExpanded
                  ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  : <ChevronRight className="h-4 w-4 text-muted-foreground" />
                }
              </div>
            </button>

            {/* Expanded: task list across all projects */}
            {isExpanded && (
              <div className="border-t">
                {activeTasks.length === 0 ? (
                  <p className="px-4 py-3 text-xs text-muted-foreground">No active tasks assigned.</p>
                ) : (
                  <div>
                    {/* Group by project */}
                    {person.projectRoles.map(pr => {
                      const projectTasks = activeTasks.filter(t => t.project_id === pr.projectId)
                      if (projectTasks.length === 0) return null
                      return (
                        <div key={pr.projectId}>
                          <div className="flex items-center gap-2 px-4 py-2 bg-muted/30">
                            <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: pr.projectColor }} />
                            <span className="text-xs font-medium">{pr.projectName}</span>
                            <Badge variant="secondary" className="text-xs capitalize h-4 px-1">{pr.role}</Badge>
                          </div>
                          {projectTasks.map(task => (
                            <PersonTaskRow key={task.id} task={task} />
                          ))}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Done tasks summary */}
                {person.tasks.filter(t => t.status === 'done').length > 0 && (
                  <div className="px-4 py-2 border-t text-xs text-muted-foreground">
                    ✓ {person.tasks.filter(t => t.status === 'done').length} completed tasks
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function PersonTaskRow({ task }: { task: PersonTask }) {
  const priority = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG]
  const dueDate = task.due_date ? parseISO(task.due_date) : null
  const isOverdue = dueDate && isPast(dueDate) && !isToday(dueDate)
  const isDueToday = dueDate && isToday(dueDate)

  return (
    <div className={cn(
      'flex items-center gap-3 px-4 py-2.5 border-b last:border-b-0',
      isOverdue && 'bg-red-50/30',
    )}>
      <div className={cn(
        'h-1.5 w-1.5 rounded-full shrink-0',
        task.status === 'in_progress' ? 'bg-blue-500' : 'bg-slate-300'
      )} />

      <span className="flex-1 text-xs truncate">{task.title}</span>

      <div className="flex items-center gap-2 shrink-0">
        {task.effort !== 'medium' && <EffortBadge effort={task.effort as any} size="xs" />}
        <ApprovalBadge status={task.approval_status as any} size="xs" />
        {priority && (
          <span className={cn('text-xs font-medium hidden sm:block', priority.color)}>
            {priority.label}
          </span>
        )}
        {dueDate && (
          <span className={cn(
            'text-xs tabular-nums',
            isOverdue ? 'text-red-600 font-semibold' : isDueToday ? 'text-amber-600 font-medium' : 'text-muted-foreground'
          )}>
            {isDueToday ? 'Today' : format(dueDate, 'MMM d')}
          </span>
        )}
      </div>
    </div>
  )
}
