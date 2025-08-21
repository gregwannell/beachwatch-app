# Plan: Replace Modal with Collapsible Sidebar for Region Stats

Based on my analysis of the codebase, I'll implement a collapsible sidebar system that shows stats based on the clicked region type. Here's my implementation plan:

## 1. Update Main Layout Structure
- Modify `MainLayout` component to support a collapsible right sidebar instead of the current fixed stats panel
- Add props for sidebar state management (collapsed/expanded, content)
- Implement smooth transitions for the sidebar collapse/expand animation

## 2. Create New Hook for UK-level Stats
- Create `useUKStats` hook to fetch United Kingdom aggregate statistics  
- This will be used as the default state when no region is selected

## 3. Modify Region Selection Logic
- Update the `handleRegionClick` function in `page.tsx` to:
  - Show country/crown dependency stats when clicking those region types
  - Show county/unitary authority stats when clicking those regions  
  - Keep current drill-down behavior for countries/crown dependencies
  - Always keep the sidebar open and update its content instead of using the modal

## 4. Update Region Info Hook
- Extend `useRegionInfo` hook to handle different region types (country, county, UK)
- Add logic to fetch appropriate statistics based on region level
- Support UK-level aggregated statistics

## 5. Transform RegionInfoPanel Component
- Convert from modal-based (Sheet) to inline sidebar content
- Remove modal wrapper and use as direct sidebar content
- Maintain all existing data visualization and layout
- Add collapsible behavior integration

## 6. State Management Updates
- Add sidebar collapse state to main page component
- Integrate sidebar state with region selection
- Show UK stats by default when sidebar is open but no region selected
- Update sidebar content based on selected region type

## Key Features:
- **Default State**: Shows UK statistics when sidebar is open but no region selected
- **Country/Crown Dependency Click**: Shows country-level stats in sidebar
- **County/Unitary Authority Click**: Shows detailed regional stats in sidebar  
- **Collapsible**: Users can collapse/expand the sidebar as needed
- **Smooth Transitions**: Animated sidebar state changes
- **Responsive**: Maintains mobile-friendly behavior

This approach transforms the current modal-based interaction into a more integrated sidebar experience that provides context-appropriate statistics based on the selected region hierarchy level.