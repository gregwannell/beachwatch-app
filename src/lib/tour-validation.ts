export const validation = {
  mobileTour: {
    3: {
      // Step 3: "View Statistics" - requires user to tap stats button
      validation: () => {
        return localStorage.getItem('stats-sheet-opened') === 'true';
      },
      validationMessage: 'Please tap the statistics button to continue.',
    },
  },
};
