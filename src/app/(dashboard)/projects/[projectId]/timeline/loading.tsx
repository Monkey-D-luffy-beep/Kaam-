import { Skeleton } from '@/components/ui/skeleton'

export default function TimelineLoading() {
  return (
    <div className="flex flex-1 flex-col h-full">
      <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
      </header>
      <div className="p-4 sm:p-6 space-y-6 max-w-3xl">
        <div className="flex gap-3">
          <Skeleton className="h-8 w-40 rounded-lg" />
          <Skeleton className="h-8 w-36 rounded-lg" />
        </div>
        {['This Week', 'Next Week'].map(label => (
          <div key={label} className="space-y-2">
            <Skeleton className="h-3 w-24" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                <Skeleton className="h-2 w-2 rounded-full" />
                <Skeleton className="h-3.5 flex-1" />
                <Skeleton className="h-4 w-12 rounded-full" />
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
