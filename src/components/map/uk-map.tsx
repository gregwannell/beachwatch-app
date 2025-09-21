'use client'

import { useRef, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import { LatLngBounds } from 'leaflet'
import type { MapComponentProps, MapRegion } from '@/types/map-types'
import { MAP_THEMES, type MapTheme, DEFAULT_MAP_THEME } from '@/lib/map-themes'
import 'leaflet/dist/leaflet.css'
import 'leaflet-providers'

// Fix for Leaflet default markers in Next.js
import L, { LeafletMouseEvent } from 'leaflet'
delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// UK map bounds
const UK_BOUNDS = new LatLngBounds(
  [49.5, -8.5], // Southwest
  [61.0, 2.0]   // Northeast
)

// Geographic region colors
const REGION_COLORS = {
  scotland: '#5f99de',        // Blue
  england: '#ecab3b',         // Orange
  wales: '#e46558',           // Red
  northernIreland: '#8bc53d', // Green
  guernsey: '#20263e',        // Dark blue
  jersey: '#20263e',          // Dark blue
  isleOfMan: '#d5e4f6'        // Light blue
}

// Function to determine region color based on name and parent relationships
function getRegionColor(region: { id: number; name: string; parent_id: number | null; type: string }, regions: MapRegion[]): string {
  const regionName = region.name.toLowerCase()

  // Direct name matching for main territories (exact matches)
  if (regionName === 'scotland') return REGION_COLORS.scotland
  if (regionName === 'england') return REGION_COLORS.england
  if (regionName === 'wales') return REGION_COLORS.wales
  if (regionName === 'northern ireland') return REGION_COLORS.northernIreland
  if (regionName === 'guernsey') return REGION_COLORS.guernsey
  if (regionName === 'jersey') return REGION_COLORS.jersey
  if (regionName === 'isle of man') return REGION_COLORS.isleOfMan

  // Direct parent_id mapping for county unitaries when parent isn't in current regions array
  if (region.parent_id === 2) return REGION_COLORS.england      // England
  if (region.parent_id === 6) return REGION_COLORS.northernIreland // Northern Ireland
  if (region.parent_id === 7) return REGION_COLORS.scotland     // Scotland
  if (region.parent_id === 8) return REGION_COLORS.wales        // Wales
  if (region.parent_id === 1) {
    // Child of UK - could be a country or crown dependency, try recursive lookup
    const parent = regions.find(r => r.id === region.parent_id)
    if (parent) {
      return getRegionColor(parent, regions)
    }
  }

  // For any other region with a parent, try to find parent in regions array
  if (region.parent_id) {
    const parent = regions.find(r => r.id === region.parent_id)
    if (parent) {
      return getRegionColor(parent, regions)
    }
  }

  // Default fallback color
  return '#6b7280'
}

interface UKMapProps extends MapComponentProps {
  mapTheme?: MapTheme
}

export function UKMap({
  regions = [],
  selectedRegionId,
  onRegionClick,
  onRegionHover,
  className = "w-full h-full",
  mapTheme = DEFAULT_MAP_THEME
}: UKMapProps) {
  const mapRef = useRef(null)
  const [hoveredRegionId, setHoveredRegionId] = useState<number | null>(null)

  // Region styling based on geographic region, selection, and hover state
  const getRegionStyle = (region: MapRegion) => {
    const baseColor = getRegionColor(region, regions)
    const isSelected = selectedRegionId === region.id
    const isHovered = hoveredRegionId === region.id

    return {
      color: baseColor,
      weight: isSelected ? 3 : (isHovered ? 3 : 1),
      opacity: 1,
      fillColor: baseColor,
      fillOpacity: isSelected ? 0.8 : (isHovered ? 0.8 : 0.5),
    }
  }

  // Handle region interactions
  const onEachRegion = (feature: { properties: { id: number; has_data: boolean; type: string } }, layer: L.Layer) => {
    const regionId = feature.properties.id
    const regionType = feature.properties.type
    
    // Determine if this region can be drilled down
    const canDrillDown = regionType === 'Country' || regionType === 'Crown Dependency'
    
    layer.on({
      click: () => {
        onRegionClick?.(regionId)
      },
      touchstart: () => {
        // Handle touch for mobile
        onRegionClick?.(regionId)
      },
      mouseover: (e: LeafletMouseEvent) => {
        // Set hover state to trigger re-render with hover styles
        setHoveredRegionId(regionId)
        // Set cursor style based on whether region can be drilled down
        const mapContainer = (e.target as L.Path)._map.getContainer()
        mapContainer.style.cursor = canDrillDown ? 'pointer' : 'default'
        onRegionHover?.(regionId)
      },
      mouseout: (e: LeafletMouseEvent) => {
        // Clear hover state to trigger re-render with normal styles
        setHoveredRegionId(null)
        // Reset cursor
        const mapContainer = (e.target as L.Path)._map.getContainer()
        mapContainer.style.cursor = ''
        onRegionHover?.(null)
      }
    })
  }

  return (
    <div className={className} role="application" aria-label="Interactive UK regions map">
      <MapContainer
        ref={mapRef}
        bounds={UK_BOUNDS}
        maxBounds={UK_BOUNDS}
        maxBoundsViscosity={1.0}
        zoom={6}
        minZoom={5}
        maxZoom={10}
        scrollWheelZoom={true}
        touchZoom={true}
        doubleClickZoom={true}
        dragging={true}
        zoomControl={true}
        className="w-full h-full rounded-lg"
        keyboard={true}
        attributionControl={true}
      >
        <TileLayer
          key={mapTheme}
          attribution={MAP_THEMES[mapTheme].attribution}
          url={MAP_THEMES[mapTheme].url}
        />
        
        {regions.map((region) => {
          if (!region.geometry) return null
          
          return (
            <GeoJSON
              key={region.id}
              data={{
                type: 'Feature',
                properties: { 
                  id: region.id, 
                  name: region.name,
                  has_data: region.has_data,
                  type: region.type
                },
                geometry: region.geometry
              }}
              style={() => getRegionStyle(region)}
              onEachFeature={onEachRegion}
            />
          )
        })}
      </MapContainer>
    </div>
  )
}