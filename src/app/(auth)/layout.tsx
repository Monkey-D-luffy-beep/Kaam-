import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: {
    default: 'Sign in to Kaam',
    template: '%s | Kaam',
  },
}

const FEATURES = [
  'Board, timeline & workload — one place',
  'See who is doing what, right now',
  'Built for Indian teams, priced in ₹',
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left: Brand panel */}
      <div className="hidden lg:flex lg:w-[44%] xl:w-[40%] flex-col justify-between bg-[#111111] px-12 py-10 select-none">
        <Link href="/" className="block w-fit">
          <Image
            src="/transparent_logo.svg"
            alt="Kaam"
            width={96}
            height={22}
            className="brightness-0 invert"
            priority
          />
        </Link>

        <div className="space-y-8">
          <p className="text-white text-[32px] font-semibold leading-[1.25] tracking-tight">
            Less software.<br />More Kaam.
          </p>
          <ul className="space-y-3.5">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3 text-white/50 text-sm">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#4F46E5]" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-white/20 text-xs">© 2026 Kaam. All rights reserved.</p>
      </div>

      {/* Right: Form panel */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-12 sm:px-10">
        <div className="w-full max-w-[360px]">
          {/* Mobile-only logo */}
          <div className="mb-8 lg:hidden flex justify-center">
            <Link href="/">
              <Image
                src="/transparent_logo.svg"
                alt="Kaam"
                width={88}
                height={20}
                priority
              />
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
