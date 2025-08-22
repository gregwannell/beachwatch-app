'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import { LatLngBounds } from 'leaflet'
import type { MapComponentProps } from '@/types/map-types'
import 'leaflet/dist/leaflet.css'

// Fix for Leaflet default markers in Next.js
import L from 'leaflet'
delete (L.Icon.Default.prototype as any)._getIconUrl
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

export function UKMap({ 
  regions = [], 
  selectedRegionId,
  onRegionClick,
  onRegionHover,
  className = "w-full h-full"
}: MapComponentProps) {
  const mapRef = useRef(null)

  // Region styling based on data availability and selection
  const getRegionStyle = (regionId: number, hasData: boolean) => ({
    color: hasData ? '#059669' : '#6b7280',
    weight: selectedRegionId === regionId ? 2 : 1,
    opacity: 0.8,
    fillColor: selectedRegionId === regionId 
      ? (hasData ? '#10b981' : '#9ca3af')
      : (hasData ? '#6ee7b7' : '#e5e7eb'),
    fillOpacity: selectedRegionId === regionId ? 0.6 : 0.3,
  })

  // Handle region interactions
  const onEachRegion = (feature: any, layer: any) => {
    const regionId = feature.properties.id
    const hasData = feature.properties.has_data
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
      mouseover: (e: any) => {
        // Simple hover effect (desktop)
        e.target.setStyle({
          fillOpacity: 0.7,
          weight: 2
        })
        // Set cursor style based on whether region can be drilled down
        const mapContainer = e.target._map.getContainer()
        mapContainer.style.cursor = canDrillDown ? 'pointer' : 'default'
        onRegionHover?.(regionId)
      },
      mouseout: (e: any) => {
        // Reset style (desktop)
        e.target.setStyle(getRegionStyle(regionId, hasData))
        // Reset cursor
        const mapContainer = e.target._map.getContainer()
        mapContainer.style.cursor = ''
        onRegionHover?.(null)
      }
    })
  }

  return (
    <div className={className}>
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
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
              style={() => getRegionStyle(region.id, region.has_data)}
              onEachFeature={onEachRegion}
            />
          )
        })}
      </MapContainer>
    </div>
  )
}