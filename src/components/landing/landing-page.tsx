"use client"

import { HeroSection } from './hero-section'
import { FeaturesSection } from './features-section'
import { useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

export function LandingPage() {
  const searchParams = useSearchParams()
  const hasShownToast = useRef(false)

  useEffect(() => {
    if (searchParams.get('logout') === 'success' && !hasShownToast.current) {
      hasShownToast.current = true
      toast.success('Logged out successfully')
      // Clean up the URL
      window.history.replaceState({}, '', '/')
    }
  }, [searchParams])

  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
    </main>
  )
}