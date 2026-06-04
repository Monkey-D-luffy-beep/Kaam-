'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Kanban, Users, BadgeCheck, ClipboardList, BarChart2, CalendarDays } from 'lucide-react'


/* ── kaam solutions ────────────────────────────────────────────────── */
const SOLUTIONS = [
  'One place for tasks, projects & updates',
  'Clear ownership on every task',
  'Real-time team visibility',
  'Approval flows without email chains',
  'Project timelines & calendars',
  'Balanced workloads, zero guesswork',
]

/* ── use cases ─────────────────────────────────────────────────────── */
const USE_CASES = [
  {
    icon: <Kanban className="h-5 w-5 text-white" />,
    solidBg: true,
    title: 'Project Management',
    desc: 'Create projects, break them into tasks, set deadlines, and track progress — all in one view.',
  },
  {
    icon: <ClipboardList className="h-5 w-5 text-white" />,
    solidBg: true,
    title: 'Task Assignment',
    desc: 'Assign tasks to the right person with priority, due date, and context attached.',
  },
  {
    icon: <Users className="h-5 w-5 text-white" />,
    solidBg: true,
    title: 'Team Visibility',
    desc: 'No more "can you send a status update?" — see exactly who is doing what, right now.',
  },
  {
    icon: <BarChart2 className="h-5 w-5 text-white" />,
    solidBg: true,
    title: 'Workload Balance',
    desc: 'Spot overloaded team members before they burn out. Redistribute with a glance.',
  },
  {
    icon: <BadgeCheck className="h-5 w-5 text-white" />,
    solidBg: true,
    title: 'Approval Flows',
    desc: 'Get sign-offs inside Kaam. Review, approve, or send back — no email back-and-forth.',
  },
  {
    icon: <CalendarDays className="h-5 w-5 text-white" />,
    solidBg: true,
    title: 'Project Timelines',
    desc: 'See the full picture of every project on a calendar. Spot bottlenecks before they hit.',
  },
]

export function LandingProblem() {
  const ref     = useRef(null)
  const useRef2 = useRef(null)
  const inView  = useInView(ref,     { once: true, margin: '-60px' })
  const inView2 = useInView(useRef2, { once: true, margin: '-60px' })

  return (
    <section className="py-28 px-6 bg-[#111111]" ref={ref}>
      <div className="max-w-6xl mx-auto">

        {/* ── header ───────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-[12px] font-semibold tracking-[0.12em] uppercase text-white/40 mb-4">The problem</p>
          <h2 className="text-[40px] sm:text-[52px] font-bold tracking-[-0.03em] text-white leading-[1.1] mb-4">
            Work shouldn&apos;t feel<br />this complicated.
          </h2>
          <p className="text-[16px] text-white/60 max-w-xl mx-auto">
            If you&apos;ve never used a project management tool before — this is why you need one. And why Kaam is the one to start with.
          </p>
        </motion.div>

        {/* ── chaos vs kaam split ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid lg:grid-cols-[1fr_380px] gap-5 mb-24"
        >

          {/* LEFT — hero video */}
          <div className="relative overflow-hidden min-h-[520px]" style={{ borderRadius: 0 }}>
            <video
              src="/Hero.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          {/* RIGHT — kaam calm */}
          <div className="bg-white rounded-2xl p-7 flex flex-col items-center text-center shadow-2xl">
            {/* Logo instead of "With Kaam" text */}
            <Image
              src="/transparent_logo.svg"
              alt="Kaam"
              width={100}
              height={23}
              className="mb-5"
            />

            {/* Solutions */}
            <ul className="w-full space-y-2.5 text-left mb-7">
              {SOLUTIONS.map((s, i) => (
                <motion.li
                  key={s}
                  initial={{ opacity: 0, x: 12 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.35, delay: 0.4 + i * 0.07 }}
                  className="flex items-center gap-2.5"
                >
                  <div className="h-5 w-5 rounded-full bg-[#4F46E5]/10 flex items-center justify-center shrink-0">
                    <span className="text-[#4F46E5] text-[10px] font-bold">✓</span>
                  </div>
                  <span className="text-[13px] text-[#444]">{s}</span>
                </motion.li>
              ))}
            </ul>

            <Link
              href="/signup"
              className="inline-flex items-center gap-2 h-10 px-5 rounded-xl text-white text-[13px] font-semibold transition-all hover:brightness-110 w-full justify-center"
              style={{ backgroundColor: '#4F46E5' }}
            >
              Start for free <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <p className="text-[11px] text-[#bbb] mt-2">Free to start · Works in 60 seconds</p>
          </div>
        </motion.div>

        {/* ── use cases ────────────────────────────────────────────── */}
        <div ref={useRef2}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView2 ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <p className="text-[12px] font-semibold tracking-[0.12em] uppercase text-white/40 mb-3">What Kaam does</p>
            <h3 className="text-[32px] sm:text-[40px] font-bold tracking-[-0.03em] text-white leading-tight">
              Everything your team needs.
            </h3>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {USE_CASES.map((uc, i) => (
              <motion.div
                key={uc.title}
                initial={{ opacity: 0, y: 24 }}
                animate={inView2 ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: i * 0.07 }}
                className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-6 hover:bg-white/[0.07] hover:border-white/[0.12] transition-all group"
              >
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center mb-5 transition-colors ${'solidBg' in uc && uc.solidBg ? 'bg-[#4F46E5] group-hover:bg-[#4338CA]' : 'bg-[#4F46E5]/15 text-2xl group-hover:bg-[#4F46E5]/25'}`}>
                  {uc.icon}
                </div>
                <h4 className="text-[16px] font-semibold text-white mb-2">{uc.title}</h4>
                <p className="text-[13px] text-white/55 leading-relaxed">{uc.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
