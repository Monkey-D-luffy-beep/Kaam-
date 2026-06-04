import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: {
    default: 'Sign in to Kaam',
    template: '%s | Kaam',
  },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
      <div className="mb-8 flex flex-col items-center gap-2">
        <Image src="/3.svg" alt="Kaam" width={64} height={64} className="h-12 w-auto rounded-xl" />
      </div>
      {children}
    </div>
  )
}
