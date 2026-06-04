'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#FAFAF8]/90 backdrop-blur-md border-b border-black/[0.06] shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/transparent_logo.svg"
            alt="Kaam"
            width={120}
            height={27}
            className="h-7 w-auto"
            priority
          />
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6">
          {[
            { label: 'Product', href: '#showcase' },
            { label: 'Why Kaam', href: '#why' },
            { label: 'Pricing', href: '#pricing' },
          ].map(item => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm text-[#555] hover:text-[#111111] transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden md:block text-sm text-[#555] hover:text-[#111111] transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center h-8 px-4 rounded-lg text-white text-sm font-semibold transition-all hover:brightness-110"
            style={{ backgroundColor: '#4F46E5' }}
          >
            Get started
          </Link>
        </div>
      </div>
    </motion.header>
  )
}
