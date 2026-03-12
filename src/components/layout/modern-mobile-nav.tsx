"use client"

import { UserPlus, Map, Menu } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'
import { BottomNavBar, type NavigationItem } from '@/components/ui/modern-mobile-menu'
import { MobileSettingsSheet } from '@/components/layout/mobile-settings-sheet'

export function ModernMobileNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Determine default active tab based on current pathname
  const defaultTab = useMemo(() => {
    if (pathname === '/explore') return 'explore'
    return 'explore'
  }, [pathname])

  // Handle navigation when tabs change
  const handleTabChange = useCallback((tabId: string) => {
    switch (tabId) {
      case 'member':
        window.open('https://www.mcsuk.org/become-a-member/', '_blank', 'noopener noreferrer')
        break
      case 'explore':
        router.push('/explore')
        break
      case 'settings':
        setIsSettingsOpen(prev => !prev)
        break
    }
  }, [router])

  // Define navigation items
  const sideItems: [NavigationItem, NavigationItem] = useMemo(() => [
    { id: 'member', label: 'Member', icon: UserPlus },
    { id: 'settings', label: 'Settings', icon: Menu }
  ], [])

  const centralButton = useMemo(() => ({
    id: 'explore',
    label: 'Explore',
    icon: Map
  }), [])

  return (
    <>
      <div className="md:hidden pb-safe">
        <BottomNavBar
          defaultTab={defaultTab}
          onTabChange={handleTabChange}
          sideItems={sideItems}
          centralButton={centralButton}
        />
      </div>
      <MobileSettingsSheet
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />
    </>
  )
}
