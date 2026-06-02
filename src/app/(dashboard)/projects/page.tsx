import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/page-header'
import { ProjectsClient } from '@/components/projects/projects-client'

export const metadata: Metadata = { title: 'Projects' }

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: projects } = await supabase
    .from('projects')
    .select(`
      *,
      project_members(count),
      tasks(count)
    `)
    .order('created_at', { ascending: false })

  const params = await searchParams
  const openNewDialog = params.new === '1'

  return (
    <div className="flex flex-1 flex-col gap-0">
      <PageHeader title="Projects" description="Manage your projects and workspaces" />
      <div className="flex flex-1 flex-col p-4 sm:p-6">
        <ProjectsClient projects={projects ?? []} openNewDialog={openNewDialog} />
      </div>
    </div>
  )
}
