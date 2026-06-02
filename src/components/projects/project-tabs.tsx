'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'

interface ProjectTabsProps {
  projectId: string
  projectName: string
  active: 'board' | 'timeline' | 'workload' | 'settings'
}

const TABS = [
  { id: 'board', label: 'Board', href: (id: string) => ROUTES.projectBoard(id) },
  { id: 'timeline', label: 'Timeline', href: (id: string) => ROUTES.projectTimeline(id) },
  { id: 'workload', label: 'Workload', href: (id: string) => ROUTES.projectWorkload(id) },
] as const

export function ProjectTabs({ projectId, projectName, active }: ProjectTabsProps) {
  return (
    <header className="flex h-12 shrink-0 flex-col border-b">
      <div className="flex items-center gap-2 px-4 h-full">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-4 mr-1" />
        <span className="text-sm font-semibold truncate mr-2">{projectName}</span>
        <div className="flex items-center gap-0.5 flex-1">
          {TABS.map(tab => (
            <Link
              key={tab.id}
              href={tab.href(projectId)}
              className={cn(
                'px-3 py-1 rounded-md text-xs font-medium transition-colors',
                active === tab.id
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {tab.label}
            </Link>
          ))}
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" render={<Link href={ROUTES.projectSettings(projectId)} />}>
          <Settings className="h-3.5 w-3.5" />
        </Button>
      </div>
    </header>
  )
}
