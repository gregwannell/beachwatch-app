import type { Tour } from 'nextstepjs';
import React from 'react';

/**
 * Tour Step Configuration
 *
 * Defines all guided tours for the application using nextstepjs.
 * Tours are responsive and adapt to different viewport sizes:
 *
 * - **desktopTour**: For viewports >= 768px, featuring desktop-specific UI elements
 * - **mobileTour**: For viewports < 768px, with mobile-optimized navigation
 *
 * Each tour contains steps with:
 * - icon: Visual indicator (emoji or React element)
 * - selector: CSS ID of element to highlight (e.g., '#floating-filter-button')
 * - title: Step heading
 * - content: Step description (supports JSX)
 * - side: Position relative to target ('top', 'bottom', 'top-left', 'top-right')
 * - pointerPadding: Space around highlighted element
 * - pointerRadius: Corner rounding of spotlight
 *
 * Steps without selectors appear as centered cards for general information.
 *
 * @see {@link validation} in tour-validation.ts for step validation rules
 */
export const allTours: Tour[] = [
  {
    tour: 'desktopTour',
    steps: [
      {
        icon: <>👋</>,
        // selector: '#app-tour-welcome', // No selector - card appears centered
        title: 'Welcome to Beachwatch Data Explorer',
        content:
          <>This quick tour will show you how to navigate and use the key features of the data explorer</>,
        side: 'top',
      },
      {
        icon: <>🔍</>,
        selector: '#desktop-filter-button',
        title: 'Filter Your Data',
        content:
          <>Click here to open the filter panel where you can refine your view by region, 
          year, and data availability. Click the filter button now to bring up the panel. </>,
        side: 'bottom',
        pointerPadding: 10,
        pointerRadius: 10
      },
      {
        icon: <>🗺️</>,
        title: 'Interactive Map',
        content:
          <>You can also click on any region on the map to go to that region and view its litter statistics.</>,
        side: 'top-left',
      },
      {
        icon: <>📊</>,
        selector: '#region-stats-tabs',
        title: 'Statistics Tabs',
        content: 
          <>
              Switch between different views of your data: <strong>Overview</strong> shows key metrics
              and insights, <strong>Litter Stats</strong> breaks down items by type and source,
              and <strong>Engagement</strong> shows volunteer participation</>,
        side: 'top-left',
        pointerPadding: 10,
        pointerRadius: 10
      },
      {
        icon: <>ℹ️</>,
        selector: '#average-litter-info-button',
        title: 'Metric Information',
        content:
        <>Click the info icon on any metric to learn how it&apos;s calculated. This helps you understand what the numbers mean and how to interpret them.</>,
        side: 'top-right',
        pointerPadding: 10,
        pointerRadius: 10
      },
      {
        icon: <>🏁</>,
        title: 'Start Exploring!',
        content: (
          <>
            <p>
              You&apos;re all set! Explore the data, discover trends, and learn about beach litter
              across the UK. If you need help again, click &quot;How to Use&quot; in the header.
            </p>
          </>
        ),
        side: 'top',
      },
    ],
  },
  {
    tour: 'mobileTour',
    steps: [
      {
        icon: <>👋</>,
        // selector: '#app-tour-welcome', // No selector - card appears centered
        title: 'Welcome to Beachwatch',
        content: (
          <>
            <p>
              Explore UK beach litter data on mobile. This tour will show you how to navigate
              the map, filters, and statistics on your mobile device.
            </p>
          </>
        ),
        side: 'top',
      },
      {
        icon: <>🔍</>,
        selector: '#floating-filter-button',
        title: 'Open Filters',
        content: (
          <>
            <p>
              Tap this button in the top-right corner to open the filter drawer.
              Here you can select regions, adjust year ranges, and filter by data availability.
            </p>
          </>
        ),
        side: 'top-right',
        pointerPadding: 10,
        pointerRadius: 100
      },
      {
        icon: <>🗺️</>,
        title: 'Interactive Map',
        content: (
          <>
            <p>
              You can also tap any region on the map to view its statistics. Clicking a region will open the stats panel.
            </p>
          </>
        ),
        side: 'top',
      },
      {
        icon: <>📊</>,
        selector: '#floating-stats-button',
        title: 'View Statistics',
        content: (
          <>
            <p>
              Tap this button in the top-left corner to open the stats panel for the selected region.
              The panel shows detailed metrics, charts, and insights about beach litter.
            </p>
          </>
        ),
        side: 'top-left',
        pointerPadding: 10,
        pointerRadius: 100
      },
      {
        icon: <>🏁</>,
        title: 'Start Exploring!',
        content: (
          <>
            <p>
              You&apos;re all set! Explore the data, discover trends, and learn about beach litter
              across the UK. If you need help again, click &quot;How to Use&quot; in the header.
            </p>
          </>
        ),
        side: 'top'
      },
    ],
  },
];
