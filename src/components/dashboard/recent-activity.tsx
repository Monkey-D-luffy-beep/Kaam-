import { formatDistanceToNow } from 'date-fns'
import type { ActivityLog, Profile } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'

type ActivityWithUser = ActivityLog & {
  user: Pick<Profile, 'full_name' | 'avatar_url'> | null
  project: { name: string; color: string } | null
}

function formatAction(action: string, metadata: Record<string, unknown>): string {
  const map: Record<string, string> = {
    task_created: 'created a task',
    task_updated: 'updated a task',
    task_completed: 'completed a task',
    task_assigned: 'assigned a task',
    project_created: 'created a project',
    project_updated: 'updated a project',
    member_invited: 'invited a member',
    member_joined: 'joined the project',
    comment_added: 'commented on a task',
  }
  return map[action] ?? action.replace(/_/g, ' ')
}

export function RecentActivity({ logs }: { logs: ActivityWithUser[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-3">Recent Activity</h3>
      {logs.length === 0 ? (
        <p className="text-xs text-muted-foreground py-4 text-center">No recent activity</p>
      ) : (
        <ScrollArea className="h-[320px]">
          <div className="space-y-3 pr-3">
            {logs.map((log) => {
              const name = log.user?.full_name ?? 'Someone'
              const initials = name.slice(0, 2).toUpperCase()
              return (
                <div key={log.id} className="flex items-start gap-3">
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarImage src={log.user?.avatar_url ?? ''} />
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs">
                      <span className="font-medium">{name}</span>{' '}
                      {formatAction(log.action, log.metadata)}
                      {log.project && (
                        <span className="text-muted-foreground"> in {log.project.name}</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
