import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TableView } from '@/components/board/table-view'
import { ProjectTabs } from '@/components/projects/project-tabs'

interface TablePageProps {
  params: Promise<{ projectId: string }>
}

export async function generateMetadata({ params }: TablePageProps): Promise<Metadata> {
  const { projectId } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('projects').select('name').eq('id', projectId).single()
  return { title: data?.name ? `${data.name} — Table` : 'Table' }
}

export default async function TablePage({ params }: TablePageProps) {
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

  const [tasksRes, membersRes] = await Promise.all([
    supabase
      .from('tasks')
      .select('*, assignee:profiles!assignee_id(id, full_name, avatar_url)')
      .eq('project_id', projectId)
      .order('position', { ascending: true }),

    supabase
      .from('project_members')
      .select('*, profile:profiles(id, full_name, avatar_url)')
      .eq('project_id', projectId),
  ])

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      <ProjectTabs projectId={projectId} projectName={project.name} active="table" />
      <div className="flex-1 overflow-auto">
        <TableView
          project={project}
          tasks={tasksRes.data as any ?? []}
          members={membersRes.data as any ?? []}
          currentUserId={user.id}
        />
      </div>
    </div>
  )
}
