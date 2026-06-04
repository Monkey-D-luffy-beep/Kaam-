'use client'

import { motion } from 'framer-motion'

interface MascotProps {
  size?: number
  animate?: boolean
  className?: string
}

export function KaamMascot({ size = 64, animate = true, className = '' }: MascotProps) {
  return (
    <motion.div
      className={className}
      animate={animate ? { y: [0, -6, 0] } : {}}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
      >
        <defs>
          <linearGradient id="mascot-body" x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#5B53F0" />
            <stop offset="100%" stopColor="#4338CA" />
          </linearGradient>
          <linearGradient id="mascot-shine" x1="8" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="white" stopOpacity="0.15" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <filter id="mascot-shadow">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#4338CA" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Body */}
        <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#mascot-body)" filter="url(#mascot-shadow)" />
        <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#mascot-shine)" />

        {/* Left eye white */}
        <circle cx="22" cy="26" r="5" fill="white" />
        {/* Left pupil */}
        <motion.circle
          cx="23"
          cy="25"
          r="2.5"
          fill="#1E1B4B"
          animate={animate ? { cx: [23, 24, 23, 22, 23], cy: [25, 25, 24, 25, 25] } : {}}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        {/* Left eye shine */}
        <circle cx="25" cy="23" r="1.2" fill="white" opacity="0.7" />

        {/* Right eye white */}
        <circle cx="42" cy="26" r="5" fill="white" />
        {/* Right pupil */}
        <motion.circle
          cx="43"
          cy="25"
          r="2.5"
          fill="#1E1B4B"
          animate={animate ? { cx: [43, 44, 43, 42, 43], cy: [25, 25, 24, 25, 25] } : {}}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        {/* Right eye shine */}
        <circle cx="45" cy="23" r="1.2" fill="white" opacity="0.7" />

        {/* Smile */}
        <path
          d="M22 38 Q32 46 42 38"
          stroke="white"
          strokeWidth="2.8"
          strokeLinecap="round"
          fill="none"
        />

        {/* Cheeks */}
        <circle cx="16" cy="34" r="4" fill="#EC4899" opacity="0.3" />
        <circle cx="48" cy="34" r="4" fill="#EC4899" opacity="0.3" />

        {/* K badge bottom-right */}
        <circle cx="52" cy="52" r="9" fill="#4F46E5" />
        <text
          x="52"
          y="56.5"
          textAnchor="middle"
          fill="white"
          fontSize="10"
          fontWeight="bold"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          K
        </text>
      </svg>
    </motion.div>
  )
}

/* Blink variant — plays a quick blink every few seconds */
export function KaamMascotBlink({ size = 64, className = '' }: { size?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width={size} height={size}>
        <defs>
          <linearGradient id="mb2" x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#5B53F0" />
            <stop offset="100%" stopColor="#4338CA" />
          </linearGradient>
          <filter id="ms2">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#4338CA" floodOpacity="0.35" />
          </filter>
        </defs>
        <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#mb2)" filter="url(#ms2)" />
        <circle cx="22" cy="26" r="5" fill="white" />
        <circle cx="23" cy="25" r="2.5" fill="#1E1B4B" />
        <circle cx="25" cy="23" r="1.2" fill="white" opacity="0.7" />
        <circle cx="42" cy="26" r="5" fill="white" />
        <circle cx="43" cy="25" r="2.5" fill="#1E1B4B" />
        <circle cx="45" cy="23" r="1.2" fill="white" opacity="0.7" />
        <path d="M22 38 Q32 46 42 38" stroke="white" strokeWidth="2.8" strokeLinecap="round" fill="none" />
        <circle cx="16" cy="34" r="4" fill="#EC4899" opacity="0.3" />
        <circle cx="48" cy="34" r="4" fill="#EC4899" opacity="0.3" />
        <circle cx="52" cy="52" r="9" fill="#4F46E5" />
        <text x="52" y="56.5" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="system-ui, -apple-system, sans-serif">K</text>
      </svg>
    </motion.div>
  )
}
