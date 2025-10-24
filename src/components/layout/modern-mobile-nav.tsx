"use client"

import { Home, Earth } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useMemo, useCallback } from 'react'
import { InteractiveMenu, type InteractiveMenuItem } from '@/components/ui/modern-mobile-menu'

export function ModernMobileNav() {
  const pathname = usePathname()
  const router = useRouter()

  const isHome = pathname === '/'
  const isExplore = pathname === '/explore'

  // Create menu items for the app
  const menuItems: InteractiveMenuItem[] = useMemo(() => [
    { label: 'Home', icon: Home },
    { label: 'Explore', icon: Earth },
  ], [])

  // Determine active index based on pathname
  const activeIndex = isHome ? 0 : isExplore ? 1 : -1

  // Handle navigation when menu items are clicked
  const handleItemClick = useCallback((index: number) => {
    switch (index) {
      case 0:
        router.push('/')
        break
      case 1:
        router.push('/explore')
        break
    }
  }, [router])

  // Use primary color as accent
  const accentColor = 'var(--primary)'

  return (
    <div className="md:hidden pb-safe">
      <InteractiveMenu
        items={menuItems}
        accentColor={accentColor}
        activeIndex={activeIndex}
        onItemClick={handleItemClick}
      />
    </div>
  )
}
