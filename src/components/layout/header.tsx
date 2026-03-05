'use client'

import { Settings } from 'lucide-react'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { MobileSettingsSheet } from './mobile-settings-sheet'
import { ThemeToggle } from '@/components/theme-toggle'
import { useNextStep } from 'nextstepjs'

export function Header() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const { startNextStep } = useNextStep()
  const router = useRouter()
  const pathname = usePathname()

  const handleStartTour = () => {
    console.log('Starting tour...', { pathname })

    // Determine tour based on viewport
    const isMobile = window.innerWidth < 768
    const tourName = isMobile ? 'mobileTour' : 'desktopTour'

    console.log('Tour to start:', tourName, { isMobile, width: window.innerWidth })

    // Clear validation flags when starting tour
    if (tourName === 'mobileTour') {
      localStorage.removeItem('stats-sheet-opened');
    }

    // Navigate to explore page if not already there
    if (pathname !== '/explore') {
      router.push('/explore')
      // Wait for navigation and DOM to be ready before starting tour
      setTimeout(() => {
        console.log('Starting tour after navigation:', tourName)
        startNextStep(tourName)
      }, 1500) // Increased to 1500ms to ensure all elements are mounted
    } else {
      startNextStep(tourName)
    }
  }

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden md:block fixed top-0 left-0 right-0 z-[1100] backdrop-blur-md bg-mcs-navy border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: MCS Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/mcs-bw-logo.png"
              alt="Marine Conservation Society"
              width={200}
              height={48}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Center: Navigation Links */}
          <nav className="flex items-center gap-6">
            <button
              onClick={handleStartTour}
              className="text-sm font-medium text-white hover:text-mcs-orange transition-colors"
            >
              How to Use
            </button>
            <Link href="https://www.mcsuk.org/what-you-can-do/join-a-beach-clean/" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-white hover:text-mcs-orange transition-colors">
              Get involved
            </Link>
            <Link
              href="https://www.mcsuk.org/make-a-donation/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-white hover:text-mcs-orange transition-colors"
            >
              Donate
            </Link>
            <Link
              href="https://www.mcsuk.org/become-a-member/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium px-4 py-2 rounded-md bg-mcs-red text-white hover:bg-mcs-green transition-colors"
            >
              Become a member
            </Link>
          </nav>

          {/* Right: Theme Toggle and Settings Button */}
          <div className="flex items-center gap-2">
            <ThemeToggle id="theme-toggle" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSettingsOpen(true)}
              className="text-white hover:bg-white/10"
              aria-label="Open settings"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Settings Sheet (shared by mobile and desktop) */}
      <MobileSettingsSheet
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />
    </>
  )
}
