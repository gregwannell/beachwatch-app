import type { LatLngBounds } from 'leaflet'
import type { RegionGeometry, Tables } from '@/lib/database.types'

// Simple region data for map display
export interface MapRegion {
  id: number
  name: string
  geometry: RegionGeometry | null
  has_data: boolean
}

// Props for the main map component
export interface MapComponentProps {
  regions?: MapRegion[]
  selectedRegionId?: number | null
  onRegionClick?: (regionId: number) => void
  onRegionHover?: (regionId: number | null) => void
  className?: string
}

// Map bounds for UK
export interface MapBounds {
  bounds: LatLngBounds
  maxZoom?: number
  minZoom?: number
}

// Simple tooltip data
export interface TooltipData {
  regionName: string
  hasData: boolean
  stats?: {
    totalSurveys?: number
    avgLitterPer100m?: number
  }
}

// Map event handlers
export interface MapEventHandlers {
  onRegionClick: (regionId: number, regionName: string) => void
  onRegionHover: (regionId: number | null, regionName?: string) => void
}

// Hover state for regions
export interface RegionHoverState {
  hoveredRegionId: number | null
  position?: { x: number; y: number }
}