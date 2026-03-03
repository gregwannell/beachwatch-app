"use client"

import { HeroSection } from './hero-section'
import { ModernMobileNav } from '@/components/layout/modern-mobile-nav'
import { Header } from '@/components/layout/header'
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
      <Header />
      <main className="min-h-screen pb-24 lg:pb-0 pt-0 lg:pt-16">
        <Suspense fallback={null}>
          <LogoutToastHandler />
        </Suspense>
        <HeroSection />
      </main>
      <ModernMobileNav />
    </>
  )
}