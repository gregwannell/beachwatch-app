'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { useMapRegions } from '@/hooks/use-map-regions'
import { useRegionInfo } from '@/hooks/use-region-info'
import { useFilterOptions } from '@/hooks/use-filter-options'
import { useState, useEffect, useMemo, Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { MapLoadingOverlay } from '@/components/map/map-loading-overlay'
import dynamic from 'next/dynamic'
import { MapFilterBar } from '@/components/filters/map-filter-bar'
import { MobileFilterBar } from '@/components/filters/mobile-filter-bar'
import { ModernMobileNav } from '@/components/layout/modern-mobile-nav'
import { FloatingFilterButton } from '@/components/filters/floating-filter-button'
import { FloatingResetButton } from '@/components/filters/floating-reset-button'
import { FloatingStatsButton } from '@/components/region-stats/floating-stats-button'
import { MobileRegionStatsSheet } from '@/components/region-stats/mobile-region-stats-sheet'
import { FilterState } from '@/types/filter-types'
import { RegionStatsContent } from '@/components/region-stats'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { RegionTooltip } from '@/components/map/region-tooltip'
import { type MapTheme } from '@/lib/map-themes'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import { useNextStep } from 'nextstepjs'

// Dynamic import to prevent SSR issues with Leaflet
const UKMap = dynamic(() => import('@/components/map/uk-map').then(mod => ({ default: mod.UKMap })), {
  ssr: false,
})

function ExplorePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const regionIdParam = searchParams.get('region')
  const yearParam = searchParams.get('year')
  const { theme } = useTheme()
  const { startNextStep } = useNextStep()

  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(
    regionIdParam ? parseInt(regionIdParam) : 1
  ) // Default to UK (region ID 1)
  const [hoveredRegionId, setHoveredRegionId] = useState<number | null>(null)
  const [hasLoadedInitialRegions, setHasLoadedInitialRegions] = useState(false)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [isMobileStatsOpen, setIsMobileStatsOpen] = useState(false)

  // Sync map theme with app theme
  const mapTheme: MapTheme = (theme === 'dark' ? 'dark' : 'light') as MapTheme

  // Create hover state object for tooltip
  const hoverState = {
    hoveredRegionId
  }

  // Hierarchy navigation state
  const [parentRegionId, setParentRegionId] = useState<number | null>(null)
  const [resetMapView, setResetMapView] = useState(false)
  const [zoomToRegionId, setZoomToRegionId] = useState<number | null>(null)
  const [pendingZoom, setPendingZoom] = useState<number | null>(null)

  // Filter state management - initialize from URL params
  const [filters, setFilters] = useState<FilterState>({
    region: { selectedRegionId: regionIdParam ? parseInt(regionIdParam) : 1 },
    yearRange: {
      startYear: yearParam ? parseInt(yearParam) : 2025,
      endYear: yearParam ? parseInt(yearParam) : 2025,
      mode: 'single'
    },
    categories: {},
    dataAvailability: { showNoData: false, highlightLimitedSurveys: false } // Default: hide regions with no data
  })

  // Sync state when URL params change (from stats page navigation)
  useEffect(() => {
    if (regionIdParam) {
      const regionId = parseInt(regionIdParam)
      setSelectedRegionId(regionId)
      setFilters(prev => ({
        ...prev,
        region: { selectedRegionId: regionId }
      }))
    }
    if (yearParam) {
      const year = parseInt(yearParam)
      setFilters(prev => ({
        ...prev,
        yearRange: {
          startYear: year,
          endYear: year,
          mode: 'single'
        }
      }))
    }
  }, [regionIdParam, yearParam])

  // Handle filter changes and sync selectedRegionId for regional stats
  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters)

    // Update URL with new params
    const params = new URLSearchParams()
    if (newFilters.region.selectedRegionId) {
      params.set('region', newFilters.region.selectedRegionId.toString())
    }
    if (newFilters.yearRange.startYear) {
      params.set('year', newFilters.yearRange.startYear.toString())
    }
    router.push(`/explore?${params.toString()}`, { scroll: false })

    // Sync selectedRegionId when region filter changes
    if (newFilters.region.selectedRegionId !== filters.region.selectedRegionId) {
      setSelectedRegionId(newFilters.region.selectedRegionId)

      // Handle map layer navigation when region selection changes
      const selectedRegionId = newFilters.region.selectedRegionId
      if (selectedRegionId && filterOptions?.regions) {
        const selectedRegion = filterOptions.regions.find(r => r.id === selectedRegionId)

        if (selectedRegion) {
          if (selectedRegion.type === 'County Unitary') {
            // For counties: navigate to show counties of the parent country
            setParentRegionId(selectedRegion.parent_id)
            // Trigger zoom to the selected county after a short delay to allow regions to load
            setTimeout(() => setZoomToRegionId(selectedRegionId), 100)
          } else if (selectedRegion.type === 'Country' || selectedRegion.type === 'Crown Dependency') {
            // For countries: drill down to show counties first, then zoom when regions are loaded
            setPendingZoom(selectedRegionId)  // Store zoom request for later
            setParentRegionId(selectedRegionId)  // Load counties layer immediately
          } else if (selectedRegion.type === 'UK') {
            // For UK: show countries level and reset map view
            setParentRegionId(null)
            setZoomToRegionId(null)
            setResetMapView(true)
            setPendingZoom(null)
            // Reset the flag after a short delay
            setTimeout(() => setResetMapView(false), 100)
          }
        }
      } else if (selectedRegionId === 1) {
        // UK selected: go back to countries view and reset map
        setParentRegionId(null)
        setResetMapView(true)
        setZoomToRegionId(null)
        setPendingZoom(null)
        // Reset the flag after a short delay
        setTimeout(() => setResetMapView(false), 100)
      }
    }
  }

  const handleMapReset = () => {
    // This function replicates the old "Back to Countries" button behavior
    setParentRegionId(null) // This will default to parentId=1 in the hook (show countries)
    setSelectedRegionId(1) // This will trigger UK stats to show (region ID 1)
    setResetMapView(true) // Trigger map reset
    setZoomToRegionId(null) // Clear any zoom trigger
    setPendingZoom(null) // Clear any pending zoom

    // Reset the flag after a short delay
    setTimeout(() => setResetMapView(false), 100)
  }

  // Fetch filter options for region lookup
  const { data: filterOptions } = useFilterOptions()
  const maxYear = filterOptions?.availableYears.max

  const handleResetFilters = () => {
    if (!filterOptions) return

    // Use functional updater to preserve user's data availability preferences
    setFilters(prev => {
      const resetFilters: FilterState = {
        region: { selectedRegionId: 1 }, // Set to UK (region ID 1)
        yearRange: {
          startYear: filterOptions.availableYears.max,
          endYear: filterOptions.availableYears.max,
          mode: 'single' as const
        },
        categories: {},
        dataAvailability: prev.dataAvailability // PRESERVE user's data availability settings
      }

      return resetFilters
    })

    // Update URL (moved outside state setter to avoid setState during render)
    const params = new URLSearchParams()
    params.set('region', '1')
    params.set('year', filterOptions.availableYears.max.toString())
    router.push(`/explore?${params.toString()}`, { scroll: false })

    // Also trigger the direct map reset to ensure polygon layers return to countries view
    setSelectedRegionId(1)
    handleMapReset()
  }

  // Calculate if any filters are active
  const hasActiveFilters = filterOptions
    ? (filters.region.selectedRegionId !== null && filters.region.selectedRegionId !== 1) ||
      filters.yearRange.startYear !== filterOptions.availableYears.max
    : false

  // Fetch map regions data
  const { data: regions = [], isLoading, error } = useMapRegions({
    includeGeometry: true,
    onlyWithData: false,
    parentId: parentRegionId,
    includeSurveyCounts: true,
    year: filters.yearRange.startYear
  })

  // Apply data availability filter
  const filteredRegions = regions.filter(region => {
    // If showNoData is true, show all regions
    if (filters.dataAvailability.showNoData) {
      return true
    }
    // Always show Crown Dependencies (Isle of Man, Jersey, Guernsey) even with no data
    // for the selected year — they're small territories easily missed if hidden
    if (region.type === 'Crown Dependency') {
      return true
    }
    // Otherwise, only show regions with year-specific data
    return region.total_surveys !== undefined && region.total_surveys > 0
  })

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('Map debug:', {
      regionsCount: regions.length,
      filteredRegionsCount: filteredRegions.length,
      isLoading,
      error: error?.message,
      firstRegion: regions[0]
    })
  }

  // Fetch region info for the sidebar (including UK as default)
  const { data: regionData, isLoading: isRegionLoading } = useRegionInfo(
    selectedRegionId,
    filters.yearRange.startYear,
    true
  )

  const handleRegionClick = (regionId: number) => {
    // Find the clicked region to check its type
    const clickedRegion = regions.find(r => r.id === regionId)

    if (!clickedRegion) return

    // Check if this region can be drilled down (Countries and Crown Dependencies have children)
    const canDrillDown = clickedRegion.type === 'Country' || clickedRegion.type === 'Crown Dependency'

    // Update filter state
    setFilters(prev => ({
      ...prev,
      region: { selectedRegionId: regionId }
    }))

    // Update URL outside the state updater (side effects must not run inside setState)
    const params = new URLSearchParams()
    params.set('region', regionId.toString())
    if (filters.yearRange.startYear) {
      params.set('year', filters.yearRange.startYear.toString())
    }
    router.push(`/explore?${params.toString()}`, { scroll: false })

    // Update region selection and map layer
    setSelectedRegionId(regionId)
    if (canDrillDown) {
      // For countries/crown dependencies: drill down to show their children
      setParentRegionId(regionId)
    }
  }



  const handleRegionSelect = (regionId: string) => {
    const numericRegionId = parseInt(regionId)
    handleFiltersChange({
      ...filters,
      region: { selectedRegionId: numericRegionId }
    })
  }

  const handleRegionHover = (regionId: number | null) => {
    setHoveredRegionId(regionId)
  }

  // Clear zoom trigger after a delay to allow map to process
  useEffect(() => {
    if (zoomToRegionId) {
      const timer = setTimeout(() => setZoomToRegionId(null), 200)
      return () => clearTimeout(timer)
    }
  }, [zoomToRegionId])

  // Track when we've loaded initial regions to prevent loading overlay during transitions
  useEffect(() => {
    if (regions.length > 0 && !hasLoadedInitialRegions) {
      setHasLoadedInitialRegions(true)
    }
  }, [regions.length, hasLoadedInitialRegions])

  // Execute pending zoom when target region becomes available
  useEffect(() => {
    if (pendingZoom && regions.length > 0 && !isLoading) {
      // Check if the target region exists in current regions
      const targetRegion = regions.find(r => r.id === pendingZoom)

      if (targetRegion) {
        // Target region is available, execute zoom
        setZoomToRegionId(pendingZoom)
        setPendingZoom(null)  // Clear pending zoom
      } else if (filterOptions?.regions) {
        // Target region not in current layer, check if it's a country showing its counties
        const targetCountry = filterOptions.regions.find(r => r.id === pendingZoom)
        if (targetCountry && (targetCountry.type === 'Country' || targetCountry.type === 'Crown Dependency')) {
          // For countries, zoom to fit all counties of that country
          // Since we're showing counties of this country (parentRegionId === pendingZoom),
          // we can trigger a zoom that will fit all visible counties
          if (parentRegionId === pendingZoom) {
            // Use a special zoom ID that the map will interpret as "zoom to fit all current regions"
            setZoomToRegionId(-1)  // Special ID for "fit all regions"
            setPendingZoom(null)
          }
        }
      }
    }
  }, [regions, isLoading, pendingZoom, filterOptions, parentRegionId])

  // Auto-start tour on first visit
  useEffect(() => {
    // Check if tour has been completed (persists across sessions)
    const hasCompletedTour = localStorage.getItem('beachwatch-tour-completed')
    // Check if tour was shown this session (resets when browser closes)
    const shownThisSession = sessionStorage.getItem('beachwatch-tour-shown')

    if (!hasCompletedTour && !shownThisSession) {
      // Detect viewport to choose correct tour
      const isMobile = window.innerWidth < 768
      const tourName = isMobile ? 'mobileTour' : 'desktopTour'

      // Clear validation flags before starting
      if (tourName === 'mobileTour') {
        localStorage.removeItem('stats-sheet-opened')
      }

      // Delay to allow page to fully load: map initialization, data fetching, and component rendering
      const timer = setTimeout(() => {
        startNextStep(tourName)
        // Mark as shown this session
        sessionStorage.setItem('beachwatch-tour-shown', 'true')
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [startNextStep])

  // Sync the selected region between filters and map
  const effectiveSelectedRegionId = filters.region.selectedRegionId || selectedRegionId

  // Calculate active filter count for the floating button badge
  const activeFilterCount = useMemo(() => {
    let count = 0
    // Count region filter (if not UK/default)
    if (filters.region.selectedRegionId && filters.region.selectedRegionId !== 1) {
      count++
    }
    // Count year filter (if not the most recent year)
    if (maxYear && filters.yearRange.startYear !== maxYear) {
      count++
    }
    return count
  }, [filters.region.selectedRegionId, filters.yearRange.startYear, maxYear])

  return (
    <MainLayout>
      <div id="app-tour-welcome" className="h-full w-full relative md:pb-0">
        {error ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="text-4xl">⚠️</div>
              <h3 className="text-lg font-medium">Failed to load map data</h3>
              <p className="text-muted-foreground text-sm">
                {error.message || 'Unable to fetch region data'}
              </p>
            </div>
          </div>
        ) : (
          <Card className="h-full overflow-hidden rounded-none border-0 py-0 shadow-lg relative">
            {/* Single loading overlay covering both map and stats panel */}
            {isLoading && !hasLoadedInitialRegions ? (
              <MapLoadingOverlay isComplete={hasLoadedInitialRegions} />
            ) : null}

            {/* Mobile: Full-height map only */}
            <div className="h-full flex flex-col md:hidden">
              <div id="uk-map-container" className="relative flex-1 overflow-hidden">

                <UKMap
                  regions={filteredRegions}
                  selectedRegionId={effectiveSelectedRegionId}
                  onRegionClick={handleRegionClick}
                  onRegionHover={handleRegionHover}
                  mapTheme={mapTheme}
                  highlightLimitedSurveys={filters.dataAvailability.highlightLimitedSurveys}
                  resetToUKView={resetMapView}
                  zoomToRegionId={zoomToRegionId}
                  className="h-full w-full"
                />

                {/* MCS Logo overlay - top-left on mobile to avoid nav bar */}
                <div className="absolute top-4 left-4 z-[900] pointer-events-none">
                  <Image
                    src={theme === 'dark' ? '/MCS_Logo_Stacked_White.png' : '/MCS_Logo_Stacked_Ink.png'}
                    alt="Marine Conservation Society"
                    width={150}
                    height={150}
                    className="w-18 h-auto drop-shadow-md"
                  />
                </div>

                {/* Region name tooltip */}
                <RegionTooltip
                  hoverState={hoverState}
                  regions={filteredRegions}
                />

                {/* Floating stats button - mobile only */}
                <FloatingStatsButton
                  onClick={() => setIsMobileStatsOpen(true)}
                />

                {/* Floating filter button - mobile only */}
                <FloatingFilterButton
                  onClick={() => setIsMobileFilterOpen(true)}
                  activeFilterCount={activeFilterCount}
                />

                {/* Floating reset button - mobile only, appears when filters are active */}
                <FloatingResetButton
                  onClick={handleResetFilters}
                  hasActiveFilters={hasActiveFilters}
                />
              </div>
            </div>

            {/* Tablet & Desktop: Split view with responsive widths */}
            <div className="hidden md:flex md:flex-row h-full">
              {/* Map Section */}
              <div id="uk-map-container" className="relative flex-1 min-w-0 md:min-w-[400px] overflow-hidden">
                {/* Map Filter Bar - Desktop only */}
                {filterOptions && (
                  <div className="absolute top-4 right-6 z-[950]">
                    <MapFilterBar
                      filters={filters}
                      onFiltersChange={handleFiltersChange}
                      onMapReset={handleMapReset}
                      onReset={handleResetFilters}
                    />
                  </div>
                )}

                <UKMap
                  regions={filteredRegions}
                  selectedRegionId={effectiveSelectedRegionId}
                  onRegionClick={handleRegionClick}
                  onRegionHover={handleRegionHover}
                  mapTheme={mapTheme}
                  highlightLimitedSurveys={filters.dataAvailability.highlightLimitedSurveys}
                  resetToUKView={resetMapView}
                  zoomToRegionId={zoomToRegionId}
                  className="h-full w-full"
                />

                {/* MCS Logo overlay */}
                <div className="absolute bottom-28 md:bottom-4 left-4 z-[900] pointer-events-none">
                  <Image
                    src={theme === 'dark' ? '/MCS_Logo_Stacked_White.png' : '/MCS_Logo_Stacked_Ink.png'}
                    alt="Marine Conservation Society"
                    width={150}
                    height={150}
                    className="w-24 h-auto drop-shadow-md"
                  />
                </div>

                {/* Region name tooltip */}
                <RegionTooltip
                  hoverState={hoverState}
                  regions={filteredRegions}
                />
              </div>

              {/* Separator */}
              <Separator orientation="vertical" />

              {/* Stats Panel */}
              <div className="w-full md:w-[50%] md:max-w-[600px] lg:w-[40%] lg:max-w-[550px] xl:w-[35%] xl:max-w-[600px] 2xl:w-[30%] 2xl:max-w-[700px] bg-background">
                <RegionStatsContent
                  regionData={regionData || undefined}
                  isLoading={isRegionLoading}
                  onRegionSelect={handleRegionSelect}
                  selectedYear={filters.yearRange.startYear}
                />
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Hidden Mobile Filter Bar - Controlled via bottom nav */}
      {filterOptions && (
        <div className="hidden">
          <MobileFilterBar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onMapReset={handleMapReset}
            regions={filterOptions.regions}
            availableYears={filterOptions.availableYears}
            isLoading={isLoading}
            isOpen={isMobileFilterOpen}
            onOpenChange={setIsMobileFilterOpen}
          />
        </div>
      )}

      {/* Mobile Stats Sheet */}
      <div className="md:hidden">
        <MobileRegionStatsSheet
          open={isMobileStatsOpen}
          onOpenChange={setIsMobileStatsOpen}
          regionData={regionData || undefined}
          isLoading={isRegionLoading}
          selectedYear={filters.yearRange.startYear}
          onRegionSelect={handleRegionSelect}
        />
      </div>

      {/* Mobile Bottom Navigation */}
      <ModernMobileNav />
    </MainLayout>
  )
}

export default function ExplorePageClient() {
  return (
    <Suspense fallback={
      <MainLayout>
        <div className="h-full w-full flex items-center justify-center">
          <div className="space-y-4 text-center">
            <div className="text-2xl">🗺️</div>
            <Skeleton className="h-8 w-48 mx-auto" />
            <p className="text-sm text-muted-foreground">Loading explore page...</p>
          </div>
        </div>
      </MainLayout>
    }>
      <ExplorePageContent />
    </Suspense>
  )
}
