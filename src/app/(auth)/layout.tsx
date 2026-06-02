import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Sign in to Kaam',
    template: '%s | Kaam',
  },
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background">
          <span className="text-lg font-bold">K</span>
        </div>
        <span className="text-xl font-semibold tracking-tight">Kaam</span>
      </div>
      {children}
    </div>
  )
}
