'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const PILLARS = [
  {
    title: 'Simple',
    body: 'No configuration required. Create a project, add tasks, and start working — in under 60 seconds. Every feature earns its place.',
  },
  {
    title: 'Fast',
    body: "The UI responds instantly. Actions feel snappy. Realtime updates across your team so you're never looking at stale data.",
  },
  {
    title: 'Collaborative',
    body: 'Effort tracking, approval flows, workload views. Everyone knows what needs to happen next and who is responsible for it.',
  },
  {
    title: 'Focused',
    body: "We deliberately don't build features you won't use. Kaam does fewer things than the competition — and does all of them better.",
  },
]

export function LandingWhyKaam() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="why" className="py-28 px-6 bg-white" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <p className="text-[12px] font-semibold tracking-[0.12em] uppercase text-[#888] mb-4">Why Kaam</p>
          <h2 className="text-[40px] sm:text-[52px] font-bold tracking-[-0.03em] text-[#111] leading-[1.1] max-w-xl">
            Built for getting work done.
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <h3 className="text-[18px] font-semibold text-[#111] mb-3">{p.title}</h3>
              <p className="text-[14px] text-[#666] leading-relaxed">{p.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
