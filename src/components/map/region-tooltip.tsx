'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import type { TooltipData, RegionHoverState } from '@/types/map-types'

interface RegionTooltipProps {
  hoverState: RegionHoverState
  regions: Array<{ id: number; name: string; has_data: boolean; total_surveys?: number }>
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
          hasData: region.has_data,
          stats: region.total_surveys !== undefined ? {
            totalSurveys: region.total_surveys
          } : undefined
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

  const totalSurveys = tooltipData.stats?.totalSurveys
  // Check if region actually has survey data - total_surveys should be > 0
  const hasActualData = totalSurveys !== undefined && totalSurveys > 0
  const hasLimitedSurveys = hasActualData && totalSurveys < 5

  return (
    <div
      className="fixed z-[10010] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg px-3 py-2 pointer-events-none"
      style={{
        left: mousePosition.x + 10,
        top: mousePosition.y - 10,
        transform: 'translate(0, -100%)'
      }}
    >
      <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
        {tooltipData.regionName}
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-400">
        {hasActualData ? (
          <>
            <span className="text-green-600 dark:text-green-500">
              Data available ({totalSurveys} survey{totalSurveys !== 1 ? 's' : ''})
            </span>
            {hasLimitedSurveys && (
              <div className="flex items-center gap-1 mt-1 text-orange-600 dark:text-orange-500">
                <AlertTriangle className="h-3 w-3" />
                <span>Limited Surveys</span>
              </div>
            )}
          </>
        ) : (
          <span className="text-gray-500 dark:text-gray-400">No data</span>
        )}
      </div>
    </div>
  )
}