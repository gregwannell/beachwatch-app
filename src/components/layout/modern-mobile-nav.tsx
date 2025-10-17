"use client"

import { Home, Droplet, SlidersHorizontal, BarChart3 } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useMemo, useCallback } from 'react'
import { InteractiveMenu, type InteractiveMenuItem } from '@/components/ui/modern-mobile-menu'

interface ModernMobileNavProps {
  onFilterClick?: () => void
}

export function ModernMobileNav({ onFilterClick }: ModernMobileNavProps) {
  const pathname = usePathname()
  const router = useRouter()

  const isHome = pathname === '/'
  const isExplore = pathname === '/explore'
  const isStats = pathname === '/stats'

  // Create menu items for the app
  const menuItems: InteractiveMenuItem[] = useMemo(() => [
    { label: 'Home', icon: Home },
    { label: 'Explore', icon: Droplet },
    { label: 'Stats', icon: BarChart3 },
    { label: 'Filters', icon: SlidersHorizontal },
  ], [])

  // Determine active index based on pathname
  const activeIndex = isHome ? 0 : isExplore ? 1 : isStats ? 2 : -1

  // Handle navigation when menu items are clicked
  const handleItemClick = useCallback((index: number) => {
    switch (index) {
      case 0:
        router.push('/')
        break
      case 1:
        router.push('/explore')
        break
      case 2:
        router.push('/stats')
        break
      case 3:
        if (onFilterClick) {
          onFilterClick()
        }
        break
    }
  }, [router, onFilterClick])

  // Use primary color as accent
  const accentColor = 'var(--primary)'

  return (
    <div className="lg:hidden pb-safe">
      <InteractiveMenu
        items={menuItems}
        accentColor={accentColor}
        activeIndex={activeIndex}
        onItemClick={handleItemClick}
      />
    </div>
  )
}
