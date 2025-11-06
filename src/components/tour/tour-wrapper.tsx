'use client';

import { useEffect, useState } from 'react';
import { NextStep } from 'nextstepjs';
import { TourCard } from './tour-card';
import { desktopTourSteps, mobileTourSteps } from '@/lib/tour-steps';

export function TourWrapper() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if window is mobile size (< 768px)
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkMobile();

    // Listen for resize events
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const steps = isMobile ? mobileTourSteps : desktopTourSteps;

  return (
    <NextStep
      steps={steps}
      cardComponent={TourCard}
      shadowRgb="0,0,0"
      shadowOpacity="0.5"
    />
  );
}
