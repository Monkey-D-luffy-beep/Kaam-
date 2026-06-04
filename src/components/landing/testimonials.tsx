'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { KaamMascot } from './mascot'

const EARLY_ADOPTER_PERKS = [
  { icon: '🎯', title: 'Free forever on current plan', body: 'Lock in free access to every feature you use today. No surprise billing as we grow.' },
  { icon: '💬', title: 'Direct line to the founder', body: 'You get my personal WhatsApp. Feature requests, bugs, feedback — I respond within hours.' },
  { icon: '🚀', title: 'Shape the roadmap', body: "You're not a user, you're a co-creator. Your problems become our next features." },
]

export function LandingTestimonials() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="py-28 px-6 bg-white" ref={ref}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <p className="text-[12px] font-semibold tracking-[0.12em] uppercase text-[#888] mb-4">Why join now</p>
          <h2 className="text-[40px] sm:text-[52px] font-bold tracking-[-0.03em] text-[#111] leading-[1.1] max-w-lg">
            The first 100 users build this with me.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Founder note */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="bg-[#FAFAF8] rounded-2xl border border-black/[0.06] p-8">
              <div className="flex items-center gap-4 mb-6">
                <KaamMascot size={52} animate />
                <div>
                  <p className="text-[15px] font-semibold text-[#111]">Saurav Payal</p>
                  <p className="text-[13px] text-[#888]">Founder, Kaam</p>
                </div>
              </div>
              <p className="text-[15px] text-[#444] leading-relaxed mb-4">
                &ldquo;I built Kaam because every project tool I tried was either too complex or too basic for small Indian teams.
              </p>
              <p className="text-[15px] text-[#444] leading-relaxed mb-4">
                Notion is a blank canvas. ClickUp is a cockpit. Monday is for enterprises. None of them were built for a 5-person agency in Bangalore trying to ship work on Friday.
              </p>
              <p className="text-[15px] text-[#444] leading-relaxed">
                I am building this in the open. If you join now — when it&apos;s early and rough — you get access forever, for free, and a direct line to me. Let&apos;s build it right together.&rdquo;
              </p>
            </div>

            <Link
              href="/signup"
              className="mt-5 inline-flex items-center gap-2 h-11 px-6 rounded-lg text-white text-[14px] font-semibold transition-all hover:brightness-110"
              style={{ backgroundColor: '#4F46E5' }}
            >
              Join as an early user
            </Link>
            <p className="mt-3 text-[12px] text-[#999]">No credit card · Takes 60 seconds</p>
          </motion.div>

          {/* Early adopter perks */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col gap-5"
          >
            {EARLY_ADOPTER_PERKS.map((perk, i) => (
              <motion.div
                key={perk.title}
                initial={{ opacity: 0, x: 20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.25 + i * 0.08 }}
                className="flex gap-5"
              >
                <div className="h-11 w-11 rounded-xl bg-[#4F46E5]/8 flex items-center justify-center text-xl shrink-0">
                  {perk.icon}
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-[#111] mb-1">{perk.title}</p>
                  <p className="text-[14px] text-[#666] leading-relaxed">{perk.body}</p>
                </div>
              </motion.div>
            ))}

            {/* Spots counter */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="mt-4 rounded-xl border border-[#4F46E5]/20 bg-[#4F46E5]/[0.04] p-5 flex items-center gap-4"
            >
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-[#111] mb-1">Early access spots</p>
                <div className="h-2 bg-[#4F46E5]/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-[#4F46E5]" style={{ width: '6%' }} />
                </div>
                <p className="mt-1.5 text-[12px] text-[#888]">6 of 100 claimed · 94 spots left</p>
              </div>
              <div className="text-3xl font-bold text-[#4F46E5] tabular-nums">94</div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
