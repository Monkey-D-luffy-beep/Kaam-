'use client'

import { useState, useEffect } from 'react'
import type { Project } from '@/types'
import { Button } from '@/components/ui/button'
import { Plus, FolderOpen } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'
import { ProjectCard } from '@/components/projects/project-card'
import { CreateProjectDialog } from '@/components/projects/create-project-dialog'

interface ProjectsClientProps {
  projects: Project[]
  openNewDialog: boolean
}

export function ProjectsClient({ projects, openNewDialog }: ProjectsClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const active = projects.filter((p) => p.status === 'active')
  const archived = projects.filter((p) => p.status === 'archived')

  useEffect(() => {
    if (openNewDialog) setDialogOpen(true)
  }, [openNewDialog])

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-medium text-muted-foreground">
          {active.length} active project{active.length !== 1 ? 's' : ''}
        </h2>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          New Project
        </Button>
      </div>

      {active.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No projects yet"
          description="Create your first project to start managing tasks"
          action={{ label: 'Create Project', onClick: () => setDialogOpen(true) }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {active.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {archived.length > 0 && (
        <div className="mt-10">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
            Archived ({archived.length})
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 opacity-60">
            {archived.map((project) => (
              <ProjectCard key={project.id} project={project} archived />
            ))}
          </div>
        </div>
      )}

      <CreateProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  )
}
