"use client"

import Image from 'next/image'
import { TrendingDown, TrendingUp, Award } from 'lucide-react'
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

  const isGoodPerformance = !stats.isAboveAverage || stats.isBestEver
  const IconComponent = stats.isBestEver ? Award : stats.isAboveAverage ? TrendingUp : TrendingDown
  const accentClass = isGoodPerformance ? 'text-mcs-teal' : 'text-mcs-red'
  const iconBgClass = isGoodPerformance ? 'bg-mcs-teal/20' : 'bg-mcs-red/20'
  const iconColorClass = isGoodPerformance ? 'text-mcs-teal' : 'text-mcs-orange'

  let badgeText: string | null = null
  let badgeClass = ''
  if (stats.isBestEver) {
    badgeText = 'REGIONS BEST YEAR'
    badgeClass = 'bg-mcs-teal/20 text-mcs-teal border border-mcs-teal/30'
  } else if (stats.isWorstEver) {
    badgeText = 'REGIONS WORST YEAR'
    badgeClass = 'bg-mcs-red/20 text-mcs-red border border-mcs-red/30'
  } else if (!stats.isAboveAverage) {
    badgeText = 'BELOW REGION AVERAGE'
    badgeClass = 'bg-mcs-teal/20 text-mcs-teal border border-mcs-teal/30'
  } else if (stats.isAboveAverage) {
    badgeText = 'ABOVE REGION AVERAGE'
    badgeClass = 'bg-mcs-red/20 text-mcs-red border border-mcs-red/30'
  }

  const avgLabel =
    stats.percentDifference === 0
      ? 'matches the average'
      : `${stats.isAboveAverage ? 'above' : 'below'} 10 year average`

  return (
    <div className="bg-gradient-to-br from-mcs-ink to-mcs-navy rounded-2xl border border-white/10 p-6 min-h-[260px] flex flex-col justify-between relative overflow-hidden">
      <Image
        src="/waves-turquoise.png"
        alt=""
        fill
        className="object-cover"
        style={{ opacity: 0.06 }}
      />

      {/* Top section */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-10 h-10 rounded-full ${iconBgClass} flex items-center justify-center`}>
            <IconComponent className={`w-5 h-5 ${iconColorClass}`} />
          </div>
          {badgeText && (
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${badgeClass}`}>
              {badgeText}
            </span>
          )}
        </div>
        <p className="text-2xl font-bold text-white leading-tight">Average items/100m</p>
        <div className="mt-1">
          <span className={`text-5xl font-bold ${accentClass}`}>
            {stats.percentDifference === 0 ? '—' : `${stats.percentDifference}%`} <span className="text-base font-semibold text-slate-200 mt-1">{avgLabel}</span>
          </span>
        </div>
      </div>

      {/* Bottom section */}
      <div className="relative z-10">
        <div className="space-y-1">
          <p className="text-sm text-slate-200">{getRankingText(stats)}</p>
          {!stats.isBestEver && !stats.isWorstEver && (() => {
            const midpoint = Math.ceil(stats.totalYears / 2)
            const isInBetterHalf = stats.ranking <= midpoint
            if (isInBetterHalf) {
              return (
                <p className="text-sm  text-slate-200">
                  Lowest Year: {stats.bestYear.value.toFixed(1)}/100m in {stats.bestYear.year}
                </p>
              )
            } else {
              return (
                <p className="text-sm text-slate-200">
                 Highest Year: {stats.worstYear.value.toFixed(1)}/100m in {stats.worstYear.year}
                </p>
              )
            }
          })()}
          {stats.isWorstEver && stats.totalYears > 1 && (
            <p className="text-sm text-slate-200">
              Previous low: {stats.bestYear.value.toFixed(1)}/100m in {stats.bestYear.year}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
