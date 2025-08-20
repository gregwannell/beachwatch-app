'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { Card } from '@/components/ui/card'
import { useMapRegions } from '@/hooks/use-map-regions'
import { useRegionInfo } from '@/hooks/use-region-info'
import { useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import dynamic from 'next/dynamic'
import { FilterSidebar } from '@/components/filters/filter-sidebar'
import { FilterState } from '@/types/filter-types'
import { RegionInfoPanel } from '@/components/region-info-panel'

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


function StatsPanel() {
  return (
    <div className="p-4 space-y-4">
      <Card className="p-4">
        <h4 className="font-semibold text-sm mb-2">Survey Stats</h4>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Surveys:</span>
            <span className="font-medium">1,247</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Beaches Covered:</span>
            <span className="font-medium">423</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Items Logged:</span>
            <span className="font-medium">89,234</span>
          </div>
        </div>
      </Card>
      <Card className="p-4">
        <h4 className="font-semibold text-sm mb-2">Top Items</h4>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Plastic bottles:</span>
            <span className="font-medium">12,456</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cigarette butts:</span>
            <span className="font-medium">8,923</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Food wrappers:</span>
            <span className="font-medium">7,134</span>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default function Home() {
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null)
  const [hoveredRegionId, setHoveredRegionId] = useState<number | null>(null)
  const [isRegionPanelOpen, setIsRegionPanelOpen] = useState(false)
  
  // Filter state management
  const [filters, setFilters] = useState<FilterState>({
    region: { selectedRegionId: null },
    yearRange: {
      startYear: 2024,
      endYear: 2024,
      mode: 'single'
    },
    categories: {
      materials: [],
      sources: [],
    }
  })
  
  // Fetch map regions data
  const { data: regions = [], isLoading, error } = useMapRegions({
    includeGeometry: true,
    onlyWithData: false
  })

  // Fetch region info for the panel
  const { data: regionData, isLoading: isRegionLoading } = useRegionInfo(
    selectedRegionId,
    isRegionPanelOpen
  )

  const handleRegionClick = (regionId: number) => {
    setSelectedRegionId(regionId)
    setIsRegionPanelOpen(true)
    // Also update the filter when a region is clicked on the map
    setFilters(prev => ({
      ...prev,
      region: { selectedRegionId: regionId }
    }))
  }

  const handleRegionPanelClose = () => {
    setIsRegionPanelOpen(false)
    // Keep the selected region for visual feedback on map, but close panel
  }

  const handleRegionSelect = (regionId: string) => {
    const numericRegionId = parseInt(regionId)
    setSelectedRegionId(numericRegionId)
    setFilters(prev => ({
      ...prev,
      region: { selectedRegionId: numericRegionId }
    }))
    // Keep panel open to show the new region's data
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
      statsPanel={<StatsPanel />}
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
