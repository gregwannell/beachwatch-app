'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { useMapRegions } from '@/hooks/use-map-regions'
import { useRegionInfo } from '@/hooks/use-region-info'
import { useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import dynamic from 'next/dynamic'
import { FilterSidebar } from '@/components/filters/filter-sidebar'
import { FilterState } from '@/types/filter-types'
import { RegionInfoPanel } from '@/components/region-info-panel'
import { RegionStatsContent } from '@/components/region-stats-content'
import { Button } from '@/components/ui/button'
import { useUKStats } from '@/hooks/use-uk-stats'

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
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null)
  const [hoveredRegionId, setHoveredRegionId] = useState<number | null>(null)
  const [isRegionPanelOpen, setIsRegionPanelOpen] = useState(false)
  const [statsPanelCollapsed, setStatsPanelCollapsed] = useState(false)
  
  // Hierarchy navigation state
  const [parentRegionId, setParentRegionId] = useState<number | null>(null)
  const [parentRegionName, setParentRegionName] = useState<string | null>(null)
  
  // Filter state management
  const [filters, setFilters] = useState<FilterState>({
    region: { selectedRegionId: null },
    yearRange: {
      startYear: 2024,
      endYear: 2024,
      mode: 'single'
    },
    categories: {}
  })
  
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

  // Fetch region info for the sidebar
  const { data: regionData, isLoading: isRegionLoading } = useRegionInfo(
    selectedRegionId,
    filters.yearRange.startYear,
    !statsPanelCollapsed
  )

  // Fetch UK stats for default state
  const { data: ukStatsData, isLoading: isUKStatsLoading } = useUKStats(
    filters.yearRange.startYear,
    !statsPanelCollapsed && !selectedRegionId
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
      setStatsPanelCollapsed(false) // Ensure sidebar is open
      setParentRegionId(regionId)
      setParentRegionName(clickedRegion.name)
      // Update filter for the country level
      setFilters(prev => ({
        ...prev,
        region: { selectedRegionId: regionId }
      }))
    } else {
      // For counties/unitary authorities: show their stats in sidebar
      setSelectedRegionId(regionId)
      setStatsPanelCollapsed(false) // Ensure sidebar is open
      setIsRegionPanelOpen(false) // Close any existing modal
      // Update filter when a region is clicked on the map
      setFilters(prev => ({
        ...prev,
        region: { selectedRegionId: regionId }
      }))
    }
  }

  const handleRegionPanelClose = () => {
    setIsRegionPanelOpen(false)
    // Keep the selected region for visual feedback on map, but close panel
  }

  const handleBackToCountries = () => {
    setParentRegionId(null) // This will default to parentId=1 in the hook
    setParentRegionName(null)
    setSelectedRegionId(null) // This will trigger UK stats to show
    setIsRegionPanelOpen(false)
    setStatsPanelCollapsed(false) // Keep sidebar open to show UK stats
  }

  const handleRegionSelect = (regionId: string) => {
    const numericRegionId = parseInt(regionId)
    setSelectedRegionId(numericRegionId)
    setStatsPanelCollapsed(false) // Ensure sidebar is open
    setFilters(prev => ({
      ...prev,
      region: { selectedRegionId: numericRegionId }
    }))
    // Keep sidebar open to show the new region's data
  }

  const handleRegionHover = (regionId: number | null) => {
    setHoveredRegionId(regionId)
  }

  // Sync the selected region between filters and map
  const effectiveSelectedRegionId = filters.region.selectedRegionId || selectedRegionId

  return (
    <MainLayout 
      sidebar={
        <FilterSidebar 
          filters={filters}
          onFiltersChange={setFilters}
        />
      }
      statsPanel={
        <RegionStatsContent
          regionData={selectedRegionId ? regionData : ukStatsData}
          isLoading={selectedRegionId ? isRegionLoading : isUKStatsLoading}
          onRegionSelect={handleRegionSelect}
        />
      }
      statsPanelCollapsed={statsPanelCollapsed}
      onStatsPanelToggle={() => setStatsPanelCollapsed(!statsPanelCollapsed)}
    >
      <div className="h-full w-full">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="space-y-4 text-center">
              <Skeleton className="h-8 w-48 mx-auto" />
              <Skeleton className="h-4 w-32 mx-auto" />
              <div className="mt-8">
                <Skeleton className="h-96 w-full" />
              </div>
            </div>
          </div>
        ) : error ? (
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
            {/* Back button when viewing counties */}
            {parentRegionId && (
              <div className="absolute top-4 left-4 z-[10000] pointer-events-auto">
                <Button 
                  onClick={handleBackToCountries}
                  variant="secondary"
                  size="sm"
                  className="bg-white shadow-lg border border-gray-300 hover:bg-gray-50 text-gray-900 font-medium"
                >
                  ← Back to Countries
                </Button>
              </div>
            )}
            
            <UKMap
              regions={regions}
              selectedRegionId={effectiveSelectedRegionId}
              onRegionClick={handleRegionClick}
              onRegionHover={handleRegionHover}
              className="h-full w-full"
            />
            
            <RegionInfoPanel
              isOpen={isRegionPanelOpen}
              onClose={handleRegionPanelClose}
              regionData={regionData || undefined}
              isLoading={isRegionLoading}
              onRegionSelect={handleRegionSelect}
            />
          </>
        )}
      </div>
    </MainLayout>
  )
}
