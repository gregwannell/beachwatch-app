'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { Card } from '@/components/ui/card'
import { useMapRegions } from '@/hooks/use-map-regions'
import { useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import dynamic from 'next/dynamic'

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

function FilterSidebar() {
  return (
    <div className="p-4 space-y-4">
      <h3 className="font-medium text-sm text-muted-foreground mb-3">
        Data Filters
      </h3>
      <Card className="p-3">
        <h4 className="font-semibold text-sm mb-2">Date Range</h4>
        <p className="text-xs text-muted-foreground">Filter controls coming soon</p>
      </Card>
      <Card className="p-3">
        <h4 className="font-semibold text-sm mb-2">Location</h4>
        <p className="text-xs text-muted-foreground">Region selection coming soon</p>
      </Card>
      <Card className="p-3">
        <h4 className="font-semibold text-sm mb-2">Litter Types</h4>
        <p className="text-xs text-muted-foreground">Category filters coming soon</p>
      </Card>
    </div>
  )
}

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
  
  // Fetch map regions data
  const { data: regions = [], isLoading, error } = useMapRegions({
    includeGeometry: true,
    onlyWithData: false
  })

  const handleRegionClick = (regionId: number) => {
    setSelectedRegionId(regionId)
    // TODO: Open region info modal when implemented
  }

  const handleRegionHover = (regionId: number | null) => {
    setHoveredRegionId(regionId)
  }

  return (
    <MainLayout 
      sidebar={<FilterSidebar />}
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
          <UKMap
            regions={regions}
            selectedRegionId={selectedRegionId}
            onRegionClick={handleRegionClick}
            onRegionHover={handleRegionHover}
            className="h-full w-full"
          />
        )}
      </div>
    </MainLayout>
  )
}
