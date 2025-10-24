'use client'

import { LogOut, HelpCircle, Info } from 'lucide-react'
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
import { useRouter } from 'next/navigation'

interface MobileSettingsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileSettingsSheet({ open, onOpenChange }: MobileSettingsSheetProps) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

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
              src="/MCS_Logo_Stacked_Ink.png"
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
