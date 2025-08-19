'use client'

import { useState } from 'react'
import { UKMap } from './uk-map'
import { RegionTooltip } from './region-tooltip'
import { useMapRegions } from '@/hooks/use-map-regions'
import type { RegionHoverState } from '@/types/map-types'

interface InteractiveMapProps {
  onRegionClick?: (regionId: number) => void
  selectedRegionId?: number | null
  className?: string
}

export function InteractiveMap({ 
  onRegionClick, 
  selectedRegionId,
  className = "w-full h-full"
}: InteractiveMapProps) {
  const [hoverState, setHoverState] = useState<RegionHoverState>({
    hoveredRegionId: null
  })

  const { data: regions = [], isLoading, error } = useMapRegions({
    includeGeometry: true,
    onlyWithData: false
  })

  const handleRegionClick = (regionId: number) => {
    onRegionClick?.(regionId)
  }

  const handleRegionHover = (regionId: number | null) => {
    setHoverState({
      hoveredRegionId: regionId
    })
  }

  if (isLoading) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg`}>
        <div className="text-gray-600">Loading map...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-red-50 rounded-lg`}>
        <div className="text-red-600">Failed to load map data</div>
      </div>
    )
  }

  return (
    <div className={`${className} relative`}>
      <UKMap
        regions={regions}
        selectedRegionId={selectedRegionId}
        onRegionClick={handleRegionClick}
        onRegionHover={handleRegionHover}
        className="w-full h-full"
      />
      
      <RegionTooltip
        hoverState={hoverState}
        regions={regions}
      />
    </div>
  )
}