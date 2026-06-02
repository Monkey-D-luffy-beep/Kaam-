'use client'

import { useState, useTransition } from 'react'
import type { Task, MemberRole, Profile } from '@/types'
import { PRIORITY_CONFIG, EFFORT_CONFIG, ROLE_CONFIG, ROUTES } from '@/lib/constants'
import { updateMemberRole } from '@/actions/tasks'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { EffortBadge } from '@/components/shared/effort-badge'
import { AlertTriangle, CheckCircle, Clock, Zap, Flame } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { format, isPast, parseISO } from 'date-fns'

interface MemberWorkload {
  user_id: string
  role: MemberRole
  profile: Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'email'>
  tasks: Task[]
  taskCounts: {
    quick: number
    medium: number
    large: number
    total: number
    overdue: number
  }
}

interface WorkloadViewProps {
  memberWorkloads: MemberWorkload[]
  pendingApprovals: Pick<Task, 'id' | 'title' | 'assignee_id' | 'due_date' | 'priority' | 'effort'>[]
  projectId: string
  currentUserId: string
  currentRole: string
}

const MAX_TASKS_BEFORE_OVERLOAD = 8

export function WorkloadView({ memberWorkloads, pendingApprovals, projectId, currentUserId, currentRole }: WorkloadViewProps) {
  const canManage = ['owner', 'admin'].includes(currentRole)

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Pending Approvals */}
      {pendingApprovals.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-amber-600" />
            <h2 className="text-sm font-semibold">Pending Reviews ({pendingApprovals.length})</h2>
          </div>
          <div className="space-y-1.5">
            {pendingApprovals.map(task => {
              const assignee = memberWorkloads.find(m => m.user_id === task.assignee_id)
              return (
                <div key={task.id} className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50/50 p-3">
                  <div className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    {assignee && (
                      <p className="text-xs text-muted-foreground">
                        {assignee.profile.full_name ?? assignee.profile.email}
                      </p>
                    )}
                  </div>
                  <EffortBadge effort={task.effort} size="xs" />
                  {task.due_date && (
                    <span className={cn(
                      'text-xs',
                      isPast(parseISO(task.due_date)) ? 'text-red-600 font-medium' : 'text-muted-foreground'
                    )}>
                      {format(parseISO(task.due_date), 'MMM d')}
                    </span>
                  )}
                  <Button size="sm" variant="outline" className="text-xs h-7" render={<Link href={ROUTES.projectBoard(projectId)} />}>
                    Review
                  </Button>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {pendingApprovals.length > 0 && <Separator />}

      {/* Team workload */}
      <section>
        <h2 className="text-sm font-semibold mb-4">Team Workload</h2>
        <div className="space-y-4">
          {memberWorkloads.map(member => (
            <MemberWorkloadCard
              key={member.user_id}
              member={member}
              projectId={projectId}
              canManage={canManage}
              isCurrentUser={member.user_id === currentUserId}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

function MemberWorkloadCard({
  member, projectId, canManage, isCurrentUser,
}: {
  member: MemberWorkload
  projectId: string
  canManage: boolean
  isCurrentUser: boolean
}) {
  const [, startTransition] = useTransition()
  const isOverloaded = member.taskCounts.total >= MAX_TASKS_BEFORE_OVERLOAD

  async function handleRoleChange(newRole: string | null) {
    if (!newRole) return
    startTransition(async () => {
      const result = await updateMemberRole(projectId, member.user_id, newRole as MemberRole)
      if (result.success) toast.success(result.message)
      else toast.error(result.message)
    })
  }

  const displayName = member.profile.full_name ?? member.profile.email ?? 'Unknown'
  const effortScore = member.taskCounts.quick * 1 + member.taskCounts.medium * 3 + member.taskCounts.large * 8
  const maxScore = MAX_TASKS_BEFORE_OVERLOAD * 3
  const loadPercent = Math.min(100, Math.round((effortScore / maxScore) * 100))

  return (
    <div className={cn(
      'rounded-xl border p-4',
      isOverloaded && 'border-red-200 bg-red-50/20'
    )}>
      <div className="flex items-start gap-3">
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarImage src={member.profile.avatar_url ?? ''} />
          <AvatarFallback className="text-xs">{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold">
              {displayName} {isCurrentUser && <span className="text-xs text-muted-foreground font-normal">(you)</span>}
            </span>

            {canManage && !isCurrentUser ? (
              <Select defaultValue={member.role} onValueChange={(v) => handleRoleChange(v)}>
                <SelectTrigger className="h-5 w-28 text-xs border-0 bg-muted px-2 py-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Badge variant="secondary" className="text-xs capitalize h-5 px-1.5">{member.role}</Badge>
            )}

            {isOverloaded && (
              <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
                <AlertTriangle className="h-3 w-3" />
                Overloaded
              </span>
            )}
          </div>

          {/* Load bar */}
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{member.taskCounts.total} active task{member.taskCounts.total !== 1 ? 's' : ''}</span>
              <span>{loadPercent}% load</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  loadPercent < 50 ? 'bg-emerald-500' :
                  loadPercent < 80 ? 'bg-amber-500' : 'bg-red-500'
                )}
                style={{ width: `${loadPercent}%` }}
              />
            </div>
          </div>

          {/* Effort breakdown */}
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            {member.taskCounts.quick > 0 && (
              <span className="flex items-center gap-1 text-emerald-700">
                <Zap className="h-3 w-3" />{member.taskCounts.quick} quick
              </span>
            )}
            {member.taskCounts.medium > 0 && (
              <span className="flex items-center gap-1 text-blue-700">
                <Clock className="h-3 w-3" />{member.taskCounts.medium} medium
              </span>
            )}
            {member.taskCounts.large > 0 && (
              <span className="flex items-center gap-1 text-orange-700">
                <Flame className="h-3 w-3" />{member.taskCounts.large} large
              </span>
            )}
            {member.taskCounts.overdue > 0 && (
              <span className="flex items-center gap-1 text-red-600 font-medium">
                <AlertTriangle className="h-3 w-3" />{member.taskCounts.overdue} overdue
              </span>
            )}
            {member.taskCounts.total === 0 && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <CheckCircle className="h-3 w-3" />No active tasks
              </span>
            )}
          </div>

          {/* Task list (collapsed by default for clean view) */}
          {member.tasks.length > 0 && (
            <div className="mt-3 space-y-1">
              {member.tasks.slice(0, 4).map(task => (
                <div key={task.id} className="flex items-center gap-2 text-xs">
                  <div className={cn(
                    'h-1.5 w-1.5 rounded-full shrink-0',
                    task.status === 'in_progress' ? 'bg-blue-500' : 'bg-slate-300'
                  )} />
                  <span className="truncate text-muted-foreground flex-1">{task.title}</span>
                  <EffortBadge effort={task.effort} size="xs" showLabel={false} />
                  {task.due_date && (
                    <span className={cn(
                      'tabular-nums shrink-0',
                      isPast(parseISO(task.due_date)) ? 'text-red-600 font-medium' : 'text-muted-foreground'
                    )}>
                      {format(parseISO(task.due_date), 'MMM d')}
                    </span>
                  )}
                </div>
              ))}
              {member.tasks.length > 4 && (
                <p className="text-xs text-muted-foreground pl-3">
                  +{member.tasks.length - 4} more tasks
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
