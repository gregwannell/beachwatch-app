'use client';

import type { CardComponentProps } from 'nextstepjs';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function TourCard({
  step,
  currentStep,
  totalSteps,
  nextStep,
  skipTour,
  arrow,
}: CardComponentProps) {
  const progressValue = ((currentStep + 1) / totalSteps) * 100;

  console.log('TourCard rendering:', {
    step: step?.title,
    currentStep,
    totalSteps,
    hasArrow: !!arrow,
  });

  return (
    <div className="z-[100000]" style={{ zIndex: 100000 }}>
      <Card className="w-[90vw] max-w-[520px] border-2 border-gray-300 dark:border-gray-700">
        <CardHeader className="flex flex-row items-start justify-between pb-4">
          <CardTitle className="flex items-center gap-3 text-xl font-semibold">
            {step.icon && <span className="text-2xl">{step.icon}</span>}
            {step.title}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={skipTour}
            className="h-8 w-8 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 -mt-1 -mr-2"
            aria-label="Close tour"
          >
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>

        <CardContent>
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
            {step.content}
          </div>
          {arrow}
        </CardContent>

        <CardFooter
          className={cn(
            "flex items-center justify-between gap-4 px-6 py-4",
            "bg-[#1b1b26] dark:bg-[#1b1b26]"
          )}
        >
          {/* Step Counter */}
          <div className="flex items-center gap-2 shrink-0">
            <span
              className="text-lg font-bold text-white"
              style={{ color: '#00b9b0' }}
            >
              {currentStep + 1}/{totalSteps}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="flex-1 min-w-0">
            <Progress
              value={progressValue}
              className="h-2 bg-neutral/30"
              style={{
                // @ts-ignore - CSS custom property
                '--progress-background': '#00b9b0',
              }}
            />
            <style jsx>{`
              :global([data-slot="progress-indicator"]) {
                background-color: #00b9b0 !important;
              }
            `}</style>
          </div>

          {/* Next Button */}
          <Button
            onClick={nextStep}
            className={cn(
              "shrink-0 font-bold tracking-wide text-white",
              "bg-transparent hover:bg-teal-500/20",
              "border-none shadow-none"
            )}
            style={{ color: '#00b9b0' }}
            variant="ghost"
          >
            NEXT
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
