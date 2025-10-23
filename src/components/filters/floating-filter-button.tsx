'use client'

import { Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FloatingFilterButtonProps {
  onClick: () => void
  activeFilterCount?: number
  className?: string
}

export function FloatingFilterButton({
  onClick,
  activeFilterCount = 0,
  className,
}: FloatingFilterButtonProps) {
  return (
    <Button
      onClick={onClick}
      size="icon"
      className={cn(
        'fixed top-[4.5rem] right-4 z-[1000] h-12 w-12 rounded-full shadow-lg',
        'bg-primary text-primary-foreground hover:bg-primary/90',
        'lg:hidden', // Only show on mobile
        className
      )}
      aria-label={
        activeFilterCount > 0
          ? `Open filters (${activeFilterCount} active)`
          : 'Open filters'
      }
    >
      <div className="relative">
        <Filter className="h-5 w-5" />
        {activeFilterCount > 0 && (
          <span
            className="absolute -top-4 -right-4 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground"
          >
            {activeFilterCount}
          </span>
        )}
      </div>
    </Button>
  )
}
