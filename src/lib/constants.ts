import type { Priority, TaskStatus, EffortLevel, ApprovalStatus, MemberRole } from '@/types'

export const APP_NAME = 'Kaam'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bgColor: string }> = {
  low: { label: 'Low', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  medium: { label: 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  high: { label: 'High', color: 'text-orange-600', bgColor: 'bg-orange-50' },
  urgent: { label: 'Urgent', color: 'text-red-600', bgColor: 'bg-red-50' },
}

export const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bgColor: string }> = {
  todo: { label: 'To Do', color: 'text-slate-600', bgColor: 'bg-slate-100' },
  in_progress: { label: 'In Progress', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  done: { label: 'Done', color: 'text-green-600', bgColor: 'bg-green-100' },
}

export const EFFORT_CONFIG: Record<EffortLevel, {
  label: string
  color: string
  bgColor: string
  borderColor: string
  dotColor: string
  minutes: string
}> = {
  quick: {
    label: 'Quick',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    dotColor: 'bg-emerald-500',
    minutes: '< 15 min',
  },
  medium: {
    label: 'Medium',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    dotColor: 'bg-blue-500',
    minutes: '~1–4 hrs',
  },
  large: {
    label: 'Large',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    dotColor: 'bg-orange-500',
    minutes: 'Days',
  },
}

export const APPROVAL_CONFIG: Record<ApprovalStatus, {
  label: string
  color: string
  bgColor: string
  show: boolean
}> = {
  none: { label: 'No Review', color: 'text-slate-500', bgColor: 'bg-slate-100', show: false },
  pending_approval: { label: 'Needs Review', color: 'text-amber-700', bgColor: 'bg-amber-50', show: true },
  approved: { label: 'Approved', color: 'text-green-700', bgColor: 'bg-green-50', show: true },
  rejected: { label: 'Rejected', color: 'text-red-700', bgColor: 'bg-red-50', show: true },
}

export const ROLE_CONFIG: Record<MemberRole, { label: string; canApprove: boolean; canViewWorkload: boolean }> = {
  owner: { label: 'Owner', canApprove: true, canViewWorkload: true },
  admin: { label: 'Admin', canApprove: true, canViewWorkload: true },
  manager: { label: 'Manager', canApprove: true, canViewWorkload: true },
  member: { label: 'Member', canApprove: false, canViewWorkload: false },
}

export const PROJECT_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#0ea5e9', // sky
  '#3b82f6', // blue
  '#a855f7', // purple
] as const

export const BOARD_COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: 'todo', label: 'To Do' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'done', label: 'Done' },
]

export const ROUTES = {
  home: '/',
  login: '/login',
  signup: '/signup',
  resetPassword: '/reset-password',
  dashboard: '/dashboard',
  projects: '/projects',
  team: '/team',
  project: (id: string) => `/projects/${id}`,
  projectBoard: (id: string) => `/projects/${id}/board`,
  projectTable: (id: string) => `/projects/${id}/table`,
  projectTimeline: (id: string) => `/projects/${id}/timeline`,
  projectWorkload: (id: string) => `/projects/${id}/workload`,
  projectSettings: (id: string) => `/projects/${id}/settings`,
  settings: '/settings',
  profile: '/profile',
} as const

export const PAGINATION = {
  TASKS_PER_PAGE: 20,
  PROJECTS_PER_PAGE: 10,
  ACTIVITY_PER_PAGE: 10,
} as const
