"use client"

import { HeroSection } from './hero-section'
import { FeaturesSection } from './features-section'

export function LandingPage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
    </main>
  )
}