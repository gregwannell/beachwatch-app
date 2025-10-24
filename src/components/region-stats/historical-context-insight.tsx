"use client"

import { Info, TrendingDown, TrendingUp, Award } from "lucide-react"
import type { RegionData } from '@/types/region-types'

interface HistoricalContextInsightProps {
  regionData: RegionData
  selectedYear?: number
}

interface HistoricalStats {
  historicalAverage: number
  percentDifference: number
  isAboveAverage: boolean
  ranking: number
  totalYears: number
  bestYear: { year: number; value: number }
  worstYear: { year: number; value: number }
  isBestEver: boolean
  isWorstEver: boolean
}

function calculateHistoricalStats(
  trendData: NonNullable<RegionData['litterData']>['trendData'],
  currentValue: number,
  selectedYear?: number
): HistoricalStats | null {
  if (!trendData || trendData.length === 0) return null

  // Filter to last 10 years only
  const currentYear = selectedYear || new Date().getFullYear()
  const tenYearsAgo = currentYear - 10
  const recentTrends = trendData.filter(trend => trend.year >= tenYearsAgo)

  if (recentTrends.length === 0) return null

  // Calculate historical average from last 10 years
  const historicalAverage = recentTrends.reduce((sum, trend) => sum + trend.averageLitterPer100m, 0) / recentTrends.length

  // Sort trends by litter amount (ascending = best to worst)
  const sortedTrends = [...recentTrends].sort((a, b) => a.averageLitterPer100m - b.averageLitterPer100m)

  // Find current year's ranking
  const ranking = sortedTrends.findIndex(trend =>
    trend.year === currentYear || trend.averageLitterPer100m === currentValue
  ) + 1

  // Get best and worst years from last 10 years
  const bestYear = { year: sortedTrends[0].year, value: sortedTrends[0].averageLitterPer100m }
  const worstYear = {
    year: sortedTrends[sortedTrends.length - 1].year,
    value: sortedTrends[sortedTrends.length - 1].averageLitterPer100m
  }

  // Calculate percent difference from historical average
  const percentDifference = historicalAverage > 0
    ? ((currentValue - historicalAverage) / historicalAverage) * 100
    : 0

  const isBestEver = ranking === 1
  const isWorstEver = ranking === sortedTrends.length

  return {
    historicalAverage,
    percentDifference: Math.round(Math.abs(percentDifference) * 10) / 10,
    isAboveAverage: percentDifference > 0,
    ranking,
    totalYears: recentTrends.length,
    bestYear,
    worstYear,
    isBestEver,
    isWorstEver
  }
}

function getRankingSuffix(rank: number): string {
  if (rank === 1) return "st"
  if (rank === 2) return "nd"
  if (rank === 3) return "rd"
  return "th"
}

function getRankingText(stats: HistoricalStats): string {
  if (stats.isBestEver) {
    return "Best year in the last 10 years"
  }
  if (stats.isWorstEver) {
    return `Highest levels in the last 10 years`
  }

  // For other rankings, show whichever is more meaningful
  // If in the better half, show "best", otherwise show "worst"
  const midpoint = Math.ceil(stats.totalYears / 2)

  if (stats.ranking <= midpoint) {
    // Show as "best"
    const suffix = getRankingSuffix(stats.ranking)
    return `${stats.ranking}${suffix} best year in the last 10 years`
  } else {
    // Show as "worst" (calculate from the other end)
    const worstRanking = stats.totalYears - stats.ranking + 1
    const suffix = getRankingSuffix(worstRanking)
    return `${worstRanking}${suffix} worst year in the last 10 years`
  }
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
