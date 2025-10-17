'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { useMapRegions } from '@/hooks/use-map-regions'
import { useRegionInfo } from '@/hooks/use-region-info'
import { useFilterOptions } from '@/hooks/use-filter-options'
import { useState, useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import dynamic from 'next/dynamic'
import { FilterSidebar } from '@/components/filters/filter-sidebar'
import { MobileFilterBar } from '@/components/filters/mobile-filter-bar'
import { ModernMobileNav } from '@/components/layout/modern-mobile-nav'
import { FilterState } from '@/types/filter-types'
import { RegionStatsContent } from '@/components/region-stats'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { RegionTooltip } from '@/components/map/region-tooltip'
import { type MapTheme, DEFAULT_MAP_THEME } from '@/lib/map-themes'
import { useRouter, useSearchParams } from 'next/navigation'

// Dynamic import to prevent SSR issues with Leaflet
const UKMap = dynamic(() => import('@/components/map/uk-map').then(mod => ({ default: mod.UKMap })), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center">
      <div className="space-y-4 text-center">
        <div className="text-2xl">🗺️</div>
        <Skeleton className="h-8 w-48 mx-auto" />
        <p className="text-sm text-muted-foreground">Loading interactive map...</p>
      </div>
    </div>
  )
})



export default function Home() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const regionIdParam = searchParams.get('region')
  const yearParam = searchParams.get('year')

  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(
    regionIdParam ? parseInt(regionIdParam) : 1
  ) // Default to UK (region ID 1)
  const [hoveredRegionId, setHoveredRegionId] = useState<number | null>(null)
  const [mapTheme, setMapTheme] = useState<MapTheme>(DEFAULT_MAP_THEME)
  const [hasLoadedInitialRegions, setHasLoadedInitialRegions] = useState(false)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

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
      startYear: yearParam ? parseInt(yearParam) : 2024,
      endYear: yearParam ? parseInt(yearParam) : 2024,
      mode: 'single'
    },
    categories: {}
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
          } else if (selectedRegion.type === 'Sovereign State') {
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

  // Fetch map regions data
  const { data: regions = [], isLoading, error } = useMapRegions({
    includeGeometry: true,
    onlyWithData: false,
    parentId: parentRegionId
  })

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('Map debug:', {
      regionsCount: regions.length,
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
    
    if (canDrillDown) {
      // For countries/crown dependencies: show their stats in sidebar AND drill down
      setSelectedRegionId(regionId)
      setParentRegionId(regionId)
      // Update filter for the country level
      handleFiltersChange({
        ...filters,
        region: { selectedRegionId: regionId }
      })
    } else {
      // For counties/unitary authorities: show their stats in sidebar
      setSelectedRegionId(regionId)
      // Update filter when a region is clicked on the map
      handleFiltersChange({
        ...filters,
        region: { selectedRegionId: regionId }
      })
    }
  }



  const handleRegionSelect = (regionId: string) => {
    const numericRegionId = parseInt(regionId)
    setSelectedRegionId(numericRegionId)
    handleFiltersChange({
      ...filters,
      region: { selectedRegionId: numericRegionId }
    })
  }

  const handleRegionHover = (regionId: number | null) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('handleRegionHover called with:', regionId)
    }
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

  // Sync the selected region between filters and map
  const effectiveSelectedRegionId = filters.region.selectedRegionId || selectedRegionId

  return (
    <MainLayout
      sidebar={
        <div className="hidden lg:block">
          <FilterSidebar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onMapReset={handleMapReset}
            mapTheme={mapTheme}
            onMapThemeChange={setMapTheme}
          />
        </div>
      }
      regionData={regionData || undefined}
    >
      <div className="h-full w-full relative pb-20 lg:pb-0">
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
          <Card className="h-full lg:h-full overflow-hidden rounded-none border-0 py-0 shadow-lg">
            {/* Mobile: Full-height map only */}
            <div className="h-full flex flex-col lg:hidden">
              <div className="relative flex-1 overflow-hidden">
                {/* Show loading overlay only during very first map load */}
                {isLoading && !hasLoadedInitialRegions ? (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
                    <div className="space-y-4 text-center">
                      <div className="text-2xl">🗺️</div>
                      <Skeleton className="h-8 w-48 mx-auto" />
                      <p className="text-sm text-muted-foreground">Loading interactive map...</p>
                    </div>
                  </div>
                ) : null}

                <UKMap
                  regions={regions}
                  selectedRegionId={effectiveSelectedRegionId}
                  onRegionClick={handleRegionClick}
                  onRegionHover={handleRegionHover}
                  mapTheme={mapTheme}
                  resetToUKView={resetMapView}
                  zoomToRegionId={zoomToRegionId}
                  className="h-full w-full"
                />

                {/* Region name tooltip */}
                <RegionTooltip
                  hoverState={hoverState}
                  regions={regions}
                />
              </div>
            </div>

            {/* Desktop: Split view (70% map / 30% stats) */}
            <div className="hidden lg:flex lg:flex-row h-full">
              {/* Map Section */}
              <div className="relative flex-[70%] overflow-hidden">
                {/* Show loading overlay only during very first map load */}
                {isLoading && !hasLoadedInitialRegions ? (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
                    <div className="space-y-4 text-center">
                      <div className="text-2xl">🗺️</div>
                      <Skeleton className="h-8 w-48 mx-auto" />
                      <p className="text-sm text-muted-foreground">Loading interactive map...</p>
                    </div>
                  </div>
                ) : null}

                <UKMap
                  regions={regions}
                  selectedRegionId={effectiveSelectedRegionId}
                  onRegionClick={handleRegionClick}
                  onRegionHover={handleRegionHover}
                  mapTheme={mapTheme}
                  resetToUKView={resetMapView}
                  zoomToRegionId={zoomToRegionId}
                  className="h-full w-full"
                />

                {/* Region name tooltip */}
                <RegionTooltip
                  hoverState={hoverState}
                  regions={regions}
                />
              </div>

              {/* Separator */}
              <Separator orientation="vertical" />

              {/* Stats Panel */}
              <div className="flex-[30%] overflow-auto bg-background">
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
            mapTheme={mapTheme}
            onMapThemeChange={setMapTheme}
            isLoading={isLoading}
            isOpen={isMobileFilterOpen}
            onOpenChange={setIsMobileFilterOpen}
          />
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <ModernMobileNav onFilterClick={() => setIsMobileFilterOpen(true)} />
    </MainLayout>
  )
}
