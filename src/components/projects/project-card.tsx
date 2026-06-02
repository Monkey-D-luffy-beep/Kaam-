'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { Project } from '@/types'
import { ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Kanban, Settings, Archive, RotateCcw } from 'lucide-react'
import { archiveProject, unarchiveProject } from '@/actions/projects'
import { toast } from 'sonner'

interface ProjectCardProps {
  project: Project
  archived?: boolean
}

export function ProjectCard({ project, archived = false }: ProjectCardProps) {
  const [loading, setLoading] = useState(false)

  async function handleArchive() {
    setLoading(true)
    const result = archived
      ? await unarchiveProject(project.id)
      : await archiveProject(project.id)
    setLoading(false)
    if (result.success) {
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
  }

  return (
    <div
      className={cn(
        'group relative flex flex-col rounded-xl border bg-card p-4 transition-shadow hover:shadow-sm',
        archived && 'opacity-70'
      )}
    >
      <div
        className="absolute inset-x-0 top-0 h-1 rounded-t-xl"
        style={{ backgroundColor: project.color }}
      />

      <div className="flex items-start justify-between mt-1">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="h-8 w-8 shrink-0 rounded-lg flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: project.color }}
          >
            {project.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{project.name}</p>
            {project.description && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {project.description}
              </p>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 shrink-0"
              />
            }
          >
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem render={<Link href={ROUTES.projectBoard(project.id)} />}>
              <Kanban className="mr-2 h-4 w-4" />
              Open Board
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href={ROUTES.projectSettings(project.id)} />}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={handleArchive}
              disabled={loading}
              className={archived ? '' : 'text-muted-foreground'}
            >
              {archived ? (
                <>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Restore
                </>
              ) : (
                <>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4">
        <Button
          variant="secondary"
          size="sm"
          className="w-full text-xs"
          render={<Link href={ROUTES.projectBoard(project.id)} />}
        >
          <Kanban className="mr-1.5 h-3.5 w-3.5" />
          Board
        </Button>
      </div>
    </div>
  )
}
