'use client'

import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FloatingResetButtonProps {
  onClick: () => void
  hasActiveFilters: boolean
  className?: string
}

export function FloatingResetButton({
  onClick,
  hasActiveFilters,
  className,
}: FloatingResetButtonProps) {
  if (!hasActiveFilters) return null

  return (
    <Button
      onClick={onClick}
      size="icon"
      variant="outline"
      className={cn(
        'fixed top-4 right-20 z-[1000] h-12 w-12 rounded-full shadow-lg',
        'border-mcs-red bg-mcs-red text-white',
        'dark:bg-mcs-red dark:border-mcs-red dark:text-white',
        'hover:bg-mcs-red/80 hover:border-mcs-red/80',
        'dark:hover:bg-mcs-red/80 dark:hover:border-mcs-red/80',
        'transition-all duration-300 ease-in-out',
        'animate-in fade-in slide-in-from-right-5',
        'lg:hidden', // Only show on mobile
        className
      )}
      aria-label="Reset all filters"
    >
      <RotateCcw className="h-5 w-5" />
    </Button>
  )
}
