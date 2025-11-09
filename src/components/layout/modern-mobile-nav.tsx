"use client"

import { Home, Map, Menu } from 'lucide-react'
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
    if (pathname === '/') return 'home'
    if (pathname === '/explore') return 'explore'
    return 'home'
  }, [pathname])

  // Handle navigation when tabs change
  const handleTabChange = useCallback((tabId: string) => {
    switch (tabId) {
      case 'home':
        router.push('/')
        break
      case 'explore':
        router.push('/explore')
        break
      case 'settings':
        // Toggle settings panel or navigate to settings page
        setIsSettingsOpen(prev => !prev)
        // Uncomment to navigate to settings page:
        // router.push('/settings')
        break
    }
  }, [router])

  // Define navigation items
  const sideItems: [NavigationItem, NavigationItem] = useMemo(() => [
    { id: 'home', label: 'Home', icon: Home },
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
