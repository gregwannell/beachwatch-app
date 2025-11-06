import type { Tour } from 'nextstepjs';
import React from 'react';

export const allTours: Tour[] = [
  {
    tour: 'desktopTour',
    steps: [
      {
        selector: '#app-tour-welcome',
        title: 'Welcome to Beachwatch Data Explorer',
        content: (
          <>
            <p>
              Explore UK beach litter data through interactive maps and detailed statistics.
              This quick tour will show you how to navigate and use the key features of the dashboard.
            </p>
          </>
        ),
        side: 'top',
        showControls: false,
        showSkip: false,
      },
      {
        selector: '#desktop-filter-button',
        title: 'Filter Your Data',
        content: (
          <>
            <p>
              Click here to open the filter panel where you can refine your view by region,
              year range, and data availability. Apply filters to focus on specific areas or time periods.
            </p>
          </>
        ),
        side: 'bottom',
        showControls: false,
        showSkip: false,
      },
      {
        selector: '#uk-map-container',
        title: 'Interactive Map',
        content: (
          <>
            <p>
              Click on any region on the map to view its litter statistics. The map uses color
              coding to show data availability - darker regions have more survey data.
              You can drill down from countries to counties to see more detailed areas.
            </p>
          </>
        ),
        side: 'right',
        showControls: false,
        showSkip: false,
      },
      {
        selector: '#region-stats-tabs',
        title: 'Statistics Tabs',
        content: (
          <>
            <p>
              Switch between different views of your data: <strong>Overview</strong> shows key metrics
              and insights, <strong>Litter Stats</strong> breaks down items by type and source,
              and <strong>Engagement</strong> shows volunteer participation.
            </p>
          </>
        ),
        side: 'left',
        showControls: false,
        showSkip: false,
      },
      {
        selector: '#average-litter-info-button',
        title: 'Metric Information',
        content: (
          <>
            <p>
              Click the info icon on any metric to learn how it's calculated.
              For example, the Average Litter per 100m shows the median value to
              reduce the impact of outliers and give you a more accurate picture.
            </p>
          </>
        ),
        side: 'left',
        showControls: false,
        showSkip: false,
      },
      {
        selector: '#app-tour-welcome',
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
        showControls: false,
        showSkip: false,
      },
    ],
  },
  {
    tour: 'mobileTour',
    steps: [
      {
        selector: '#app-tour-welcome',
        title: 'Welcome to Beachwatch',
        content: (
          <>
            <p>
              Explore UK beach litter data on mobile. This tour will show you how to navigate
              the map, filters, and statistics on your device.
            </p>
          </>
        ),
        side: 'top',
        showControls: false,
        showSkip: false,
      },
      {
        selector: '#floating-filter-button',
        title: 'Open Filters',
        content: (
          <>
            <p>
              Tap this button in the top-right corner to open the filter sheet.
              Here you can select regions, adjust year ranges, and filter by data availability.
            </p>
          </>
        ),
        side: 'bottom',
        showControls: false,
        showSkip: false,
      },
      {
        selector: '#uk-map-container',
        title: 'Interactive Map',
        content: (
          <>
            <p>
              Tap any region on the map to view its statistics. The color intensity shows
              data availability - darker areas have more surveys. Zoom and pan to explore different areas.
            </p>
          </>
        ),
        side: 'top',
        showControls: false,
        showSkip: false,
      },
      {
        selector: '#floating-stats-button',
        title: 'View Statistics',
        content: (
          <>
            <p>
              Tap this button in the top-left corner to open the statistics sheet for the selected region.
              The sheet shows detailed metrics, charts, and insights about beach litter.
            </p>
          </>
        ),
        side: 'bottom',
        showControls: false,
        showSkip: false,
      },
      {
        selector: '#region-stats-tabs',
        title: 'Navigate Tabs',
        content: (
          <>
            <p>
              In the statistics sheet, switch between <strong>Overview</strong>,
              <strong>Litter Stats</strong>, and <strong>Engagement</strong> tabs
              to see different aspects of the data.
            </p>
          </>
        ),
        side: 'top',
        showControls: false,
        showSkip: false,
      },
      {
        selector: '#average-litter-info-button',
        title: 'Learn More',
        content: (
          <>
            <p>
              Tap info icons on metrics to learn how they're calculated.
              This helps you understand what the numbers mean and how to interpret them.
            </p>
          </>
        ),
        side: 'top',
        showControls: false,
        showSkip: false,
      },
    ],
  },
];
