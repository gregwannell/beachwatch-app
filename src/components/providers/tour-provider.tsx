'use client';

import { NextStepProvider, NextStep } from 'nextstepjs';
import { useTheme } from 'next-themes';
import { allTours } from '@/lib/tour-steps';
import { TourCard } from '@/components/tour/tour-card';

/**
 * Tour Provider Component
 *
 * Wraps the application with nextstepjs tour functionality, providing:
 * - Responsive tours for desktop and mobile viewports
 * - Dark mode support with adaptive shadow overlays
 * - Validation system for user interaction tracking
 */
export function TourProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // Dynamic shadow configuration for light/dark mode
  // Light mode: dark overlay (0,0,0) with 20% opacity
  // Dark mode: lighter overlay (255,255,255) with 15% opacity for better contrast
  const shadowRgb = isDark ? '255,255,255' : '0,0,0';
  const shadowOpacity = isDark ? '0.15' : '0.2';

  return (
    <NextStepProvider>
      <NextStep
        steps={allTours}
        cardComponent={TourCard}
        shadowRgb={shadowRgb}
        shadowOpacity={shadowOpacity}
        onComplete={(tourName) => {
          // Clean up validation flags when tour completes
          if (tourName === 'mobileTour') {
            localStorage.removeItem('stats-sheet-opened');
          }
        }}
        onSkip={(step, tourName) => {
          // Clean up validation flags if user skips tour
          if (tourName === 'mobileTour') {
            localStorage.removeItem('stats-sheet-opened');
          }
        }}
      >
        {children}
      </NextStep>
    </NextStepProvider>
  );
}
