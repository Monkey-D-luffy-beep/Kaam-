import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { BoardView } from '@/components/board/board-view'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants'
import { ProjectTabs } from '@/components/projects/project-tabs'

interface BoardPageProps {
  params: Promise<{ projectId: string }>
}

export async function generateMetadata({ params }: BoardPageProps): Promise<Metadata> {
  const { projectId } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('projects').select('name').eq('id', projectId).single()
  return { title: data?.name ?? 'Board' }
}

export default async function BoardPage({ params }: BoardPageProps) {
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
    <div className="flex flex-1 flex-col h-full">
      <ProjectTabs projectId={projectId} projectName={project.name} active="board" />
      <div className="flex-1 overflow-hidden">
        <BoardView
          project={project}
          tasks={tasksRes.data as any ?? []}
          members={membersRes.data as any ?? []}
          currentUserId={user.id}
        />
      </div>
    </div>
  )
}
