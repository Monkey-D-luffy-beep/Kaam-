import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants'

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  redirect(ROUTES.projectBoard(projectId))
}
