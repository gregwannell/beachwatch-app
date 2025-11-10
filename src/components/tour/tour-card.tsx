'use client';

import type { CardComponentProps } from 'nextstepjs';
import { useNextStep } from 'nextstepjs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { validation } from '@/lib/tour-validation';
import { toast } from 'sonner';

/**
 * Custom Tour Card Component
 *
 * Provides a branded, accessible UI for nextstepjs guided tours.
 * Features include:
 *
 * - **Brand Styling**: MCS teal accent color (#00b9b0) with shadcn/ui components
 * - **Progress Indicator**: Visual bar showing tour completion percentage
 * - **Navigation Controls**: Previous, Next/Finish, and Skip Tour buttons
 * - **Validation Support**: Validates user interactions before allowing step progression
 * - **Responsive Layout**: Adapts to mobile and desktop viewports
 * - **Dark Mode**: Full support for theme switching
 *
 * The component integrates with the validation system from tour-validation.ts,
 * checking for required user interactions before allowing tour progression.
 * Failed validations trigger toast notifications with helpful guidance.
 *
 * @param props - CardComponentProps from nextstepjs containing step data and navigation functions
 */
export function TourCard({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  skipTour,
  arrow,
}: CardComponentProps) {
  const { currentTour } = useNextStep();
  const progressValue = ((currentStep + 1) / totalSteps) * 100;

  // Get the validation function for the current step
  const validate =
    currentTour && validation[currentTour] && validation[currentTour][currentStep]
      ? validation[currentTour][currentStep].validation
      : () => true;

  // Get the validation message for the current step
  const validationMessage =
    currentTour && validation[currentTour] && validation[currentTour][currentStep]
      ? validation[currentTour][currentStep].validationMessage
      : '';

  return (
    <div className="z-[100000]">
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
              // @ts-expect-error - CSS custom property
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
              onClick={async () => {
                // Validate the current step and if it passes, go to the next step
                // If it fails, show the validation message
                if (await validate()) {
                  nextStep();
                } else {
                  toast.error(validationMessage);
                }
              }}
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
