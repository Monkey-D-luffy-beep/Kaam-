import type { DashboardStats } from '@/types'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  label: string
  value: number
  variant?: 'default' | 'warning' | 'danger' | 'amber'
}

function StatsCard({ label, value, variant = 'default' }: StatsCardProps) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn('mt-1 text-2xl font-semibold tabular-nums', {
        'text-orange-600': variant === 'warning',
        'text-red-600': variant === 'danger',
        'text-amber-600': variant === 'amber',
      })}>
        {value}
      </p>
    </div>
  )
}

export function DashboardStats({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      <StatsCard label="Due Today" value={stats.due_today} variant={stats.due_today > 0 ? 'warning' : 'default'} />
      <StatsCard label="Overdue" value={stats.overdue} variant={stats.overdue > 0 ? 'danger' : 'default'} />
      <StatsCard label="Active Tasks" value={stats.total_active_tasks} />
      <StatsCard label="Done This Week" value={stats.completed_this_week} />
      <StatsCard label="Pending Review" value={stats.pending_approvals} variant={stats.pending_approvals > 0 ? 'amber' : 'default'} />
    </div>
  )
}
