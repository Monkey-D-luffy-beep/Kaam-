'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function LandingCTA() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="py-28 px-6" style={{ backgroundColor: '#111111' }} ref={ref}>
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-[40px] sm:text-[56px] font-bold tracking-[-0.03em] text-white leading-[1.1] mb-6">
            Stop managing tools.
            <br />
            <span style={{ color: '#818CF8' }}>Start doing Kaam.</span>
          </h2>
          <p className="text-[17px] text-[#777] leading-relaxed mb-10 max-w-xl mx-auto">
            Project management your whole team will actually use. Simple, fast, built for small teams.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 h-12 px-7 rounded-lg text-white text-[15px] font-semibold transition-all hover:brightness-110"
              style={{ backgroundColor: '#4F46E5' }}
            >
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center h-12 px-7 rounded-lg border border-white/15 text-white text-[15px] font-medium hover:bg-white/5 transition-colors"
            >
              Sign in
            </Link>
          </div>

          <p className="mt-6 text-[12px] text-[#555]">
            Free to start · No contracts · Works in 60 seconds
          </p>
        </motion.div>
      </div>
    </section>
  )
}
