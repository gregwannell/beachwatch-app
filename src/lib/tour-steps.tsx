import type { Tour } from 'nextstepjs';
import React from 'react';

export const allTours: Tour[] = [
  {
    tour: 'desktopTour',
    steps: [
      {
        icon: <>👋</>,
        // selector: '#app-tour-welcome', // No selector - card appears centered
        title: 'Welcome to Beachwatch Data Explorer',
        content:
          <>This quick tour will show you how to navigate and use the key features of the dashboard</>,
        side: 'top',
        showControls: false,
        showSkip: false,
      },
      {
        icon: <>🔍</>,
        selector: '#desktop-filter-button',
        title: 'Filter Your Data',
        content:
          <>Click here to open the filter panel where you can refine your view by region, 
          year range, and data availability.</>,
        side: 'bottom',
        showControls: false,
        showSkip: false,
      },
      {
        icon: <>🗺️</>,
        title: 'Interactive Map',
        content:
          <>You can also click on any region on the map to go to that region and view its litter statistics.</>,
        side: 'top-left',
        showControls: false,
        showSkip: false,
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
        showControls: false,
        showSkip: false,
      },
      {
        icon: <>ℹ️</>,
        selector: '#average-litter-info-button',
        title: 'Metric Information',
        content: 
        <>Click the info icon on any metric to learn how it's calculated. This helps you understand what the numbers mean and how to interpret them.</>,
        side: 'left',
        showControls: false,
        showSkip: false,
      },
      {
        icon: <>🏁</>,
        title: 'Start Exploring!',
        content: (
          <>
            <p>
              You're all set! Explore the data, discover trends, and learn about beach litter
              across the UK. If you need help again, click "How to Use" in the header.
            </p>
          </>
        ),
        side: 'top',
        showControls: true,
        showSkip: false,
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
        showControls: false,
        showSkip: false,
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
        showControls: false,
        showSkip: false,
      },
      {
        icon: <>🗺️</>,
        title: 'Interactive Map',
        content: (
          <>
            <p>
              You can also tap any region on the map to view its statistics. Clicking a regiion will open the stats panel.
            </p>
          </>
        ),
        side: 'top',
        showControls: false,
        showSkip: false,
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
        showControls: false,
        showSkip: false,
      },
      {
        icon: <>🏁</>,
        title: 'Start Exploring!',
        content: (
          <>
            <p>
              You're all set! Explore the data, discover trends, and learn about beach litter
              across the UK. If you need help again, click "How to Use" in the header.
            </p>
          </>
        ),
        side: 'top',
        showControls: true,
        showSkip: false,
      },
    ],
  },
];
