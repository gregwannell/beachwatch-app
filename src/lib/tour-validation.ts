/**
 * Validation configuration for tour steps.
 *
 * This follows the official NextStepJS validation pattern documented at:
 * https://nextstepjs.com/docs/nextjs/validation
 *
 * Validation works through custom card components that check user actions
 * before allowing progression to the next step. Each step can have:
 * - validation: Function returning boolean or Promise<boolean>
 * - validationMessage: Error message shown when validation fails
 *
 * @example
 * // In your custom TourCard component:
 * const validate = validation[currentTour]?.[currentStep]?.validation || (() => true);
 *
 * if (await validate()) {
 *   nextStep();
 * } else {
 *   toast.error(validationMessage);
 * }
 */

/**
 * Validation step configuration interface.
 * Matches the official NextStepJS validation structure.
 */
export interface ValidationStep {
  /** Function that returns true to allow progression, false to block */
  validation: () => boolean | Promise<boolean>;
  /** Message displayed to user when validation fails */
  validationMessage: string;
}

/**
 * Validation configuration organized by tour name and step index.
 * Steps are zero-indexed (step 0 is the first step).
 */
export interface ValidationConfig {
  [tourName: string]: {
    [stepIndex: number]: ValidationStep;
  };
}

/**
 * Tour validation rules.
 *
 * Currently validates that users interact with key features during
 * the mobile tour to ensure engagement and feature discovery.
 *
 * Cleanup: The validation flags are automatically cleared when the tour
 * completes or is skipped via the onComplete/onSkip callbacks in layout.tsx.
 */
export const validation: ValidationConfig = {
  mobileTour: {
    3: {
      // Step 4 (index 3): "View Statistics" - requires user to tap stats button
      // This ensures users discover the floating stats button and understand
      // how to access regional statistics on mobile devices.
      validation: () => {
        return localStorage.getItem('stats-sheet-opened') === 'true';
      },
      validationMessage: 'Please tap the statistics button to continue.',
    },
  },
};
