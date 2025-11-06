'use client';

import type { CardComponentProps } from 'nextstepjs';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
    <div className="relative z-[9999]">
      {arrow}
      <div className="bg-card rounded-lg shadow-2xl overflow-hidden w-[90vw] max-w-[520px] border border-border relative z-[10000]">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            {step.icon && (
              <span className="text-2xl">{step.icon}</span>
            )}
            <h2 className="text-xl font-semibold text-foreground">
              {step.title}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={skipTour}
            className="h-8 w-8 rounded-md hover:bg-muted -mt-1 -mr-2"
            aria-label="Close tour"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <div className="text-muted-foreground leading-relaxed">
            {step.content}
          </div>
        </div>

        {/* Footer */}
        <div
          className={cn(
            "flex items-center justify-between gap-4 px-6 py-4",
            "bg-[#1b1b26] dark:bg-[#1b1b26]"
          )}
        >
          {/* Step Counter */}
          <div className="flex items-center gap-2 shrink-0">
            <span
              className="text-lg font-bold"
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
              "shrink-0 font-bold tracking-wide",
              "bg-transparent hover:bg-mcs-teal/20",
              "border-none shadow-none"
            )}
            style={{ color: '#00b9b0' }}
            variant="ghost"
          >
            NEXT
          </Button>
        </div>
      </div>
    </div>
  );
}
