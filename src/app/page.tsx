'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { useMapRegions } from '@/hooks/use-map-regions'
import { useRegionInfo } from '@/hooks/use-region-info'
import { useFilterOptions } from '@/hooks/use-filter-options'
import { useState, useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import dynamic from 'next/dynamic'
import { FilterSidebar } from '@/components/filters/filter-sidebar'
import { FilterState } from '@/types/filter-types'
import { RegionStatsContent } from '@/components/region-stats-content'
import { Button } from '@/components/ui/button'
import { BarChart3, X } from 'lucide-react'
import { RegionTooltip } from '@/components/map/region-tooltip'
import { type MapTheme, DEFAULT_MAP_THEME } from '@/lib/map-themes'

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
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(1) // Default to UK (region ID 1)
  const [hoveredRegionId, setHoveredRegionId] = useState<number | null>(null)
  const [isStatsOpen, setIsStatsOpen] = useState(false)
  const [mapTheme, setMapTheme] = useState<MapTheme>(DEFAULT_MAP_THEME)
  const [hasLoadedInitialRegions, setHasLoadedInitialRegions] = useState(false)

  // Create hover state object for tooltip
  const hoverState = {
    hoveredRegionId
  }
  
  // Hierarchy navigation state
  const [parentRegionId, setParentRegionId] = useState<number | null>(null)
  const [resetMapView, setResetMapView] = useState(false)
  const [zoomToRegionId, setZoomToRegionId] = useState<number | null>(null)
  const [pendingZoom, setPendingZoom] = useState<number | null>(null)
  
  // Filter state management
  const [filters, setFilters] = useState<FilterState>({
    region: { selectedRegionId: 1 }, // Start with UK selected to match selectedRegionId initial state
    yearRange: {
      startYear: 2024,
      endYear: 2024,
      mode: 'single'
    },
    categories: {}
  })

  // Handle filter changes and sync selectedRegionId for regional stats
  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters)

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
  console.log('Map debug:', { 
    regionsCount: regions.length, 
    isLoading, 
    error: error?.message,
    firstRegion: regions[0]
  })

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
    console.log('handleRegionHover called with:', regionId)
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
        <FilterSidebar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onMapReset={handleMapReset}
          mapTheme={mapTheme}
          onMapThemeChange={setMapTheme}
        />
      }
    >
      <div className="h-full w-full">
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
          <>

            {/* Floating Stats Button */}
            <div className="absolute top-4 right-4 z-[10000] pointer-events-auto">
              <Button
                variant="default"
                size="lg"
                className="shadow-lg bg-white text-foreground hover:bg-gray-50 border border-border"
                onClick={() => setIsStatsOpen(true)}
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                Show Stats
              </Button>
            </div>

            {/* Custom Stats Panel */}
            <div className={`
              fixed top-0 right-0 h-full w-[30%] bg-background border-l border-border shadow-2xl
              transform transition-transform duration-300 ease-in-out z-[10003]
              ${isStatsOpen ? 'translate-x-0' : 'translate-x-full'}
            `}>
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="px-6 py-4 border-b border-border bg-background/95 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="flex items-center gap-2 font-semibold">
                        <BarChart3 className="w-5 h-5" />
                        Regional Stats
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        View regional litter statistics and environmental data
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsStatsOpen(false)}
                      className="p-2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto">
                  <RegionStatsContent
                    regionData={regionData}
                    isLoading={isRegionLoading}
                    onRegionSelect={handleRegionSelect}
                  />
                </div>
              </div>
            </div>

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

          </>
        )}
      </div>
    </MainLayout>
  )
}
