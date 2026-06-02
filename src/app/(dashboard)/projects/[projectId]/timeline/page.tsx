import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProjectTabs } from '@/components/projects/project-tabs'
import { TimelineView } from '@/components/timeline/timeline-view'

interface TimelinePageProps {
  params: Promise<{ projectId: string }>
}

export async function generateMetadata({ params }: TimelinePageProps): Promise<Metadata> {
  const { projectId } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('projects').select('name').eq('id', projectId).single()
  return { title: `${data?.name ?? 'Project'} — Timeline` }
}

export default async function TimelinePage({ params }: TimelinePageProps) {
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

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*, assignee:profiles!assignee_id(id, full_name, avatar_url)')
    .eq('project_id', projectId)
    .order('due_date', { ascending: true, nullsFirst: false })

  const { data: members } = await supabase
    .from('project_members')
    .select('user_id, role, profile:profiles(id, full_name, avatar_url)')
    .eq('project_id', projectId)

  return (
    <div className="flex flex-1 flex-col h-full">
      <ProjectTabs projectId={projectId} projectName={project.name} active="timeline" />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <TimelineView
          tasks={tasks as any ?? []}
          members={members as any ?? []}
          projectId={projectId}
        />
      </div>
    </div>
  )
}
