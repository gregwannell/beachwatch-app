'use client'

import { useState, useEffect } from 'react'
import type { TooltipData, RegionHoverState } from '@/types/map-types'

interface RegionTooltipProps {
  hoverState: RegionHoverState
  regions: Array<{ id: number; name: string; has_data: boolean }>
}

export function RegionTooltip({ hoverState, regions }: RegionTooltipProps) {
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (hoverState.hoveredRegionId) {
      const region = regions.find(r => r.id === hoverState.hoveredRegionId)
      if (region) {
        setTooltipData({
          regionName: region.name,
          hasData: region.has_data
        })
      }
    } else {
      setTooltipData(null)
    }
  }, [hoverState.hoveredRegionId, regions])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        setMousePosition({ x: e.touches[0].clientX, y: e.touches[0].clientY })
      }
    }

    if (tooltipData) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('touchmove', handleTouchMove, { passive: true })
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('touchmove', handleTouchMove)
    }
  }, [tooltipData])

  if (!tooltipData) return null

  return (
    <div
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 pointer-events-none"
      style={{
        left: mousePosition.x + 10,
        top: mousePosition.y - 10,
        transform: 'translate(0, -100%)'
      }}
    >
      <div className="font-medium text-sm text-gray-900">
        {tooltipData.regionName}
      </div>
      <div className="text-xs text-gray-600">
        {tooltipData.hasData ? (
          <span className="text-green-600">Data available</span>
        ) : (
          <span className="text-gray-500">No data</span>
        )}
      </div>
    </div>
  )
}