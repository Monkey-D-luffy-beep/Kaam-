import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'Privacy Policy — Kaam',
  description: 'How Kaam collects, uses, and protects your data.',
}

const SECTIONS = [
  {
    title: '1. What we collect',
    body: [
      'Your name and email address when you sign up or join the waitlist.',
      'Task and project data you create inside Kaam.',
      'Basic usage data (pages visited, features used) to improve the product.',
      'We do not collect payment details directly — payments are processed by Razorpay.',
    ],
  },
  {
    title: '2. How we use your data',
    body: [
      'To provide and improve the Kaam product.',
      'To send you product updates and important account notifications.',
      'To respond to support requests.',
      'We never sell your data to third parties. Ever.',
    ],
  },
  {
    title: '3. Data storage',
    body: [
      'Your data is stored securely on Supabase (PostgreSQL), hosted on AWS infrastructure.',
      'All connections are encrypted via HTTPS/TLS.',
      'We retain your data for as long as your account is active.',
    ],
  },
  {
    title: '4. Cookies',
    body: [
      'We use minimal session cookies required to keep you logged in.',
      'We do not use advertising or tracking cookies.',
    ],
  },
  {
    title: '5. Third-party services',
    body: [
      'Supabase — database and authentication.',
      'Vercel — hosting and edge delivery.',
      'Razorpay — payment processing (for Pro plan).',
      'Resend — transactional emails.',
    ],
  },
  {
    title: '6. Your rights',
    body: [
      'You can request a copy of your data at any time.',
      'You can request deletion of your account and all associated data.',
      'To exercise either right, email us at the address below.',
    ],
  },
  {
    title: '7. Contact',
    body: [
      'If you have any questions about this policy, reach us at: saurav.chaudhary70@gmail.com',
    ],
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Nav */}
      <header className="border-b border-black/[0.06] px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image src="/3.svg" alt="Kaam" width={64} height={64} className="h-8 w-auto rounded-md" />
          </Link>
          <Link href="/" className="text-[13px] text-[#888] hover:text-[#111] transition-colors">
            ← Back to home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12">
          <p className="text-[12px] font-semibold tracking-[0.12em] uppercase text-[#888] mb-3">Legal</p>
          <h1 className="text-[40px] font-bold tracking-[-0.03em] text-[#111] mb-4">Privacy Policy</h1>
          <p className="text-[15px] text-[#666]">
            Last updated: June 2026 &nbsp;·&nbsp; Kaam, India
          </p>
          <p className="text-[15px] text-[#555] mt-4 leading-relaxed max-w-xl">
            Kaam is a simple tool. This privacy policy is written to match — plain English, no legal fog.
            We respect your data and keep it safe.
          </p>
        </div>

        <div className="space-y-10">
          {SECTIONS.map(section => (
            <div key={section.title} className="border-t border-black/[0.06] pt-8">
              <h2 className="text-[18px] font-semibold text-[#111] mb-4">{section.title}</h2>
              <ul className="space-y-2.5">
                {section.body.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-[14px] text-[#555] leading-relaxed">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#4F46E5]/50 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-black/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-[13px] text-[#aaa]">© 2026 Kaam · Less software. More Kaam.</p>
          <Link
            href="/"
            className="inline-flex items-center h-9 px-4 rounded-lg text-white text-[13px] font-medium transition-all hover:brightness-110"
            style={{ backgroundColor: '#4F46E5' }}
          >
            Back to Kaam
          </Link>
        </div>
      </main>
    </div>
  )
}
