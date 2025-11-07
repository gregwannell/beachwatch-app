'use client';

import type { CardComponentProps } from 'nextstepjs';
import { useNextStep } from 'nextstepjs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { tourValidation } from '@/lib/tour-validation';

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
  const { currentTour } = useNextStep();

  console.log('TourCard rendering:', {
    step: step?.title,
    currentStep,
    totalSteps,
    hasArrow: !!arrow,
  });

  // Validation logic following NextStepJS pattern
  const handleNext = async () => {
    const validation = tourValidation[currentTour || '']?.[currentStep];

    if (validation) {
      const isValid = await validation.validation();
      if (!isValid) {
        toast.error(validation.validationMessage);
        return;
      }
    }

    nextStep();
  };

  return (
    <div className="z-[100000]" style={{ zIndex: 100000 }}>
      <Card className="w-[90vw] max-w-[350px] border-2 border-gray-300 dark:border-gray-700">
        {/* Header */}
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-lg font-semibold">
            {step.icon && <span className="text-xl">{step.icon}</span>}
            {step.title}
          </CardTitle>
        </CardHeader>

        {/* Content */}
        <CardContent>
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed mb-2 text-sm">
            {step.content}
          </div>
          {arrow}
        </CardContent>

        {/* Progress Bar - Outside footer */}
        <div className="px-6">
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

        {/* Footer - Two rows, centered layout */}
        <CardFooter className="flex flex-col gap-2 px-6 pb-1">
          {/* Row 1: Previous, Step Count, Next */}
          <div className="flex items-center justify-between gap-4 w-full">
            {/* Previous Button */}
            {currentStep > 0 ? (
              <Button
                onClick={prevStep}
                variant="outline"
                size="sm"
                className="font-medium"
              >
                Previous
              </Button>
            ) : (
              <div className="w-[84px]" /> // Placeholder to keep Next centered when no Previous
            )}

            {/* Step Counter */}
            <span className="text-sm text-muted-foreground font-medium min-w-[60px] text-center">
              {currentStep + 1} of {totalSteps}
            </span>

            {/* Next/Finish Button */}
            <Button
              onClick={handleNext}
              size="sm"
              className="font-medium bg-mcs-teal w-[84px]"
              style={{ backgroundColor: '#00b9b0', color: 'white' }}
            >
              {currentStep === totalSteps - 1 ? 'Finish' : 'Next'}
            </Button>
          </div>

          {/* Row 2: Skip Tour - hide on final step */}
          {currentStep < totalSteps - 1 && (
            <div className="flex justify-center w-full">
              <Button
                onClick={skipTour}
                variant="ghost"
                size="sm"
                className="font-medium w-full"
              >
                Skip Tour
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
