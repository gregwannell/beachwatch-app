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
  scotland: '#5f99de',        // Blue
  england: '#ecab3b',         // Orange
  wales: '#e46558',           // Red
  northernIreland: '#8bc53d', // Green
  guernsey: '#20263e',        // Dark blue
  jersey: '#20263e',          // Dark blue
  isleOfMan: '#d5e4f6'        // Light blue
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
}

export function UKMap({
  regions = [],
  selectedRegionId,
  onRegionClick,
  onRegionHover,
  className = "w-full h-full",
  mapTheme = DEFAULT_MAP_THEME,
  resetToUKView = false
}: UKMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const [hoveredRegionId, setHoveredRegionId] = useState<number | null>(null)

  // Handle reset to UK view
  useEffect(() => {
    if (resetToUKView && mapRef.current) {
      mapRef.current.fitBounds(UK_BOUNDS, {
        padding: [10, 10]
      })
    }
  }, [resetToUKView])

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
        // Find the region data for this clicked region
        const clickedRegion = regions.find(r => r.id === regionId)

        // Zoom to polygon bounds
        if (clickedRegion?.geometry && mapRef.current) {
          const bounds = calculateGeometryBounds(clickedRegion.geometry)
          if (bounds) {
            // Different zoom levels based on region type
            const maxZoom = canDrillDown ? 8 : 10 // Countries: zoom 8, Counties: zoom 10
            const padding = canDrillDown ? [20, 20] : [10, 10] // Tighter padding for counties

            mapRef.current.fitBounds(bounds, {
              padding: padding,
              maxZoom: maxZoom
            })
          }
        }

        onRegionClick?.(regionId)
      },
      touchstart: () => {
        // Find the region data for this touched region
        const clickedRegion = regions.find(r => r.id === regionId)

        // Zoom to polygon bounds
        if (clickedRegion?.geometry && mapRef.current) {
          const bounds = calculateGeometryBounds(clickedRegion.geometry)
          if (bounds) {
            // Different zoom levels based on region type
            const maxZoom = canDrillDown ? 8 : 10 // Countries: zoom 8, Counties: zoom 10
            const padding = canDrillDown ? [20, 20] : [10, 10] // Tighter padding for counties

            mapRef.current.fitBounds(bounds, {
              padding: padding,
              maxZoom: maxZoom
            })
          }
        }

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
        maxZoom={13}
        scrollWheelZoom={true}
        touchZoom={true}
        doubleClickZoom={true}
        dragging={true}
        zoomControl={true}
        className="w-full h-full rounded-lg"
        keyboard={true}
        attributionControl={true}
        whenReady={() => {
          // Map is ready for use
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