'use client'

import { BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useNextStep } from 'nextstepjs'

interface FloatingStatsButtonProps {
  onClick: () => void
  className?: string
}

export function FloatingStatsButton({
  onClick,
  className,
}: FloatingStatsButtonProps) {
  const { currentTour, currentStep, nextStep } = useNextStep();

  return (
    <Button
      id="floating-stats-button"
      onClick={() => {
        // Set flag for tour validation
        localStorage.setItem('stats-sheet-opened', 'true');
        // Open the stats sheet
        onClick();

        // Auto-advance tour if on mobile tour step 3 (View Statistics)
        if (currentTour === 'mobileTour' && currentStep === 3) {
          // Small delay to let sheet open animation start
          setTimeout(() => {
            nextStep();
          }, 300);
        }
      }}
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
