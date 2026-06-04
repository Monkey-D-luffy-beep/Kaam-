'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

function ClientPortalMockup() {
  return (
    <div className="bg-white rounded-2xl border border-black/[0.08] shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-[#111] px-6 py-5">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-[11px] text-gray-400 mb-1">Shared by Gridworks Agency</p>
            <h3 className="text-white font-semibold text-[16px]">Website Redesign — Client View</h3>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-gray-400">Delivery</p>
            <p className="text-white font-medium text-[13px]">July 28, 2025</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between mb-1.5">
            <span className="text-[12px] text-gray-400">Overall progress</span>
            <span className="text-[12px] font-semibold text-white">68%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: '68%' }}
              transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
              className="h-full bg-[#4F46E5] rounded-full"
            />
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Status cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Completed', value: '17', color: '#22c55e', bg: '#f0fdf4' },
            { label: 'In Progress', value: '8', color: '#3b82f6', bg: '#eff6ff' },
            { label: 'Upcoming', value: '5', color: '#f97316', bg: '#fff7ed' },
          ].map(s => (
            <div key={s.label} className="rounded-lg p-3 text-center" style={{ backgroundColor: s.bg }}>
              <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[11px] mt-0.5" style={{ color: s.color }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Milestones */}
        <div>
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2.5">Milestones</p>
          <div className="space-y-2">
            {[
              { label: 'Discovery & Research', status: 'done', date: 'Jun 5' },
              { label: 'Wireframes & IA', status: 'done', date: 'Jun 18' },
              { label: 'Visual Design', status: 'in_progress', date: 'Jul 2' },
              { label: 'Development', status: 'upcoming', date: 'Jul 14' },
              { label: 'QA & Launch', status: 'upcoming', date: 'Jul 28' },
            ].map(m => (
              <div key={m.label} className="flex items-center gap-3">
                <div className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${
                  m.status === 'done' ? 'bg-green-500' :
                  m.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-200'
                }`}>
                  {m.status === 'done' && <span className="text-white text-[8px]">✓</span>}
                  {m.status === 'in_progress' && <span className="text-white text-[8px]">●</span>}
                </div>
                <span className={`text-[12px] flex-1 ${m.status === 'done' ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                  {m.label}
                </span>
                <span className="text-[11px] text-gray-400">{m.date}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-[11px] text-gray-400">No login required · View only</p>
          <div className="h-6 w-6 rounded bg-[#111] flex items-center justify-center">
            <span className="text-white text-[9px] font-bold">K</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function LandingClientPortal() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="py-28 px-6" style={{ backgroundColor: '#FAFAF8' }} ref={ref}>
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-[40px] sm:text-[48px] font-bold tracking-[-0.03em] text-[#111] leading-[1.1] mb-6">
              Keep clients informed.
              <br />
              Without meetings.
            </h2>
            <p className="text-[16px] text-[#666] leading-relaxed mb-8">
              Share a secure link with your client. They see exactly what you choose — progress, milestones, completed tasks. No login. No Zoom calls just to give a status update.
            </p>
            <div className="space-y-3">
              {[
                'One link, nothing to install',
                'Real-time progress tracking',
                'Milestone timeline view',
                'No client account needed',
              ].map(f => (
                <div key={f} className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-[#4F46E5]/10 flex items-center justify-center shrink-0">
                    <span className="text-[#4F46E5] text-[10px] font-bold">✓</span>
                  </div>
                  <span className="text-[14px] text-[#444]">{f}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <ClientPortalMockup />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
