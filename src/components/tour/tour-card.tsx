'use client';

import type { CardComponentProps } from 'nextstepjs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function TourCard({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
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
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl font-semibold">
            {step.icon && <span className="text-2xl">{step.icon}</span>}
            {step.title}
          </CardTitle>
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

          {/* Navigation Buttons */}
          <div className="flex gap-2 shrink-0">
            {/* Previous Button - only show if not on first step */}
            {currentStep > 0 && (
              <Button
                onClick={prevStep}
                variant="outline"
                size="sm"
                className={cn(
                  "font-bold tracking-wide",
                  "border-gray-600 text-white hover:bg-teal-500/20"
                )}
                style={{ color: '#00b9b0', borderColor: '#00b9b0' }}
              >
                Previous
              </Button>
            )}

            {/* Next/Finish Button */}
            <Button
              onClick={nextStep}
              size="sm"
              className={cn(
                "font-bold tracking-wide text-white",
                "bg-transparent hover:bg-teal-500/20",
                "border-none shadow-none"
              )}
              style={{ color: '#00b9b0' }}
              variant="ghost"
            >
              {currentStep === totalSteps - 1 ? 'Finish' : 'NEXT'}
            </Button>

            {/* Skip Tour Button */}
            <Button
              onClick={skipTour}
              variant="ghost"
              size="sm"
              className={cn(
                "font-bold tracking-wide",
                "text-gray-400 hover:text-white hover:bg-gray-700/50"
              )}
            >
              Skip Tour
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
