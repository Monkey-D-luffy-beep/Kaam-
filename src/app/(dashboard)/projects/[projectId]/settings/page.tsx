import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/page-header'
import { ProjectSettingsClient } from '@/components/projects/project-settings-client'

interface SettingsPageProps {
  params: Promise<{ projectId: string }>
}

export async function generateMetadata({ params }: SettingsPageProps): Promise<Metadata> {
  const { projectId } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('projects').select('name').eq('id', projectId).single()
  return { title: `${data?.name ?? 'Project'} Settings` }
}

export default async function ProjectSettingsPage({ params }: SettingsPageProps) {
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

  const { data: members } = await supabase
    .from('project_members')
    .select('*, profile:profiles(id, email, full_name, avatar_url)')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })

  const currentMember = members?.find((m) => m.user_id === user.id)
  const isAdmin = currentMember?.role === 'owner' || currentMember?.role === 'admin'

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title={`${project.name} — Settings`} />
      <div className="flex-1 p-4 sm:p-6 max-w-2xl">
        <ProjectSettingsClient
          project={project}
          members={members as any ?? []}
          currentUserId={user.id}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  )
}
