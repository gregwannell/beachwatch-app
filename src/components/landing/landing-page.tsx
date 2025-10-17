"use client"

import { HeroSection } from './hero-section'
import { FeaturesSection } from './features-section'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { useSearchParams } from 'next/navigation'
import { useEffect, useRef, Suspense } from 'react'
import { toast } from 'sonner'

function LogoutToastHandler() {
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

  return null
}

export function LandingPage() {
  return (
    <>
      <main className="min-h-screen pb-24 lg:pb-0">
        <Suspense fallback={null}>
          <LogoutToastHandler />
        </Suspense>
        <HeroSection />
        <FeaturesSection />
      </main>
      <MobileBottomNav />
    </>
  )
}