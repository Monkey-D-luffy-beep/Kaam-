'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

/* ─── timing ──────────────────────────────────────────────────────── */
const HOLD_MS = 1800
const ROLL_S  = 1.1
const GONE_MS = HOLD_MS + ROLL_S * 1000 + 200

/* ─── shutter motor easing ────────────────────────────────────────── */
const MOTOR: [number, number, number, number] = [0.45, 0, 0.85, 1]

/* ─── Indian sky-blue corrugated metal texture ────────────────────── */
const SHUTTER_BG = `
  repeating-linear-gradient(
    to bottom,
    #3a7fc1  0px,
    #4189cc  2px,
    #4d94d6  4px,
    #5a9fde  7px,
    #62a6e3  9px,
    #5a9fde 11px,
    #4d94d6 13px,
    #4189cc 15px,
    #3a7fc1 17px
  )
`.trim()

export function PagePreloader() {
  const [isRolling, setIsRolling] = useState(false)
  const [isDone,    setIsDone]    = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setIsRolling(true), HOLD_MS)
    const t2 = setTimeout(() => setIsDone(true),    GONE_MS)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  if (isDone) return null

  return (
    <div className="fixed inset-0 z-[200] pointer-events-auto overflow-hidden">

      {/* ── shutter panel ─────────────────────────────────────────── */}
      <motion.div
        className="absolute inset-0 flex flex-col"
        style={{ backgroundImage: SHUTTER_BG }}
        animate={isRolling ? { y: '-102%' } : { y: 0 }}
        transition={{ duration: ROLL_S, ease: MOTOR }}
      >
        {/* Guide track — left */}
        <div className="absolute left-0 top-0 bottom-0 w-5 bg-[#2d6aaa] border-r border-black/20" />
        {/* Guide track — right */}
        <div className="absolute right-0 top-0 bottom-0 w-5 bg-[#2d6aaa] border-l border-black/20" />

        {/* Roller housing at top */}
        <div
          className="absolute top-0 left-0 right-0 h-10"
          style={{ background: 'linear-gradient(to bottom, #1a4d84, #2d6aaa)' }}
        />

        {/* ── shop text painted on the shutter ─────────────────── */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none select-none">
          {/* Shop name */}
          <p className="text-white/30 text-[11px] tracking-[0.35em] uppercase font-medium">
            Welcome to
          </p>
          <p
            className="text-white font-black tracking-[0.25em] uppercase"
            style={{ fontSize: 'clamp(28px, 5vw, 52px)', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
          >
            KAAM
          </p>
          <p className="text-white/60 text-[12px] tracking-[0.15em] font-medium">
            Project Management
          </p>

          {/* Divider */}
          <div className="h-px w-24 bg-white/20 my-1" />

          {/* Open hours */}
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-white/40" />
            <p className="text-white/80 text-[13px] font-semibold tracking-wider">
              Open: 9 AM – 5 PM
            </p>
            <div className="h-1.5 w-1.5 rounded-full bg-white/40" />
          </div>
          <p className="text-white/55 text-[11px] tracking-[0.12em] font-medium">
            Monday to Friday
          </p>

          {/* Loading bar */}
          <div className="mt-4 relative h-[2px] w-28 rounded-full overflow-hidden bg-white/15">
            <motion.div
              className="absolute left-0 top-0 h-full rounded-full bg-white/70"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: HOLD_MS / 1000 - 0.1, ease: [0.4, 0, 0.2, 1] }}
            />
          </div>
        </div>

        {/* Bottom lip */}
        <div
          className="absolute bottom-0 left-0 right-0 h-6"
          style={{
            background: 'linear-gradient(to bottom, #3a7fc1, #1a4d84)',
            boxShadow: '0 8px 28px rgba(0,0,0,0.5)',
          }}
        />

        {/* Centre latch */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-3">
          <div className="h-[2px] w-14 rounded-full bg-white/20" />
          <div className="h-5 w-5 rounded-full border-2 border-white/25 bg-[#2d6aaa]" />
          <div className="h-[2px] w-14 rounded-full bg-white/20" />
        </div>
      </motion.div>

      {/* Kaam logo — fades out as shutter lifts */}
      <motion.div
        className="absolute inset-0 z-10 flex items-end justify-center pb-8 pointer-events-none select-none"
        animate={isRolling ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        <Image
          src="/transparent_logo.svg"
          alt="Kaam"
          width={100}
          height={23}
          className="brightness-0 invert opacity-30"
          priority
        />
      </motion.div>
    </div>
  )
}
