/**
 * Tour step validation configuration
 * Following NextStepJS validation pattern: https://nextstepjs.com/docs/nextjs/validation
 */

interface ValidationStep {
  validation: () => boolean | Promise<boolean>;
  validationMessage: string;
}

interface ValidationConfig {
  [tourName: string]: {
    [stepIndex: number]: ValidationStep;
  };
}

export const tourValidation: ValidationConfig = {
  mobileTour: {
    3: {
      // Step 3: "View Statistics" - Requires stats sheet to be open
      validation: () => {
        // Check if region stats tabs element exists (only visible when sheet is open)
        return document.querySelector('#region-stats-tabs') !== null;
      },
      validationMessage: 'Please tap the stats button to open the statistics panel.',
    },
  },
};
