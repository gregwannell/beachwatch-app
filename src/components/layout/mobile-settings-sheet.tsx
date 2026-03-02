'use client'

import { LogOut, HelpCircle, Info, Compass } from 'lucide-react'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { Separator } from '@/components/ui/separator'
import { useRouter, usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useNextStep } from 'nextstepjs'

interface MobileSettingsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileSettingsSheet({ open, onOpenChange }: MobileSettingsSheetProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { startNextStep } = useNextStep()
  const { theme } = useTheme()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (response.ok) {
        router.push('/?logout=success')
      } else {
        console.error('Logout failed')
        setIsLoggingOut(false)
      }
    } catch (error) {
      console.error('Logout error:', error)
      setIsLoggingOut(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[80%] sm:w-[320px] p-0">
        <SheetHeader className="p-6 pb-4">
          <div className="flex justify-center mb-4">
            <Image
              src={theme === 'dark' ? '/bubbles-light.gif' : '/bubbles-dark.gif'}
              alt="Marine Conservation Society"
              width={120}
              height={120}
              className="h-16 w-auto"
            />
          </div>
          <SheetTitle className="text-center">Settings</SheetTitle>
          <SheetDescription className="text-center">
            Manage your preferences
          </SheetDescription>
        </SheetHeader>

        <div className="px-6 py-4 space-y-6">
          {/* Theme Toggle Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Appearance</h3>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">Theme</span>
              <ThemeToggle />
            </div>
          </div>

          <Separator />

          {/* Help & Support Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Support</h3>
            <Button
              variant="ghost"
              className="w-full justify-start h-auto py-3"
              onClick={() => {
                onOpenChange(false)

                // Determine tour based on viewport
                const isMobile = window.innerWidth < 768
                const tourName = isMobile ? 'mobileTour' : 'desktopTour'

                console.log('Mobile settings - Starting tour:', tourName)

                // Clear validation flags when starting tour
                if (tourName === 'mobileTour') {
                  localStorage.removeItem('stats-sheet-opened');
                }

                // Navigate to explore page if not already there
                if (pathname !== '/explore') {
                  router.push('/explore')
                  setTimeout(() => {
                    console.log('Starting tour after navigation (mobile sheet):', tourName)
                    startNextStep(tourName)
                  }, 1500) // Increased to 1500ms to ensure all elements are mounted
                } else {
                  startNextStep(tourName)
                }
              }}
            >
              <Compass className="mr-3 h-5 w-5" />
              <span>How to Use</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start h-auto py-3"
              asChild
            >
              <Link href="#help" onClick={() => onOpenChange(false)}>
                <HelpCircle className="mr-3 h-5 w-5" />
                <span>Help & Support</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start h-auto py-3"
              asChild
            >
              <Link href="#about" onClick={() => onOpenChange(false)}>
                <Info className="mr-3 h-5 w-5" />
                <span>About</span>
              </Link>
            </Button>
          </div>

          <Separator />

          {/* Data Sources / Attribution Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Data Sources</h3>
            <div className="text-xs text-muted-foreground space-y-2 py-2">
              <p>Map data:</p>
              <ul className="space-y-1 pl-4">
                <li>
                  © <a
                    href="https://www.openstreetmap.org/copyright"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-foreground transition-colors"
                  >
                    OpenStreetMap
                  </a> contributors
                </li>
                <li>
                  © <a
                    href="https://carto.com/attributions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-foreground transition-colors"
                  >
                    CARTO
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <Separator />

          {/* Account Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Account</h3>
            <Button
              variant="ghost"
              className="w-full justify-start h-auto py-3 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut className="mr-3 h-5 w-5" />
              <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-center text-xs text-muted-foreground border-t">
          <p>Beachwatch Data Explorer</p>
          <p className="mt-1">© 2025 Marine Conservation Society</p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
