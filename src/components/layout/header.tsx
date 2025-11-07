'use client'

import { Menu, Settings } from 'lucide-react'
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
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-[1001] h-12 bg-primary dark:bg-card border-b border-primary-foreground/10 dark:border-border shadow-sm">
        <div className="h-full px-4 flex items-center justify-between">
          {/* MCS Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/mcs-bw-logo.png"
              alt="Marine Conservation Society"
              width={100}
              height={100}
              className="h-8 w-auto"
            />
          </Link>

          {/* Hamburger Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSettingsOpen(true)}
            className="text-primary-foreground dark:text-foreground hover:bg-primary-foreground/10 dark:hover:bg-accent"
            aria-label="Open settings menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden md:block fixed top-0 left-0 right-0 z-[1100] backdrop-blur-md bg-primary/80 border-b border-primary-foreground/10">
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
            <Link href="/" className="text-sm font-medium text-white hover:text-mcs-orange transition-colors">
              Home
            </Link>
            <button
              onClick={handleStartTour}
              className="text-sm font-medium text-white hover:text-mcs-orange transition-colors"
            >
              How to Use
            </button>
            <Link href="#" className="text-sm font-medium text-white hover:text-mcs-orange transition-colors">
              Contact
            </Link>
          </nav>

          {/* Right: Settings Button and Theme Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSettingsOpen(true)}
              className="text-white hover:bg-white/10"
              aria-label="Open settings"
            >
              <Settings className="h-5 w-5" />
            </Button>
            <ThemeToggle />
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
