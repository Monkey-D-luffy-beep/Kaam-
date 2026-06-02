import type { EffortLevel } from '@/types'
import { EFFORT_CONFIG } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Zap, Clock, Flame } from 'lucide-react'

const EFFORT_ICONS = {
  quick: Zap,
  medium: Clock,
  large: Flame,
}

interface EffortBadgeProps {
  effort: EffortLevel
  showLabel?: boolean
  size?: 'sm' | 'xs'
}

export function EffortBadge({ effort, showLabel = true, size = 'sm' }: EffortBadgeProps) {
  if (effort === 'medium' && !showLabel) return null

  const config = EFFORT_CONFIG[effort]
  const Icon = EFFORT_ICONS[effort]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full border font-medium',
        config.color,
        config.bgColor,
        config.borderColor,
        size === 'xs' ? 'px-1.5 py-0 text-[10px]' : 'px-2 py-0.5 text-xs'
      )}
    >
      <Icon className={cn('shrink-0', size === 'xs' ? 'h-2.5 w-2.5' : 'h-3 w-3')} />
      {showLabel && config.label}
    </span>
  )
}

interface ApprovalBadgeProps {
  status: import('@/types').ApprovalStatus
  size?: 'sm' | 'xs'
}

export function ApprovalBadge({ status, size = 'sm' }: ApprovalBadgeProps) {
  const { APPROVAL_CONFIG } = require('@/lib/constants')
  const config = APPROVAL_CONFIG[status]
  if (!config.show) return null

  const icons = {
    pending_approval: '⏳',
    approved: '✓',
    rejected: '✕',
    none: '',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        config.color,
        config.bgColor,
        size === 'xs' ? 'px-1.5 py-0 text-[10px]' : 'px-2 py-0.5 text-xs'
      )}
    >
      <span>{icons[status]}</span>
      {config.label}
    </span>
  )
}
