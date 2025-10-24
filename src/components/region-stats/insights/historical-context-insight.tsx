"use client"

import { Info, TrendingDown, TrendingUp, Award } from "lucide-react"
import type { RegionData } from '@/types/region-types'
import { calculateHistoricalStats, getRankingText } from '../utils'

interface HistoricalContextInsightProps {
  regionData: RegionData
  selectedYear?: number
}

export function HistoricalContextInsight({ regionData, selectedYear }: HistoricalContextInsightProps) {
  if (!regionData.litterData?.trendData || regionData.litterData.trendData.length === 0) {
    return null
  }

  const stats = calculateHistoricalStats(
    regionData.litterData.trendData,
    regionData.litterData.averageLitterPer100m,
    selectedYear
  )

  if (!stats) return null

  // Determine the icon and color based on performance
  const isGoodPerformance = !stats.isAboveAverage || stats.ranking <= 3
  const IconComponent = stats.isBestEver ? Award : stats.isAboveAverage ? TrendingUp : TrendingDown
  const iconColor = isGoodPerformance ? "text-green-600" : "text-orange-600"

  return (
    <div className="p-4 rounded-lg border bg-card">
      <div className="flex items-center space-x-2 mb-2">
        <Info className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">Historical Context</span>
      </div>

      <div className="space-y-2">
        {/* Historical average comparison */}
        <div className="flex items-start space-x-2">
          <IconComponent className={`w-4 h-4 mt-0.5 flex-shrink-0 ${iconColor}`} />
          <p className="text-sm text-muted-foreground">
            <strong>
              {stats.percentDifference === 0
                ? "Matches"
                : `${stats.percentDifference}% ${stats.isAboveAverage ? "above" : "below"}`}
            </strong> the 10-year average ({stats.historicalAverage.toFixed(1)} per 100m)
          </p>
        </div>

        {/* Ranking information */}
        <div className="flex items-start space-x-2">
          <Award className={`w-4 h-4 mt-0.5 flex-shrink-0 ${stats.isBestEver ? iconColor : "text-muted-foreground"}`} />
          <p className="text-sm text-muted-foreground">
            <strong>{getRankingText(stats)}</strong>
            {!stats.isBestEver && !stats.isWorstEver && (() => {
              const midpoint = Math.ceil(stats.totalYears / 2)
              const isInBetterHalf = stats.ranking <= midpoint

              if (isInBetterHalf) {
                // Showing as "best", so reference the all-time best
                return (
                  <span className="text-xs ml-1">
                    (best: {stats.bestYear.value.toFixed(1)} in {stats.bestYear.year})
                  </span>
                )
              } else {
                // Showing as "worst", so reference the all-time worst
                return (
                  <span className="text-xs ml-1">
                    (worst: {stats.worstYear.value.toFixed(1)} in {stats.worstYear.year})
                  </span>
                )
              }
            })()}
            {stats.isWorstEver && stats.totalYears > 1 && (
              <span className="text-xs ml-1">
                (previous low: {stats.bestYear.value.toFixed(1)} in {stats.bestYear.year})
              </span>
            )}
          </p>
        </div>

        {/* Celebration message for best year */}
        {stats.isBestEver && stats.totalYears > 1 && (
          <p className="text-xs text-green-600 dark:text-green-400 font-medium pl-6">
            🎉 Lowest litter levels in the last 10 years
          </p>
        )}
      </div>
    </div>
  )
}
