import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProjectTabs } from '@/components/projects/project-tabs'
import { WorkloadView } from '@/components/workload/workload-view'

interface WorkloadPageProps {
  params: Promise<{ projectId: string }>
}

export async function generateMetadata({ params }: WorkloadPageProps): Promise<Metadata> {
  const { projectId } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('projects').select('name').eq('id', projectId).single()
  return { title: `${data?.name ?? 'Project'} — Workload` }
}

export default async function WorkloadPage({ params }: WorkloadPageProps) {
  const { projectId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (!project) notFound()

  const [membersRes, tasksRes, pendingApprovalsRes] = await Promise.all([
    supabase
      .from('project_members')
      .select('user_id, role, profile:profiles(id, full_name, avatar_url, email)')
      .eq('project_id', projectId),

    supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .neq('status', 'done'),

    supabase
      .from('tasks')
      .select('id, title, assignee_id, due_date, priority, effort')
      .eq('project_id', projectId)
      .eq('approval_status', 'pending_approval'),
  ])

  // Build member workload data
  const memberWorkloads = (membersRes.data ?? []).map(member => {
    const memberTasks = (tasksRes.data ?? []).filter(t => t.assignee_id === member.user_id)
    return {
      ...member,
      tasks: memberTasks,
      taskCounts: {
        quick: memberTasks.filter(t => t.effort === 'quick').length,
        medium: memberTasks.filter(t => t.effort === 'medium').length,
        large: memberTasks.filter(t => t.effort === 'large').length,
        total: memberTasks.length,
        overdue: memberTasks.filter(t => t.due_date && new Date(t.due_date) < new Date()).length,
      },
    }
  })

  const currentMember = membersRes.data?.find(m => m.user_id === user.id)
  const currentRole = (currentMember?.role ?? 'member') as string

  return (
    <div className="flex flex-1 flex-col h-full">
      <ProjectTabs projectId={projectId} projectName={project.name} active="workload" />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <WorkloadView
          memberWorkloads={memberWorkloads as any}
          pendingApprovals={pendingApprovalsRes.data as any ?? []}
          projectId={projectId}
          currentUserId={user.id}
          currentRole={currentRole}
        />
      </div>
    </div>
  )
}
