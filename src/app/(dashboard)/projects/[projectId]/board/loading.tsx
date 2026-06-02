import { Skeleton } from '@/components/ui/skeleton'

export default function BoardLoading() {
  return (
    <div className="flex flex-1 flex-col h-full">
      {/* Tabs header skeleton */}
      <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-3 w-px mx-1" />
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-1 ml-2">
          <Skeleton className="h-6 w-14 rounded-md" />
          <Skeleton className="h-6 w-16 rounded-md" />
          <Skeleton className="h-6 w-18 rounded-md" />
        </div>
      </header>

      {/* Board columns skeleton */}
      <div className="flex h-full gap-4 overflow-x-auto p-4 sm:p-6">
        {['To Do', 'In Progress', 'Done'].map((col) => (
          <div key={col} className="flex w-72 shrink-0 flex-col rounded-xl border bg-muted/40 border-t-2 border-t-slate-300">
            <div className="flex items-center justify-between px-3 py-2.5">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3.5 w-16" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
            </div>
            <div className="flex flex-col gap-2 p-2">
              {Array.from({ length: col === 'In Progress' ? 3 : col === 'To Do' ? 4 : 2 }).map((_, i) => (
                <div key={i} className="rounded-lg border bg-card p-3 space-y-2.5">
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-2.5 w-4/5" />
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                      <Skeleton className="h-4 w-12 rounded-full" />
                      <Skeleton className="h-4 w-14 rounded-full" />
                    </div>
                    <Skeleton className="h-5 w-5 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
