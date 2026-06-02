import { Skeleton } from '@/components/ui/skeleton'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'

export default function ProjectsLoading() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Skeleton className="h-4 w-20" />
        <div className="ml-auto">
          <Skeleton className="h-7 w-28" />
        </div>
      </header>

      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-4 space-y-3">
              <div className="h-1 rounded-t-xl bg-muted absolute inset-x-0 top-0" />
              <div className="flex items-center gap-2.5 mt-1">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-2/3" />
                  <Skeleton className="h-2.5 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-7 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
