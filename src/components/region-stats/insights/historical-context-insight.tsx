"use client"

import { Info, TrendingDown, TrendingUp, Award, History } from "lucide-react"
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
  const iconBg = isGoodPerformance
    ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600"
    : "bg-amber-100 dark:bg-amber-900/40 text-amber-600"

  return (
    <div className="bg-card p-6 rounded-2xl shadow-sm border relative overflow-hidden min-h-[200px] flex flex-col group">
      {/* Background watermark icon */}
      <div className="absolute top-0 right-0 p-4">
        <History className="w-20 h-20 text-muted-foreground/5" />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center gap-2 text-primary font-bold mb-4">
          <Info className="w-4 h-4" />
          <span className="text-xs uppercase tracking-widest">Historical Context</span>
        </div>

        <div className="space-y-4 flex-1">
          {/* Historical average comparison */}
          <div className="flex items-start gap-3">
            <div className={`p-1.5 rounded-lg flex-shrink-0 mt-0.5 ${iconBg}`}>
              <IconComponent className="w-3.5 h-3.5" />
            </div>
            <p className="text-base leading-relaxed">
              <strong>
                {stats.percentDifference === 0
                  ? "Matches"
                  : `${stats.percentDifference}% ${stats.isAboveAverage ? "above" : "below"}`}
              </strong>
              <span className="text-muted-foreground"> the 10-year average </span>
              <span className="text-muted-foreground/60">({stats.historicalAverage.toFixed(1)} per 100m)</span>
            </p>
          </div>

          {/* Ranking information */}
          <div className="flex items-start gap-3">
            <div className={`p-1.5 rounded-lg flex-shrink-0 mt-0.5 ${stats.isBestEver ? iconBg : "bg-amber-100 dark:bg-amber-900/40 text-amber-600"}`}>
              <Award className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-base leading-relaxed">
                <strong>{getRankingText(stats)}</strong>
              </p>
              {!stats.isBestEver && !stats.isWorstEver && (() => {
                const midpoint = Math.ceil(stats.totalYears / 2)
                const isInBetterHalf = stats.ranking <= midpoint

                if (isInBetterHalf) {
                  return (
                    <span className="text-xs text-muted-foreground/60 font-medium uppercase tracking-widest">
                      Best Record: {stats.bestYear.value.toFixed(1)} in {stats.bestYear.year}
                    </span>
                  )
                } else {
                  return (
                    <span className="text-xs text-muted-foreground/60 font-medium uppercase tracking-widest">
                      Worst Record: {stats.worstYear.value.toFixed(1)} in {stats.worstYear.year}
                    </span>
                  )
                }
              })()}
              {stats.isWorstEver && stats.totalYears > 1 && (
                <span className="text-xs text-muted-foreground/60 font-medium uppercase tracking-widest block">
                  Previous low: {stats.bestYear.value.toFixed(1)} in {stats.bestYear.year}
                </span>
              )}
            </div>
          </div>

          {/* Celebration message for best year */}
          {stats.isBestEver && stats.totalYears > 1 && (
            <p className="text-xs text-green-600 dark:text-green-400 font-medium pl-9">
              Lowest litter levels in the last 10 years
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
