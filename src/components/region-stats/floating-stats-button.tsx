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
  const { currentTour, currentStep } = useNextStep();

  return (
    <Button
      id="floating-stats-button"
      onClick={() => {
        console.log('FloatingStatsButton clicked!');
        console.log('currentTour:', currentTour);
        console.log('currentStep:', currentStep);
        console.log('Condition check:', currentTour === 'mobileTour' && currentStep === 3);

        // Set flag for tour validation
        localStorage.setItem('stats-sheet-opened', 'true');
        console.log('localStorage flag set');

        // Open the stats sheet
        onClick();
        console.log('onClick() called to open sheet');

        // Auto-advance tour if on mobile tour step 3 (View Statistics)
        if (currentTour === 'mobileTour' && currentStep === 3) {
          console.log('Condition matched! Dispatching tour:advanceStep event...');
          window.dispatchEvent(new CustomEvent('tour:advanceStep'));
          console.log('Event dispatched');
        } else {
          console.log('Condition did NOT match - not advancing');
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
