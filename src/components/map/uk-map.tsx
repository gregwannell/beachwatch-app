'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import { LatLngBounds } from 'leaflet'
import type { MapComponentProps } from '@/types/map-types'
import 'leaflet/dist/leaflet.css'

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
        onRegionHover?.(regionId)
      },
      mouseout: (e: any) => {
        // Reset style (desktop)
        e.target.setStyle(getRegionStyle(regionId, hasData))
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
                  has_data: region.has_data
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