"use client"

import { Home, Droplet, SlidersHorizontal } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MobileBottomNavProps {
  onFilterClick?: () => void
}

export function MobileBottomNav({ onFilterClick }: MobileBottomNavProps) {
  const pathname = usePathname()

  const isHome = pathname === '/'
  const isExplore = pathname === '/explore'

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-[9999] bg-background/80 backdrop-blur-xl border-t border-border/40 pb-safe"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around px-4 h-20 relative">
        {/* Home Button */}
        <Link
          href="/"
          className={cn(
            "flex flex-col items-center justify-center gap-1 px-6 py-2 rounded-lg transition-colors",
            isHome
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
          aria-current={isHome ? "page" : undefined}
        >
          <Home className="h-6 w-6" />
          <span className="text-xs font-medium">Home</span>
        </Link>

        {/* Center Map Button - Elevated CTA */}
        <Link
          href="/explore"
          className="absolute left-1/2 -translate-x-1/2 -top-6"
          aria-current={isExplore ? "page" : undefined}
        >
          <div className={cn(
            "relative flex items-center justify-center w-16 h-16 rounded-full shadow-xl transition-all",
            isExplore
              ? "bg-primary text-primary-foreground shadow-primary/30"
              : "bg-primary/90 text-primary-foreground hover:bg-primary shadow-primary/20 hover:shadow-primary/40 hover:scale-105"
          )}>
            <Droplet className="h-7 w-7 fill-current" />

            {/* Ripple effect rings */}
            {isExplore && (
              <>
                <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
                <div className="absolute inset-0 rounded-full bg-primary/10" />
              </>
            )}
          </div>
          <span className="sr-only">Explore Map</span>
        </Link>

        {/* Filter Button */}
        {onFilterClick ? (
          <button
            onClick={onFilterClick}
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-6 py-2 rounded-lg transition-colors",
              "text-muted-foreground hover:text-foreground"
            )}
            aria-label="Open filters"
          >
            <SlidersHorizontal className="h-6 w-6" />
            <span className="text-xs font-medium">Filters</span>
          </button>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1 px-6 py-2 opacity-40">
            <SlidersHorizontal className="h-6 w-6" />
            <span className="text-xs font-medium">Filters</span>
          </div>
        )}
      </div>
    </nav>
  )
}
