'use client'

import { BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FloatingStatsButtonProps {
  onClick: () => void
  className?: string
}

export function FloatingStatsButton({
  onClick,
  className,
}: FloatingStatsButtonProps) {
  return (
    <Button
      onClick={onClick}
      size="icon"
      className={cn(
        'fixed top-[4.5rem] left-4 z-[1000] h-12 w-12 rounded-full shadow-lg',
        'bg-primary text-primary-foreground hover:bg-primary/90',
        'lg:hidden', // Only show on mobile
        className
      )}
      aria-label="View regional statistics"
    >
      <BarChart3 className="h-5 w-5" />
    </Button>
  )
}
