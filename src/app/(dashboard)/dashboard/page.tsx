import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/page-header'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { DashboardTaskList } from '@/components/dashboard/dashboard-task-list'
import { RecentActivity } from '@/components/dashboard/recent-activity'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]

  const [todayTasksRes, overdueTasksRes, recentActivityRes, activeCountRes, pendingApprovalRes] =
    await Promise.all([
      supabase
        .from('tasks')
        .select('*, projects(name, color), assignee:profiles!assignee_id(full_name, avatar_url)')
        .eq('assignee_id', user.id)
        .eq('due_date', today)
        .neq('status', 'done')
        .order('priority', { ascending: false })
        .limit(10),

      supabase
        .from('tasks')
        .select('*, projects(name, color), assignee:profiles!assignee_id(full_name, avatar_url)')
        .eq('assignee_id', user.id)
        .lt('due_date', today)
        .neq('status', 'done')
        .order('due_date', { ascending: true })
        .limit(10),

      supabase
        .from('activity_logs')
        .select('*, user:profiles(full_name, avatar_url), project:projects(name, color)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(8),

      supabase
        .from('tasks')
        .select('id', { count: 'exact', head: true })
        .eq('assignee_id', user.id)
        .neq('status', 'done'),

      supabase
        .from('tasks')
        .select('id', { count: 'exact', head: true })
        .eq('approval_status', 'pending_approval'),
    ])

  const stats = {
    due_today: todayTasksRes.data?.length ?? 0,
    overdue: overdueTasksRes.data?.length ?? 0,
    total_active_tasks: activeCountRes.count ?? 0,
    completed_this_week: 0,
    pending_approvals: pendingApprovalRes.count ?? 0,
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader title="Dashboard" />

      <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
        <div>
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
            Overview
          </h2>
          <DashboardStats stats={stats} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {(todayTasksRes.data?.length ?? 0) > 0 && (
              <DashboardTaskList title="Due Today" tasks={todayTasksRes.data as any} variant="today" />
            )}
            {(overdueTasksRes.data?.length ?? 0) > 0 && (
              <DashboardTaskList title="Overdue" tasks={overdueTasksRes.data as any} variant="overdue" />
            )}
            {(todayTasksRes.data?.length === 0 && overdueTasksRes.data?.length === 0) && (
              <div className="rounded-xl border border-dashed p-8 text-center">
                <p className="text-sm font-medium">You&apos;re all caught up!</p>
                <p className="mt-1 text-xs text-muted-foreground">No tasks due today or overdue.</p>
              </div>
            )}
          </div>

          <div>
            <RecentActivity logs={recentActivityRes.data as any ?? []} />
          </div>
        </div>
      </div>
    </div>
  )
}
