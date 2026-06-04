import { LandingNav } from '@/components/landing/nav'
import { LandingHero } from '@/components/landing/hero'
import { LandingProblem } from '@/components/landing/problem'
import { LandingShowcase } from '@/components/landing/showcase'
import { LandingWhyKaam } from '@/components/landing/why-kaam'
import { LandingClientPortal } from '@/components/landing/client-portal'
import { LandingPricing } from '@/components/landing/pricing'
import { LandingContact } from '@/components/landing/contact'
import { LandingCTA } from '@/components/landing/cta'
import { LandingFooter } from '@/components/landing/footer'

export default function LandingPage() {
  return (
    <>
      <div className="min-h-screen" style={{ backgroundColor: '#FAFAF8', color: '#111111' }}>
        <LandingNav />
        <LandingHero />
        <LandingProblem />
        <LandingShowcase />
        <LandingWhyKaam />
        <LandingClientPortal />
        <LandingPricing />
        <LandingContact />
        <LandingCTA />
        <LandingFooter />
      </div>
    </>
  )
}
