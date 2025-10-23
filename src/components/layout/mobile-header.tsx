'use client'

import { Menu } from 'lucide-react'
import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { MobileSettingsSheet } from './mobile-settings-sheet'
import { useTheme } from 'next-themes'

export function MobileHeader() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const { theme } = useTheme()

  return (
    <>
      <header className="lg:hidden fixed top-0 left-0 right-0 z-[1001] h-12 bg-primary dark:bg-card border-b border-primary-foreground/10 dark:border-border shadow-sm">
        <div className="h-full px-4 flex items-center justify-between">
          {/* MCS Logo */}
          <div className="flex items-center">
            <Image
              src={theme === 'dark' ? '/MCS_Logo_Stacked_Ink.png' : '/MCS_Logo_Stacked_White.png'}
              alt="Marine Conservation Society"
              width={100}
              height={100}
              className="h-8 w-auto"
            />
          </div>

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

      {/* Settings Sheet */}
      <MobileSettingsSheet
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />
    </>
  )
}
