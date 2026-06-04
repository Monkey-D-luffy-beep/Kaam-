import Link from 'next/link'
import Image from 'next/image'

export function LandingFooter() {
  return (
    <footer className="bg-[#0d0d0d] px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Image
              src="/transparent_logo.svg"
              alt="Kaam"
              width={80}
              height={18}
              className="h-5 w-auto brightness-0 invert opacity-80"
            />
            <span className="text-[13px] text-white/30">Less software. More Kaam.</span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link href="/privacy" className="text-[13px] text-white/50 hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="#" className="text-[13px] text-white/50 hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="#contact" className="text-[13px] text-white/50 hover:text-white transition-colors">
              Contact
            </Link>

            {/* LinkedIn — highlighted */}
            <Link
              href="https://www.linkedin.com/showcase/kaamhq/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#818CF8] border border-[#4F46E5]/40 rounded-full px-3 py-1 hover:bg-[#4F46E5]/15 hover:border-[#4F46E5]/70 transition-all"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </Link>

            <span className="text-[13px] text-white/25">© 2026 Kaam</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
