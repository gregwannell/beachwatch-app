'use client'

import { useRef, useState, useEffect } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import { LatLngBounds, LatLng } from 'leaflet'
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
  scotland: 'var(--mcs-clear-blue)',        // Blue
  england: 'var(--mcs-orange)',         // Orange
  wales: 'var(--mcs-red)',           // Red
  northernIreland: 'var(--mcs-green)', // Green
  guernsey: 'var(--mcs-navy)',        // Dark blue
  jersey: 'var(--mcs-navy)',          // Dark blue
  isleOfMan: 'var(--mcs-light-blue)'        // Light blue
}

// Function to calculate bounds from GeoJSON geometry
function calculateGeometryBounds(geometry: { type: string; coordinates: number[] | number[][] | number[][][] | number[][][][] }): LatLngBounds | null {
  if (!geometry || !geometry.coordinates) return null

  const bounds = new LatLngBounds([])

  const addCoordinatesToBounds = (coords: number[] | number[][] | number[][][]) => {
    if (typeof coords[0] === 'number') {
      // Single coordinate pair [lng, lat]
      bounds.extend(new LatLng(coords[1] as number, coords[0] as number))
    } else {
      // Array of coordinates
      coords.forEach((coord) => addCoordinatesToBounds(coord as number[] | number[][] | number[][][]))
    }
  }

  try {
    if (geometry.type === 'Polygon') {
      // Polygon: coordinates[0] is the outer ring
      addCoordinatesToBounds(geometry.coordinates[0])
    } else if (geometry.type === 'MultiPolygon') {
      // MultiPolygon: coordinates is array of polygons
      geometry.coordinates.forEach((polygon: number[][][]) => {
        addCoordinatesToBounds(polygon[0]) // outer ring of each polygon
      })
    }

    return bounds.isValid() ? bounds : null
  } catch (error) {
    console.warn('Error calculating bounds for geometry:', error)
    return null
  }
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
  resetToUKView?: boolean // Trigger to reset zoom to UK bounds
  zoomToRegionId?: number | null // Trigger to zoom to specific region
}

export function UKMap({
  regions = [],
  selectedRegionId,
  onRegionClick,
  onRegionHover,
  className = "w-full h-full",
  mapTheme = DEFAULT_MAP_THEME,
  resetToUKView = false,
  zoomToRegionId = null,
  highlightLimitedSurveys = false
}: UKMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const [hoveredRegionId, setHoveredRegionId] = useState<number | null>(null)

  // Helper function to zoom to a region by ID
  const zoomToRegion = (regionId: number) => {
    if (!mapRef.current) return

    // Special case: -1 means zoom to fit all current regions
    if (regionId === -1) {
      if (regions.length === 0) return

      // Calculate combined bounds of all regions
      let combinedBounds = null
      regions.forEach(region => {
        if (region.geometry) {
          const regionBounds = calculateGeometryBounds(region.geometry)
          if (regionBounds) {
            if (!combinedBounds) {
              combinedBounds = regionBounds
            } else {
              combinedBounds.extend(regionBounds)
            }
          }
        }
      })

      if (combinedBounds) {
        mapRef.current.fitBounds(combinedBounds, {
          padding: [20, 40],
          maxZoom: 8  // Country-level zoom when fitting multiple regions
        })
      }
      return
    }

    // Normal case: zoom to specific region
    const region = regions.find(r => r.id === regionId)
    if (!region?.geometry) return

    const bounds = calculateGeometryBounds(region.geometry)
    if (!bounds) return

    // Determine if this region can be drilled down
    const canDrillDown = region.type === 'Country' || region.type === 'Crown Dependency'

    // Different zoom levels based on region type
    const maxZoom = canDrillDown ? 8 : 10 // Countries: zoom 8, Counties: zoom 10
    const padding = canDrillDown ? [20, 20] : [10, 10] // Tighter padding for counties

    mapRef.current.fitBounds(bounds, {
      padding: padding,
      maxZoom: maxZoom
    })
  }

  // Handle reset to UK view
  useEffect(() => {
    if (resetToUKView && mapRef.current) {
      mapRef.current.fitBounds(UK_BOUNDS, {
        padding: [10, 10]
      })
    }
  }, [resetToUKView])

  // Handle zoom to specific region
  useEffect(() => {
    if (zoomToRegionId && mapRef.current) {
      zoomToRegion(zoomToRegionId)
    }
  }, [zoomToRegionId, regions])

  // Region styling based on geographic region, selection, and hover state
  const getRegionStyle = (region: MapRegion) => {
    const baseColor = getRegionColor(region, regions)
    const isSelected = selectedRegionId === region.id
    const isHovered = hoveredRegionId === region.id
    const hasLimitedSurveys = region.total_surveys !== undefined && region.total_surveys > 0 && region.total_surveys < 5

    // Use orange border for regions with limited surveys (only if highlighting is enabled)
    const shouldHighlight = highlightLimitedSurveys && hasLimitedSurveys
    const borderColor = shouldHighlight ? '#ea580c' : baseColor
    const borderWeight = shouldHighlight ? 3 : (isSelected ? 3 : (isHovered ? 3 : 1))

    return {
      color: borderColor,
      weight: borderWeight,
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
        // Zoom to polygon bounds
        zoomToRegion(regionId)

        onRegionClick?.(regionId)
      },
      touchstart: () => {
        // Zoom to polygon bounds
        zoomToRegion(regionId)

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
      {/* Map Legend - only show when highlighting is enabled */}
      {highlightLimitedSurveys && (
        <div className="absolute top-4 left-4 z-[1000] bg-white dark:bg-gray-800 rounded-lg shadow-lg px-3 py-2 border border-gray-200 dark:border-gray-700">
          <div className="text-xs font-semibold mb-2 text-gray-900 dark:text-gray-100">Legend</div>
          <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
            <div className="w-4 h-3 border-2 border-orange-600 rounded"></div>
            <span>Limited surveys (&lt;5)</span>
          </div>
        </div>
      )}

      <MapContainer
        ref={mapRef}
        bounds={UK_BOUNDS}
        maxBounds={UK_BOUNDS}
        maxBoundsViscosity={1.0}
        zoom={6}
        minZoom={5}
        maxZoom={13}
        scrollWheelZoom={true}
        touchZoom={true}
        doubleClickZoom={true}
        dragging={true}
        zoomControl={false}
        className="w-full h-full rounded-lg"
        keyboard={true}
        attributionControl={true}
        whenReady={(e) => {
          // Add zoom control to bottom-right
          L.control.zoom({
            position: 'bottomright'
          }).addTo(e.target)
        }}
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