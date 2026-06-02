import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import type { TaskWithAssignee } from '@/types'
import { PRIORITY_CONFIG, ROUTES } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface DashboardTaskListProps {
  title: string
  tasks: (TaskWithAssignee & { projects: { name: string; color: string } })[]
  variant: 'today' | 'overdue'
}

export function DashboardTaskList({ title, tasks, variant }: DashboardTaskListProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <Badge
          variant="secondary"
          className={cn('text-xs', {
            'bg-red-100 text-red-700': variant === 'overdue',
            'bg-orange-100 text-orange-700': variant === 'today',
          })}
        >
          {tasks.length}
        </Badge>
      </div>
      <div className="space-y-1.5">
        {tasks.map((task) => {
          const priority = PRIORITY_CONFIG[task.priority]
          return (
            <Link
              key={task.id}
              href={ROUTES.projectBoard(task.project_id)}
              className="flex items-center gap-3 rounded-lg border bg-card p-3 text-sm hover:bg-accent transition-colors"
            >
              <div
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: task.projects?.color ?? '#6366f1' }}
              />
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium">{task.title}</p>
                <p className="text-xs text-muted-foreground">{task.projects?.name}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={cn('text-xs font-medium', priority.color)}>
                  {priority.label}
                </span>
                {task.due_date && (
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(task.due_date), { addSuffix: true })}
                  </span>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
