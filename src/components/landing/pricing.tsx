'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { Check } from 'lucide-react'

const PLANS = [
  {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    description: 'Everything you need to get started. No time limit.',
    cta: 'Get started free',
    ctaHref: '/signup',
    highlight: false,
    badge: null,
    features: [
      'Up to 3 projects',
      'Up to 5 team members',
      'Board view (Todo / In Progress / Done)',
      'Task assignments, priorities & due dates',
      'Basic dashboard',
      'Realtime updates',
      'Mobile-friendly',
    ],
  },
  {
    name: 'Pro',
    price: '₹799',
    period: 'per month',
    description: 'For growing teams that need more power without more complexity.',
    cta: 'Start free trial',
    ctaHref: '/signup?plan=pro',
    highlight: true,
    badge: 'Most popular',
    features: [
      'Unlimited projects',
      'Unlimited team members',
      'Everything in Free',
      'Workload view',
      'Approval flows',
      'Client portal (coming soon)',
      'Email notifications',
      'Priority support',
      'Export to CSV',
    ],
  },
]

export function LandingPricing() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="pricing" className="py-28 px-6 bg-white" ref={ref}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-14 text-center"
        >
          <p className="text-[12px] font-semibold tracking-[0.12em] uppercase text-[#888] mb-4">Pricing</p>
          <h2 className="text-[40px] sm:text-[52px] font-bold tracking-[-0.03em] text-[#111] leading-[1.1] mb-4">
            Simple pricing.
            <br />
            No surprises.
          </h2>
          <p className="text-[16px] text-[#666] max-w-md mx-auto">
            Start free. Upgrade when your team grows. Cancel any time — no questions asked.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative rounded-2xl p-8 flex flex-col ${
                plan.highlight
                  ? 'bg-[#111] text-white'
                  : 'bg-[#FAFAF8] border border-black/[0.07] text-[#111]'
              }`}
            >
              {plan.badge && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-semibold px-3 py-1 rounded-full text-white"
                  style={{ backgroundColor: '#4F46E5' }}
                >
                  {plan.badge}
                </div>
              )}

              <div className="mb-6">
                <p className={`text-[13px] font-semibold mb-3 ${plan.highlight ? 'text-[#aaa]' : 'text-[#666]'}`}>
                  {plan.name}
                </p>
                <div className="flex items-end gap-2 mb-3">
                  <span className="text-[44px] font-bold tracking-[-0.04em] leading-none">{plan.price}</span>
                  <span className={`text-[14px] mb-1 ${plan.highlight ? 'text-[#777]' : 'text-[#999]'}`}>
                    / {plan.period}
                  </span>
                </div>
                <p className={`text-[14px] leading-relaxed ${plan.highlight ? 'text-[#888]' : 'text-[#666]'}`}>
                  {plan.description}
                </p>
              </div>

              <Link
                href={plan.ctaHref}
                className={`inline-flex items-center justify-center h-11 rounded-xl text-[14px] font-semibold transition-all mb-8 ${
                  plan.highlight
                    ? 'text-white hover:brightness-110'
                    : 'bg-white border border-black/10 text-[#111] hover:border-black/20'
                }`}
                style={plan.highlight ? { backgroundColor: '#4F46E5' } : {}}
              >
                {plan.cta}
              </Link>

              <ul className="flex flex-col gap-3.5">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-3">
                    <Check
                      className={`h-4 w-4 mt-0.5 shrink-0 ${plan.highlight ? 'text-[#818CF8]' : 'text-[#4F46E5]'}`}
                    />
                    <span className={`text-[14px] ${plan.highlight ? 'text-[#ccc]' : 'text-[#555]'}`}>{f}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Reassurance line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="text-center text-[13px] text-[#aaa] mt-8"
        >
          Pro plan billed monthly in INR · Razorpay · No foreign transaction fees
        </motion.p>
      </div>
    </section>
  )
}
