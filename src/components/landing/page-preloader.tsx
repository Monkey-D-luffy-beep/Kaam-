'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const HOLD_MS = 2200
const ROLL_S  = 1.2
const GONE_MS = HOLD_MS + ROLL_S * 1000 + 300
const MOTOR: [number, number, number, number] = [0.4, 0, 0.8, 1]

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
    <div className="fixed inset-0 z-[200] overflow-hidden pointer-events-auto bg-black">
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/shutter2.png)',
          backgroundSize: 'contain',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
        }}
        animate={isRolling ? { y: '-102%' } : { y: 0 }}
        transition={{ duration: ROLL_S, ease: MOTOR }}
      >
        {/* Loading bar */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="relative h-1 w-44 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <motion.div
              className="absolute left-0 top-0 h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #F97316, #f5d442)' }}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: HOLD_MS / 1000 - 0.2, ease: [0.4, 0, 0.2, 1] }}
            />
          </div>
          <motion.p
            className="text-[10px] font-semibold tracking-[0.3em] uppercase"
            style={{ color: '#f5d442', textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          >
            Opening Kaam...
          </motion.p>
        </div>
      </motion.div>
    </div>
  )
}
