'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, Calendar, CheckCircle2 } from 'lucide-react'
import emailjs from '@emailjs/browser'

// ── Replace with your Cal.com username and event slug ──────────────
// Sign up free at cal.com, create a "30 min Kaam Demo" event, then set:
const CAL_LINK = 'saurav-payal/kaam-demo-30-min'

export function LandingContact() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  // Load Cal.com embed script once
  useEffect(() => {
    if (document.getElementById('cal-embed-script')) return
    const script = document.createElement('script')
    script.id  = 'cal-embed-script'
    script.src = 'https://app.cal.com/embed/embed.js'
    script.async = true
    script.onload = () => {
      const Cal = (window as any).Cal
      if (!Cal) return
      Cal('init', { origin: 'https://app.cal.com' })
      Cal('ui', {
        theme: 'light',
        hideEventTypeDetails: false,
        layout: 'month_view',
        styles: { branding: { brandColor: '#4F46E5' } },
      })
    }
    document.head.appendChild(script)
  }, [])

  const [form,   setForm]   = useState({ name: '', email: '', phone: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error,  setError]  = useState('')

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setError('')

    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        {
          name:    form.name,
          email:   form.email,
          phone:   form.phone || 'Not provided',
          message: form.message,
          time:    new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      )
      setStatus('success')
    } catch {
      setStatus('error')
      setError('Failed to send. Please try emailing directly.')
    }
  }

  return (
    <section id="contact" className="py-24 px-6 bg-[#FAFAF8]" ref={ref}>
      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-16 items-start">

          {/* ── left: intro ─────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[12px] font-semibold tracking-[0.12em] uppercase text-[#888] mb-4">Contact</p>
            <h2 className="text-[36px] sm:text-[44px] font-bold tracking-[-0.03em] text-[#111] leading-[1.1] mb-5">
              Let&apos;s talk.
            </h2>
            <p className="text-[15px] text-[#666] leading-relaxed mb-8">
              Have a question, want a demo, or just want to say hi? Fill in the form and I&apos;ll get back to you within a few hours.
            </p>

            {/* Schedule meeting */}
            <div className="bg-white border border-black/[0.08] rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-xl bg-[#4F46E5]/10 flex items-center justify-center shrink-0">
                  <Calendar className="h-4 w-4 text-[#4F46E5]" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[#111]">Schedule a meeting</p>
                  <p className="text-[12px] text-[#888]">30-min product walkthrough</p>
                </div>
              </div>
              <p className="text-[13px] text-[#666] mb-4 leading-relaxed">
                Want to see Kaam in action? Book a 30-minute call and I&apos;ll walk you through the product personally.
              </p>
              <button
                onClick={() => {
                  const Cal = (window as any).Cal
                  if (Cal) {
                    Cal('modal', {
                      calLink: CAL_LINK,
                      config: { layout: 'month_view' },
                    })
                  } else {
                    window.open(`https://cal.com/${CAL_LINK}`, '_blank')
                  }
                }}
                className="inline-flex items-center gap-2 h-9 px-4 rounded-lg text-white text-[13px] font-semibold transition-all hover:brightness-110"
                style={{ backgroundColor: '#4F46E5' }}
              >
                <Calendar className="h-3.5 w-3.5" />
                Book a 30-min demo
              </button>
            </div>
          </motion.div>

          {/* ── right: form ─────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {status === 'success' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border border-emerald-200 rounded-2xl p-10 flex flex-col items-center text-center gap-4"
              >
                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                <h3 className="text-[20px] font-bold text-[#111]">Message received!</h3>
                <p className="text-[14px] text-[#666] max-w-xs">
                  I&apos;ll get back to you within a few hours. Talk soon.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white border border-black/[0.07] rounded-2xl p-8 space-y-5 shadow-sm">
                {/* Name + Phone row */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-medium text-[#444] mb-1.5">Name <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={e => update('name', e.target.value)}
                      placeholder="Rahul Sharma"
                      className="w-full h-10 rounded-lg border border-black/10 bg-[#FAFAF8] px-3 text-[14px] text-[#111] placeholder-[#bbb] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/12 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-[#444] mb-1.5">Phone</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => update('phone', e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full h-10 rounded-lg border border-black/10 bg-[#FAFAF8] px-3 text-[14px] text-[#111] placeholder-[#bbb] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/12 transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[12px] font-medium text-[#444] mb-1.5">Email <span className="text-red-400">*</span></label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => update('email', e.target.value)}
                    placeholder="rahul@agency.co"
                    className="w-full h-10 rounded-lg border border-black/10 bg-[#FAFAF8] px-3 text-[14px] text-[#111] placeholder-[#bbb] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/12 transition-all"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-[12px] font-medium text-[#444] mb-1.5">Message <span className="text-red-400">*</span></label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={e => update('message', e.target.value)}
                    placeholder="Tell us about your team and what you're looking for..."
                    className="w-full rounded-lg border border-black/10 bg-[#FAFAF8] px-3 py-2.5 text-[14px] text-[#111] placeholder-[#bbb] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/12 transition-all resize-none"
                  />
                </div>

                {error && (
                  <p className="text-[13px] text-red-600">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="inline-flex items-center justify-center gap-2 w-full h-11 rounded-xl text-white text-[14px] font-semibold transition-all hover:brightness-110 disabled:opacity-60"
                  style={{ backgroundColor: '#4F46E5' }}
                >
                  {status === 'loading' ? (
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Send message <ArrowRight className="h-4 w-4" /></>
                  )}
                </button>

                <p className="text-[11px] text-[#aaa] text-center">
                  I personally read every message and reply within hours.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
