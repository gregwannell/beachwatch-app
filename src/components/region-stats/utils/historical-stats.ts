/**
 * Business logic for calculating historical statistics
 */

import type { RegionData } from '@/types/region-types'

export interface HistoricalStats {
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

/**
 * Calculate historical statistics for the last 10 years
 * @param trendData - Array of historical trend data
 * @param currentValue - Current average litter per 100m
 * @param selectedYear - Optional selected year (defaults to current year)
 * @returns Historical statistics or null if insufficient data
 */
export function calculateHistoricalStats(
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
