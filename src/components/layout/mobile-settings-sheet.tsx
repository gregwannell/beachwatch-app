'use client'

import { Heart, Compass, HandCoins } from 'lucide-react'
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
  const { startNextStep } = useNextStep()
  const { theme } = useTheme()

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
              <Link href="https://www.mcsuk.org/what-you-can-do/join-a-beach-clean/" target="_blank" rel="noopener noreferrer" onClick={() => onOpenChange(false)}>
                <Heart className="mr-3 h-5 w-5" />
                <span>Get involved</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start h-auto py-3"
              asChild
            >
              <Link href="https://www.mcsuk.org/make-a-donation/" target="_blank" rel="noopener noreferrer" onClick={() => onOpenChange(false)}>
                <HandCoins className="mr-3 h-5 w-5" />
                <span>Donate</span>
              </Link>
            </Button>
            <Link
              href="https://www.mcsuk.org/become-a-member/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onOpenChange(false)}
              className="flex items-center justify-center w-full py-3 rounded-md text-sm font-medium bg-mcs-red text-white hover:bg-mcs-navy transition-colors"
            >
              Become a member
            </Link>
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
