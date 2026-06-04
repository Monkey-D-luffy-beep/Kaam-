'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, CheckCircle } from 'lucide-react'
import Image from 'next/image'

export function LandingWaitlist() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'landing_footer' }),
      })
      if (res.ok) {
        setStatus('success')
      } else {
        const data = await res.json()
        setStatus('error')
        setErrorMsg(data.error ?? 'Something went wrong. Try again.')
      }
    } catch {
      setStatus('error')
      setErrorMsg('Network error. Please try again.')
    }
  }

  return (
    <section className="py-20 px-6" style={{ backgroundColor: '#F5F4FF' }} ref={ref}>
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="flex justify-center mb-6"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Image
              src="/mascot_option2.png"
              alt="Kaam mascot"
              width={80}
              height={80}
              className="rounded-xl"
            />
          </motion.div>

          <h2 className="text-[28px] sm:text-[36px] font-bold tracking-[-0.03em] text-[#111] leading-[1.15] mb-3">
            Stay in the loop.
          </h2>
          <p className="text-[15px] text-[#666] mb-8 max-w-sm mx-auto">
            Get one update when we ship something worth seeing — no spam, ever.
          </p>

          {status === 'success' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-3 bg-white border border-emerald-200 rounded-xl px-6 py-4 text-emerald-700"
            >
              <CheckCircle className="h-5 w-5 shrink-0" />
              <span className="text-[15px] font-medium">You&apos;re on the list. I&apos;ll be in touch.</span>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 h-12 rounded-xl border border-black/10 bg-white px-4 text-[14px] text-[#111] placeholder-[#bbb] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15 transition-all"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl text-white text-[14px] font-semibold transition-all hover:brightness-110 disabled:opacity-60 shrink-0"
                style={{ backgroundColor: '#4F46E5' }}
              >
                {status === 'loading' ? (
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Keep me posted
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {status === 'error' && (
            <p className="mt-3 text-[13px] text-red-600">{errorMsg}</p>
          )}

          <p className="mt-4 text-[12px] text-[#aaa]">No spam. Unsubscribe in one click.</p>
        </motion.div>
      </div>
    </section>
  )
}
