import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/page-header'
import { PeopleView } from '@/components/team/people-view'

export const metadata: Metadata = { title: 'Team — People' }

export default async function TeamPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get all projects this user is a member of
  const { data: myMemberships } = await supabase
    .from('project_members')
    .select('project_id, role, project:projects(id, name, color, status)')
    .eq('user_id', user.id)

  const activeProjects = (myMemberships ?? [])
    .filter(m => (m.project as any)?.status === 'active')
    .map(m => ({ projectId: m.project_id, role: m.role, project: m.project as any }))

  if (activeProjects.length === 0) {
    return (
      <div className="flex flex-1 flex-col">
        <PageHeader title="Team" description="Cross-project people overview" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">You have no active projects yet.</p>
        </div>
      </div>
    )
  }

  const projectIds = activeProjects.map(p => p.projectId)

  // Get all members across all your projects
  const { data: allMembers } = await supabase
    .from('project_members')
    .select('project_id, user_id, role, profile:profiles(id, full_name, avatar_url, email)')
    .in('project_id', projectIds)

  // Get all active tasks assigned to those people in those projects
  const memberUserIds = [...new Set((allMembers ?? []).map(m => m.user_id))]

  const { data: allTasks } = await supabase
    .from('tasks')
    .select('id, title, status, priority, effort, due_date, approval_status, project_id, assignee_id, created_at')
    .in('project_id', projectIds)
    .in('assignee_id', memberUserIds)
    .order('due_date', { ascending: true, nullsFirst: false })

  // Build people map: user_id → { profile, projects they're in, tasks }
  const peopleMap = new Map<string, {
    userId: string
    profile: any
    projectRoles: { projectId: string; projectName: string; projectColor: string; role: string }[]
    tasks: any[]
  }>()

  for (const m of allMembers ?? []) {
    if (!peopleMap.has(m.user_id)) {
      peopleMap.set(m.user_id, {
        userId: m.user_id,
        profile: m.profile,
        projectRoles: [],
        tasks: [],
      })
    }
    const proj = activeProjects.find(p => p.projectId === m.project_id)
    if (proj) {
      peopleMap.get(m.user_id)!.projectRoles.push({
        projectId: m.project_id,
        projectName: proj.project.name,
        projectColor: proj.project.color,
        role: m.role,
      })
    }
  }

  for (const task of allTasks ?? []) {
    if (task.assignee_id && peopleMap.has(task.assignee_id)) {
      const proj = activeProjects.find(p => p.projectId === task.project_id)
      peopleMap.get(task.assignee_id)!.tasks.push({
        ...task,
        projectName: proj?.project?.name ?? 'Unknown',
        projectColor: proj?.project?.color ?? '#6366f1',
      })
    }
  }

  // Exclude current user from people (they see themselves on dashboard)
  const people = [...peopleMap.values()].filter(p => p.userId !== user.id)

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title="Team" description="See everyone's tasks and deadlines across all projects" />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <PeopleView people={people} currentUserId={user.id} />
      </div>
    </div>
  )
}
