export type Priority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type ProjectStatus = 'active' | 'archived'
export type MemberRole = 'owner' | 'admin' | 'manager' | 'member'
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired'
export type EffortLevel = 'quick' | 'medium' | 'large'
export type ApprovalStatus = 'none' | 'pending_approval' | 'approved' | 'rejected'

export interface Organization {
  id: string
  name: string
  slug: string
  logo_url: string | null
  owner_id: string
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  organization_id: string
  name: string
  description: string | null
  status: ProjectStatus
  color: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface ProjectMember {
  id: string
  project_id: string
  user_id: string
  role: MemberRole
  created_at: string
}

export interface Task {
  id: string
  project_id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: Priority
  effort: EffortLevel
  approval_status: ApprovalStatus
  approved_by: string | null
  approval_note: string | null
  assignee_id: string | null
  due_date: string | null
  created_by: string
  created_at: string
  updated_at: string
  position: number
}

export interface TaskComment {
  id: string
  task_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
}

export interface Invitation {
  id: string
  organization_id: string
  project_id: string | null
  email: string
  role: MemberRole
  status: InvitationStatus
  invited_by: string
  token: string
  expires_at: string
  created_at: string
}

export interface ActivityLog {
  id: string
  organization_id: string
  project_id: string | null
  task_id: string | null
  user_id: string
  action: string
  metadata: Record<string, unknown>
  created_at: string
}

export interface TaskWithAssignee extends Task {
  assignee: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null
}

export interface TaskWithProject extends TaskWithAssignee {
  project: Pick<Project, 'id' | 'name' | 'color'>
}

export interface TaskWithDetails extends TaskWithAssignee {
  comments_count: number
}

export interface ProjectWithStats extends Project {
  tasks_count: number
  completed_tasks_count: number
  members_count: number
}

export interface ProjectWithMembers extends Project {
  members: (ProjectMember & { profile: Profile })[]
  tasks_count: number
  completed_tasks_count: number
}

export interface MemberWithTasks {
  user_id: string
  role: MemberRole
  profile: Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'email'>
  tasks: Task[]
}

export interface DashboardStats {
  due_today: number
  overdue: number
  completed_this_week: number
  total_active_tasks: number
  pending_approvals: number
}

// Action response types
export type ActionState =
  | { success: true; message: string; data?: unknown }
  | { success: false; message: string; errors?: Record<string, string[]> }
